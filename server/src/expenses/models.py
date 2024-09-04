from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel, select

from src.database import AsyncSession


class ExpenseBase(SQLModel):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str
    description: str
    amount: int
    date: datetime
    category_id: UUID = Field(foreign_key="category.id")
    user_id: UUID = Field(foreign_key="user.id")


class Expense(ExpenseBase, table=True):
    @classmethod
    async def get_all(cls, db: AsyncSession, user_id: UUID):
        statement = select(Expense).where(Expense.user_id == user_id)
        expenses = await db.exec(statement)
        return expenses.all()
