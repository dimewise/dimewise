from typing import Any

from litestar import get, patch, post
from litestar.connection import Request
from litestar.controller import Controller
from litestar.di import Provide
from litestar.exceptions.http_exceptions import ClientException, NotFoundException
from litestar.security.jwt.token import Token

from src.model.user import UserModel
from src.repository.user import UserRepository, provide_user_repo
from src.schema.user import AuthUser, UserCreate, UserEdit, UserPublic


class UserController(Controller):
    dependencies = {"user_repo": Provide(provide_user_repo)}
    path = "/users"

    @post("/register")
    async def create_user(self, user_repo: UserRepository, data: UserCreate) -> None:
        await user_repo.add(UserModel(**data.__dict__))
        await user_repo.session.commit()

    @get("/me-detail", tags=["me-detail"])
    async def get_me_detail(self, user_repo: UserRepository, request: Request[AuthUser, Token, Any]) -> UserPublic:
        user = await user_repo.get(request.user.id)

        if not user:
            raise NotFoundException(detail="Signed in user not found")

        me = {
            "id": user.id,
            "email": user.email,
            "default_currency": user.default_currency,
            "name": user.name,
            "avatar_url": user.avatar_url,
        }

        return UserPublic.model_validate(me)

    @patch("/me-detail", tags=["me-detail"])
    async def update_me_detail(
        self, user_repo: UserRepository, request: Request[AuthUser, Token, Any], data: UserEdit
    ) -> None:
        target_user = await user_repo.get(request.user.id)

        if not target_user:
            raise ClientException(detail="Signed in user not found")

        if data.name is not None and target_user.name is not None and data.name.strip() == "":
            raise ClientException(detail="Name of user cannot be empty if it is already set")

        if data.name is not None:
            target_user.name = data.name
        if data.avatar_url is not None:
            target_user.avatar_url = data.avatar_url

        await user_repo.update(target_user)
