from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel, delete, func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.expenses import Expense

# -- Database models


class CategoryWithoutIds(SQLModel):
    name: str
    budget: int


class CategoryBase(CategoryWithoutIds):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id")


# -- Response models


class CategoryFull(CategoryBase):
    id: UUID
    spent: int


class CategoryPost(CategoryWithoutIds):
    pass


# -- Service


class Category(CategoryBase, table=True):
    @classmethod
    async def get_all(cls, db: AsyncSession, user_id: UUID) -> list[CategoryFull]:
        statement = (
            select(Category, func.sum(Expense.amount))
            .join(Expense, isouter=True)
            .where(Category.user_id == user_id)
            .group_by(Category.id)
        )
        categories = await db.exec(statement)
        return [CategoryFull(spent=spent or 0, **category.__dict__) for (category, spent) in categories.all()]

    @classmethod
    async def create(cls, db: AsyncSession, user_id: UUID, category: CategoryPost):
        db.add(Category(user_id=user_id, **category.__dict__))
        await db.commit()

    @classmethod
    async def delete(cls, db: AsyncSession, user_id: UUID, category_id: UUID):
        statement = delete(Category).where(Category.user_id == user_id, Category.id == category_id)
        await db.exec(statement)
        await db.commit()
