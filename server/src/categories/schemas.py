from uuid import UUID

from pydantic import BaseModel


class CategoryBase(BaseModel):
    name: str
    budget: int


class CategoryFull(CategoryBase):
    id: UUID
    spent: int


class CategoryCreate(CategoryBase):
    pass


class CategoryExpense(CategoryBase):
    id: UUID
