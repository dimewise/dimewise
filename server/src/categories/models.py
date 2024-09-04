from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel, func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.expenses import Expense


class CategoryBase(SQLModel):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    budget: int
    user_id: UUID = Field(foreign_key="user.id")


class Category(CategoryBase, table=True):
    @classmethod
    async def get_all(cls, db: AsyncSession, user_id: UUID):
        statement = (
            select(Category, func.sum(Expense.amount))
            .join(Expense, isouter=True)
            .where(Category.user_id == user_id)
            .group_by(Category.id)
        )
        categories = await db.exec(statement)
        return categories.all()
