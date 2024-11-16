from datetime import date, datetime
from typing import Literal, get_args
from uuid import UUID

from sqlalchemy import DateTime, Enum, ForeignKey, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

Currencies = Literal[
    "USD",
    "EUR",
    "JPY",
    "GBP",
    "AUD",
    "CAD",
    "CHF",
    "CNY",
    "SEK",
    "NZD",
    "NOK",
    "KRW",
    "INR",
    "BRL",
    "RUB",
    "ZAR",
    "TRY",
    "MXN",
    "SGD",
    "HKD",
]


class Base(DeclarativeBase):
    id: Mapped[UUID] = mapped_column(server_default=func.gen_random_uuid(), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), server_onupdate=func.now()
    )


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


class Account(Base):
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


class Expense(Base):
    __tablename__ = "expense"
    title: Mapped[str]
    description: Mapped[str | None]
    amount: Mapped[int]
    date: Mapped[date]

    category: Mapped["Category"] = relationship(lazy="selectin", back_populates="expenses")
    category_id: Mapped[UUID] = mapped_column(ForeignKey("category.id"))
    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id"))


class Category(Base):
    __tablename__ = "category"
    name: Mapped[str]
    budget: Mapped[int]
    expenses: Mapped[list[Expense]] = relationship(lazy="selectin", back_populates="category")

    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id"))
