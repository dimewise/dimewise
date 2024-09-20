from uuid import UUID

from pydantic import BaseModel


class UserBase(BaseModel):
    id: UUID
    email: str
    default_currency: str


class UserCreate(UserBase):
    pass
