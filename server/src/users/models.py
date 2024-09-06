from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel, select
from sqlmodel.ext.asyncio.session import AsyncSession


class UserBase(SQLModel):
    id: UUID = Field(default_factory=uuid4, primary_key=True)


class User(UserBase, table=True):
    @classmethod
    async def get(cls, db: AsyncSession, user_id: UUID):
        statement = select(User).where(User.id == user_id)
        user = await db.exec(statement)
        return user.first()
