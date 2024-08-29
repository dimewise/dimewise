from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class Category(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True, exclude=True)
    uuid: UUID = Field(default_factory=uuid4, unique=True)
    name: str
    budget: int
    userId: str = Field(foreign_key="user.uuid")


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True, exclude=True)
    uuid: UUID = Field(default_factory=uuid4, unique=True)


class Expense(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True, exclude=True)
    uuid: UUID = Field(default_factory=uuid4, unique=True)
    title: str
    description: str
    amount: int
    date: datetime
    categoryId: UUID = Field(foreign_key="category.uuid")
    userId: str = Field(foreign_key="user.uuid")
