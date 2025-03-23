from collections.abc import AsyncGenerator

from advanced_alchemy.extensions.litestar.plugins.init.config import asyncio
from litestar.contrib.sqlalchemy.plugins import SQLAlchemyAsyncConfig
from litestar.exceptions import ClientException
from litestar.status_codes import HTTP_409_CONFLICT
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.core.settings import settings
from src.models.base import Base


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
    connection_string=settings.db_url,
    metadata=Base.metadata,
    before_send_handler=asyncio.autocommit_before_send_handler,
)
