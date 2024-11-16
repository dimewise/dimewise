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

from src.expenses.schemas import CategoryExpense, ExpenseCreate, ExpensePublic
from src.models import Expense
from src.utils.jwt import AuthUser


class ExpenseRepository(SQLAlchemyAsyncRepository[Expense]):  # pyright: ignore reportInvalidTypeArguments
    """Expense repository"""

    model_type = Expense


async def provide_repo(db_session: AsyncSession) -> ExpenseRepository:
    """Expense repository provider"""
    return ExpenseRepository(session=db_session)


class ExpenseController(Controller):
    dependencies = {"repo": Provide(provide_repo)}
    path = "/expense"

    @get()
    async def get_expenses(
        self, repo: ExpenseRepository, request: Request[AuthUser, Token, Any]
    ) -> list[ExpensePublic]:
        query = select(Expense).where(Expense.user_id == request.user.id)
        expenses = await repo.list(statement=query)
        expenses = [{**e.__dict__, "category": CategoryExpense(**e.category.__dict__)} for e in expenses]
        return [ExpensePublic(**e) for e in expenses]

    @post()
    async def create_expense(
        self, repo: ExpenseRepository, request: Request[AuthUser, Token, Any], data: ExpenseCreate
    ) -> None:
        await repo.add(Expense(user_id=request.user.id, **data.__dict__))
        await repo.session.commit()

    # @delete("/{category_id:uuid}")
    # async def delete_category(
    #     self, repo: ExpenseRepository, request: Request[AuthUser, Token, Any], category_id: UUID
    # ) -> None:
    #     await repo.delete_where(Expense.id == category_id, Expense.user_id == request.user.id)
    #
    # @patch("/{category_id:uuid}")
    # async def upate_category(
    #     self, repo: ExpenseRepository, request: Request[AuthUser, Token, Any], category_id: UUID, data: ExpenseCreate
    # ) -> None:
    #     category = Expense(id=category_id, user_id=request.user.id, **data.__dict__)
    #     await repo.update(category)
