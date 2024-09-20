from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.expenses.schemas import ExpensePublic
from src.models import Expense


class ExpenseService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, user_id: UUID) -> list[ExpensePublic]:
        query = select(Expense).where(Expense.user_id == user_id)
        print("q", query)
        expenses = (await self.db.scalars(query)).all()
        print("wow", expenses[0].__dict__)

        return [ExpensePublic(**expense.__dict__) for expense in expenses]
