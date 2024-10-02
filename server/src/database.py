from collections.abc import AsyncGenerator
from uuid import UUID

from advanced_alchemy.extensions.litestar.plugins.init.config import asyncio
from litestar.contrib.sqlalchemy.plugins import SQLAlchemyAsyncConfig
from litestar.exceptions import ClientException
from litestar.status_codes import HTTP_409_CONFLICT
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.models import Base
from src.settings import settings


class AuthUser(BaseModel):
    id: UUID
    email: str


async def provide_db(db_session: AsyncSession) -> AsyncGenerator[AsyncSession, None]:
    try:
        async with db_session.begin():
            yield db_session
    except IntegrityError as exc:
        raise ClientException(
            status_code=HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


db_config = SQLAlchemyAsyncConfig(
    connection_string=settings.DB_URL,
    metadata=Base.metadata,
    before_send_handler=asyncio.autocommit_before_send_handler,
)
