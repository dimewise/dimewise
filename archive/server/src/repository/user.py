from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.model.user import UserModel


class UserRepository(SQLAlchemyAsyncRepository[UserModel]):
    """User repository"""

    model_type = UserModel


async def provide_user_repo(db_session: AsyncSession) -> UserRepository:
    """User repository provider"""
    return UserRepository(session=db_session)
