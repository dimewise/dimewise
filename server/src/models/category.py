from uuid import UUID

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import Base


class Category(Base):
    __tablename__ = "category"
    name: Mapped[str]
    budget: Mapped[int]

    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id"))
