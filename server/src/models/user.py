from typing import get_args

from sqlalchemy import Enum
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import Base
from src.models.enum import Currencies


class User(Base):
    __tablename__ = "user"
    email: Mapped[str]
    name: Mapped[str | None]
    avatar_url: Mapped[str | None]
    default_currency: Mapped[Currencies] = mapped_column(
        Enum(
            *get_args(Currencies),
            name="currencies",
            create_constraint=True,
            validate_strings=True,
        )
    )
