from typing import Any

from litestar import get, post
from litestar.connection import Request
from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from litestar.controller import Controller
from litestar.di import Provide
from litestar.exceptions.http_exceptions import NotFoundException
from litestar.security.jwt.token import Token
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.models import User
from src.users.schemas import UserCreate, UserMeDetail
from src.utils.jwt import AuthUser


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

    @get("/me-detail")
    async def get_me_detail(self, repo: UserRepository, request: Request[AuthUser, Token, Any]) -> UserMeDetail:
        user = await repo.get(request.user.id)

        if not user:
            raise NotFoundException(detail="Signed in user not found")

        me = {
            "id": user.id,
            "email": user.email,
            "default_currency": user.default_currency,
            "name": user.name,
            "avatar_url": user.avatar_url,
        }

        return UserMeDetail.model_validate(me)
