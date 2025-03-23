from datetime import datetime
from typing import Any
from uuid import UUID

from litestar import delete, get, patch, post
from litestar.connection import Request
from litestar.controller import Controller
from litestar.di import Provide
from litestar.security.jwt.token import Token
from sqlalchemy import select

from src.model.expense import ExpenseModel
from src.repository.expense import ExpenseRepository, provide_expense_repo
from src.schema.expense import CategoryExpense, ExpenseCreate, ExpensePublic
from src.schema.user import AuthUser


class ExpenseController(Controller):
    dependencies = {"expense_repo": Provide(provide_expense_repo)}
    path = "/expenses"

    @get(tags=["transactions"])
    async def get_expenses(
        self,
        expense_repo: ExpenseRepository,
        request: Request[AuthUser, Token, Any],
        from_date: datetime | None = None,
        to_date: datetime | None = None,
        category_ids: list[UUID] | None = None,
    ) -> list[ExpensePublic]:
        query = select(ExpenseModel).where(ExpenseModel.user_id == request.user.id).order_by(ExpenseModel.date.desc())
        if from_date and to_date:
            query = query.where(ExpenseModel.date.between(from_date, to_date))
        if category_ids:
            query = query.where(ExpenseModel.category_id.in_(category_ids))
        expenses = await expense_repo.list(statement=query)
        expenses = [{**e.__dict__, "category": CategoryExpense(**e.category.__dict__)} for e in expenses]
        return [ExpensePublic(**e) for e in expenses]

    @post(tags=["transactions"])
    async def create_expense(
        self, expense_repo: ExpenseRepository, request: Request[AuthUser, Token, Any], data: ExpenseCreate
    ) -> None:
        await expense_repo.add(ExpenseModel(user_id=request.user.id, **data.__dict__))
        await expense_repo.session.commit()

    @delete("/{expense_id:uuid}", tags=["transactions"])
    async def delete_expense(
        self, expense_repo: ExpenseRepository, request: Request[AuthUser, Token, Any], expense_id: UUID
    ) -> None:
        await expense_repo.delete_where(ExpenseModel.id == expense_id, ExpenseModel.user_id == request.user.id)

    @patch("/{expense_id:uuid}", tags=["transactions"])
    async def update_expense(
        self,
        expense_repo: ExpenseRepository,
        request: Request[AuthUser, Token, Any],
        expense_id: UUID,
        data: ExpenseCreate,
    ) -> None:
        expense = ExpenseModel(id=expense_id, user_id=request.user.id, **data.__dict__)
        await expense_repo.update(expense)
