from datetime import date
from uuid import UUID

from pydantic import BaseModel


class ExpenseBase(BaseModel):
    id: UUID
    title: str
    description: str | None
    amount: int
    date: date


class ExpensePublic(ExpenseBase):
    class Config:
        title = "Expense"
