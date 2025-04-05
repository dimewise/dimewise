from typing import get_args

from sqlalchemy import Enum
from sqlalchemy.orm import Mapped, mapped_column

from src.model.base import Base
from src.model.enum import CurrenciesEnum


class UserModel(Base):
    __tablename__ = "user"

    email: Mapped[str]
    name: Mapped[str | None]
    avatar_url: Mapped[str | None]
    default_currency: Mapped[CurrenciesEnum] = mapped_column(
        Enum(
            *get_args(CurrenciesEnum),
            name="currencies",
            create_constraint=True,
            validate_strings=True,
        )
    )
