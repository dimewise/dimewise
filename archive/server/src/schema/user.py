from uuid import UUID

from pydantic import Field

from src.model.enum import CurrenciesEnum
from src.schema.base import BaseModel


class AuthUser(BaseModel):
    id: UUID
    email: str


class UserBase(BaseModel):
    id: UUID
    name: str | None = None
    email: str
    avatar_url: str | None = None
    default_currency: CurrenciesEnum = Field(..., title="Default Currency")


class UserPublic(UserBase):
    class Config:
        title = "User"


class UserCreate(UserBase):
    pass


class UserEdit(BaseModel):
    name: str | None = None
    avatar_url: str | None = None
