from collections.abc import AsyncGenerator

from fastapi import Request
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession

from src.settings import settings

async_engine = create_async_engine(settings.DB_URL, echo=True, future=True)


async def get_db_session(request: Request) -> AsyncGenerator[AsyncSession]:
    async_session = async_sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        request.state.db = session
        yield session
