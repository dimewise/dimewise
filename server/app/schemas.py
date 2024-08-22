import uuid
from datetime import datetime

from pydantic import BaseModel


class Category(BaseModel):
    id: uuid.UUID
    name: str
    budget: int


class Expense(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    amount: int
    date: datetime
    category_id: uuid.UUID
