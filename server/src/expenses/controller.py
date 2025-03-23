from datetime import datetime
from typing import Any
from uuid import UUID

from litestar import delete, get, patch, post
from litestar.connection import Request
from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from litestar.controller import Controller
from litestar.di import Provide
from litestar.security.jwt.token import Token
from sqlalchemy import select
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.models.expense import Expense
from src.schemas.expense import CategoryExpense, ExpenseCreate, ExpensePublic
from src.schemas.user import AuthUser


class ExpenseRepository(SQLAlchemyAsyncRepository[Expense]):  # pyright: ignore reportInvalidTypeArguments
    """Expense repository"""

    model_type = Expense


async def provide_repo(db_session: AsyncSession) -> ExpenseRepository:
    """Expense repository provider"""
    return ExpenseRepository(session=db_session)


class ExpenseController(Controller):
    dependencies = {"repo": Provide(provide_repo)}
    path = "/expense"

    @get(tags=["transactions"])
    async def get_expenses(
        self,
        repo: ExpenseRepository,
        request: Request[AuthUser, Token, Any],
        from_date: datetime | None = None,
        to_date: datetime | None = None,
        category_ids: list[UUID] | None = None,
    ) -> list[ExpensePublic]:
        query = select(Expense).where(Expense.user_id == request.user.id).order_by(Expense.date.desc())
        if from_date and to_date:
            query = query.where(Expense.date.between(from_date, to_date))
        if category_ids:
            query = query.where(Expense.category_id.in_(category_ids))
        expenses = await repo.list(statement=query)
        expenses = [{**e.__dict__, "category": CategoryExpense(**e.category.__dict__)} for e in expenses]
        return [ExpensePublic(**e) for e in expenses]

    @post(tags=["transactions"])
    async def create_expense(
        self, repo: ExpenseRepository, request: Request[AuthUser, Token, Any], data: ExpenseCreate
    ) -> None:
        await repo.add(Expense(user_id=request.user.id, **data.__dict__))
        await repo.session.commit()

    @delete("/{expense_id:uuid}", tags=["transactions"])
    async def delete_expense(
        self, repo: ExpenseRepository, request: Request[AuthUser, Token, Any], expense_id: UUID
    ) -> None:
        await repo.delete_where(Expense.id == expense_id, Expense.user_id == request.user.id)

    @patch("/{expense_id:uuid}", tags=["transactions"])
    async def update_expense(
        self, repo: ExpenseRepository, request: Request[AuthUser, Token, Any], expense_id: UUID, data: ExpenseCreate
    ) -> None:
        expense = Expense(id=expense_id, user_id=request.user.id, **data.__dict__)
        await repo.update(expense)
