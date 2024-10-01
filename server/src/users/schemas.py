from uuid import UUID

from pydantic import BaseModel

from src.models import Currencies


class UserBase(BaseModel):
    id: UUID
    email: str
    default_currency: Currencies


class UserCreate(UserBase):
    pass
