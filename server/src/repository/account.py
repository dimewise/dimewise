from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.model.account import AccountModel


class AccountRepository(SQLAlchemyAsyncRepository[AccountModel]):
    """Account repository"""

    model_type = AccountModel


async def provide_account_repo(db_session: AsyncSession) -> AccountRepository:
    """Account repository provider"""
    return AccountRepository(session=db_session)
