from src.expenses.models import ExpenseBase


class ExpensePublic(ExpenseBase):
    class Config:
        title = "Expense"
