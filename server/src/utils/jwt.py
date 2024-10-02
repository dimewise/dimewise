from typing import Any
from uuid import UUID

from litestar.connection import ASGIConnection
from litestar.security.jwt import JWTAuth, Token

from src.database import AuthUser
from src.models import User
from src.settings import settings


async def retrieve_user_handler(token: Token, _: ASGIConnection[Any, Any, Any, Any]) -> AuthUser:
    return AuthUser(id=UUID(token.sub), email=token.extras["email"])


jwt_auth = JWTAuth[User](
    retrieve_user_handler=retrieve_user_handler,
    token_secret=settings.JWT_TOKEN,
    exclude=["/schema", "/user/register"],  # TODO: Add here
)
