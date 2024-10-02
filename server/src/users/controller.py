from litestar import post
from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from litestar.controller import Controller
from litestar.di import Provide
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.models import User
from src.users.schemas import UserCreate


class UserRepository(SQLAlchemyAsyncRepository[User]):  # pyright: ignore reportInvalidTypeArguments
    """User repository"""

    model_type = User


async def provide_repo(db_session: AsyncSession) -> UserRepository:
    """User repository provider"""
    return UserRepository(session=db_session)


class UserController(Controller):
    dependencies = {"repo": Provide(provide_repo)}
    path = "/user"

    @post("/register")
    async def create_user(self, repo: UserRepository, data: UserCreate) -> None:
        await repo.add(User(**data.__dict__))
        await repo.session.commit()
