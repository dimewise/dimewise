from uuid import UUID

from litestar.plugins.sqlalchemy import base
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column


class Category(base.UUIDBase):
    __tablename__ = "category"

    name: Mapped[str]
    budget: Mapped[int]

    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id"))
