from typing import get_args
from uuid import UUID

from sqlalchemy import Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from src.model.base import Base
from src.model.enum import CurrenciesEnum


class AccountModel(Base):
    __tablename__ = "account"

    name: Mapped[str]
    description: Mapped[str | None]
    currency: Mapped[CurrenciesEnum] = mapped_column(
        Enum(
            *get_args(CurrenciesEnum),
            name="currencies",
            create_constraint=True,
            validate_strings=True,
        )
    )

    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id"))
