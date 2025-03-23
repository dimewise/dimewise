from typing import Any
from uuid import UUID

from litestar.connection import ASGIConnection
from litestar.security.jwt import JWTAuth, Token

from src.core.settings import settings
from src.model.user import User
from src.schema.user import AuthUser


async def retrieve_user_handler(token: Token, _: ASGIConnection[Any, Any, Any, Any]) -> AuthUser:
    return AuthUser(id=UUID(token.sub), email=token.extras["email"])


jwt_auth = JWTAuth[User](
    retrieve_user_handler=retrieve_user_handler,
    token_secret=settings.jwt_token,
    exclude=["/schema", "/user/register"],  # TODO: Add here
)
