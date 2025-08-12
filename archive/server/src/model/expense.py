from datetime import date
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.model.base import Base

if TYPE_CHECKING:
    from src.model.category import CategoryModel


class ExpenseModel(Base):
    __tablename__ = "expense"

    title: Mapped[str]
    description: Mapped[str | None]
    amount: Mapped[int]
    date: Mapped[date]

    category: Mapped["CategoryModel"] = relationship(lazy="selectin")
    category_id: Mapped[UUID] = mapped_column(ForeignKey("category.id"))
    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id"))
