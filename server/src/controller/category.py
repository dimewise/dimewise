from collections import defaultdict
from datetime import datetime
from typing import Any
from uuid import UUID

from litestar import delete, get, patch, post
from litestar.connection import Request
from litestar.controller import Controller
from litestar.di import Provide
from litestar.security.jwt.token import Token
from sqlalchemy import func, select

from src.model.category import CategoryModel
from src.model.expense import ExpenseModel
from src.repository.category import CategoryRepository, provide_category_repo
from src.schema.category import CategoryCreate, CategoryFull, CategoryOverview
from src.utils.jwt import AuthUser


class CategoryController(Controller):
    dependencies = {"category_repo": Provide(provide_category_repo)}
    path = "/categories"

    @get()
    async def get_categories(
        self,
        category_repo: CategoryRepository,
        request: Request[AuthUser, Token, Any],
        from_date: datetime | None = None,
        to_date: datetime | None = None,
    ) -> list[CategoryFull]:
        subquery = select(ExpenseModel.category_id, func.sum(ExpenseModel.amount).label("spent")).group_by(
            ExpenseModel.category_id
        )
        if from_date and to_date:
            subquery = subquery.where(ExpenseModel.date.between(from_date, to_date))
        subquery = subquery.subquery()

        query = (
            select(CategoryModel, subquery.c.spent)
            .outerjoin(subquery, subquery.c.category_id == CategoryModel.id)
            .where(CategoryModel.user_id == request.user.id)
            .group_by(CategoryModel.id, subquery.c.spent)
        )
        categories = await category_repo.session.execute(statement=query)

        return [CategoryFull(**c.__dict__, spent=spent or 0) for c, spent in categories]

    @get("/overview_year")
    async def get_categories_per_month(
        self,
        category_repo: CategoryRepository,
        request: Request[AuthUser, Token, Any],
        from_date: datetime,
        to_date: datetime,
    ) -> CategoryOverview:
        query = (
            select(CategoryModel, func.extract("month", ExpenseModel.date), func.sum(ExpenseModel.amount))
            .outerjoin(ExpenseModel)
            .where(CategoryModel.user_id == request.user.id, ExpenseModel.date.between(from_date, to_date))
            .group_by(CategoryModel.id, func.extract("month", ExpenseModel.date))
            .order_by(func.extract("month", ExpenseModel.date))
        )
        categories_per_month = await category_repo.session.execute(statement=query)

        query = select(CategoryModel.name, CategoryModel.budget).where(CategoryModel.user_id == request.user.id)
        categories = (await category_repo.session.execute(query)).fetchall()

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
        self, category_repo: CategoryRepository, request: Request[AuthUser, Token, Any], data: CategoryCreate
    ) -> None:
        await category_repo.add(CategoryModel(user_id=request.user.id, **data.__dict__))
        await category_repo.session.commit()

    @delete("/{category_id:uuid}")
    async def delete_category(
        self, category_repo: CategoryRepository, request: Request[AuthUser, Token, Any], category_id: UUID
    ) -> None:
        await category_repo.delete_where(CategoryModel.id == category_id, CategoryModel.user_id == request.user.id)

    @patch("/{category_id:uuid}")
    async def update_category(
        self,
        category_repo: CategoryRepository,
        request: Request[AuthUser, Token, Any],
        category_id: UUID,
        data: CategoryCreate,
    ) -> None:
        category = CategoryModel(id=category_id, user_id=request.user.id, **data.__dict__)
        await category_repo.update(category)
