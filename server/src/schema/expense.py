from datetime import date, datetime
from uuid import UUID

from src.schema.base import BaseModel
from src.schema.category import CategoryExpense


class ExpenseBase(BaseModel):
    title: str
    description: str | None
    amount: int
    date: date
    created_at: datetime


class ExpensePublic(ExpenseBase):
    id: UUID
    category: CategoryExpense

    class Config:
        title = "Expense"


class ExpenseCreate(ExpenseBase):
    category_id: UUID
