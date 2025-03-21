from collections import defaultdict
from datetime import datetime
from typing import Any
from uuid import UUID

from litestar import delete, get, patch, post
from litestar.connection import Request
from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from litestar.controller import Controller
from litestar.di import Provide
from litestar.security.jwt.token import Token
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.categories.schemas import CategoryCreate, CategoryFull, CategoryOverview
from src.models.category import Category
from src.models.expense import Expense
from src.utils.jwt import AuthUser


class CategoryRepository(SQLAlchemyAsyncRepository[Category]):  # pyright: ignore reportInvalidTypeArguments
    """Category repository"""

    model_type = Category


async def provide_repo(db_session: AsyncSession) -> CategoryRepository:
    """Category repository provider"""
    return CategoryRepository(session=db_session)


class CategoryController(Controller):
    dependencies = {"repo": Provide(provide_repo)}
    path = "/category"

    @get()
    async def get_categories(
        self,
        repo: CategoryRepository,
        request: Request[AuthUser, Token, Any],
        from_date: datetime | None = None,
        to_date: datetime | None = None,
    ) -> list[CategoryFull]:
        subquery = select(Expense.category_id, func.sum(Expense.amount).label("spent")).group_by(Expense.category_id)
        if from_date and to_date:
            subquery = subquery.where(Expense.date.between(from_date, to_date))
        subquery = subquery.subquery()

        query = (
            select(Category, subquery.c.spent)
            .outerjoin(subquery, subquery.c.category_id == Category.id)
            .where(Category.user_id == request.user.id)
            .group_by(Category.id, subquery.c.spent)
        )
        categories = await repo.session.execute(statement=query)

        return [CategoryFull(**c.__dict__, spent=spent or 0) for c, spent in categories]

    @get("/overview_year")
    async def get_categories_per_month(
        self,
        repo: CategoryRepository,
        request: Request[AuthUser, Token, Any],
        from_date: datetime,
        to_date: datetime,
    ) -> CategoryOverview:
        query = (
            select(Category, func.extract("month", Expense.date), func.sum(Expense.amount))
            .outerjoin(Expense)
            .where(Category.user_id == request.user.id, Expense.date.between(from_date, to_date))
            .group_by(Category.id, func.extract("month", Expense.date))
            .order_by(func.extract("month", Expense.date))
        )
        categories_per_month = await repo.session.execute(statement=query)

        query = select(Category.name, Category.budget).where(Category.user_id == request.user.id)
        categories = (await repo.session.execute(query)).fetchall()

        months = defaultdict(lambda: [0] * 12)
        for category, month, spent in categories_per_month:
            months[category.name][int(month) - 1] = spent

        # If any categories are missing due to no expenses, init them
        for name, _ in categories:
            if name not in months:
                months[name]

        return CategoryOverview(months=months, budget=sum(budget for _, budget in categories))

    @post()
    async def create_category(
        self, repo: CategoryRepository, request: Request[AuthUser, Token, Any], data: CategoryCreate
    ) -> None:
        await repo.add(Category(user_id=request.user.id, **data.__dict__))
        await repo.session.commit()

    @delete("/{category_id:uuid}")
    async def delete_category(
        self, repo: CategoryRepository, request: Request[AuthUser, Token, Any], category_id: UUID
    ) -> None:
        await repo.delete_where(Category.id == category_id, Category.user_id == request.user.id)

    @patch("/{category_id:uuid}")
    async def update_category(
        self, repo: CategoryRepository, request: Request[AuthUser, Token, Any], category_id: UUID, data: CategoryCreate
    ) -> None:
        category = Category(id=category_id, user_id=request.user.id, **data.__dict__)
        await repo.update(category)
