from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.model.expense import ExpenseModel


class ExpenseRepository(SQLAlchemyAsyncRepository[ExpenseModel]):
    """Expense repository"""

    model_type = ExpenseModel


async def provide_expense_repo(db_session: AsyncSession) -> ExpenseRepository:
    """Expense repository provider"""
    return ExpenseRepository(session=db_session)
