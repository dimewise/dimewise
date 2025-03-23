from datetime import date
from uuid import UUID

from pydantic import BaseModel

from src.schemas.category import CategoryExpense


class ExpenseBase(BaseModel):
    title: str
    description: str | None
    amount: int
    date: date


class ExpensePublic(ExpenseBase):
    id: UUID
    category: CategoryExpense

    class Config:
        title = "Expense"


class ExpenseCreate(ExpenseBase):
    category_id: UUID
