from typing import get_args
from uuid import UUID

from litestar.plugins.sqlalchemy import base
from sqlalchemy import Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from src.models.enum import Currencies


class Account(base.UUIDAuditBase):
    __tablename__ = "account"

    name: Mapped[str]
    description: Mapped[str | None]
    currency: Mapped[Currencies] = mapped_column(
        Enum(
            *get_args(Currencies),
            name="currencies",
            create_constraint=True,
            validate_strings=True,
        )
    )

    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id"))
