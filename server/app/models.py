from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class CategoryBase(SQLModel):
    uuid: UUID = Field(default_factory=uuid4, unique=True)
    name: str
    budget: int
    userId: str = Field(foreign_key="user.uuid")


class Category(CategoryBase, table=True):
    id: int = Field(default=None, primary_key=True)


class CategoryFull(CategoryBase):
    spent: int


class User(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True, exclude=True)
    uuid: UUID = Field(default_factory=uuid4, unique=True)


class ExpenseBase(SQLModel):
    uuid: UUID = Field(default_factory=uuid4, unique=True)
    title: str
    description: str
    amount: int
    date: datetime
    categoryId: UUID = Field(foreign_key="category.uuid")
    userId: str = Field(foreign_key="user.uuid")


class Expense(ExpenseBase, table=True):
    id: int = Field(default=None, primary_key=True, exclude=True)


class ExpensePublic(ExpenseBase):
    class Config:
        title = "Expense"
