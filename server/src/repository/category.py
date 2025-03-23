from litestar.contrib.sqlalchemy.repository import SQLAlchemyAsyncRepository
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.model.category import CategoryModel


class CategoryRepository(SQLAlchemyAsyncRepository[CategoryModel]):
    """Category repository"""

    model_type = CategoryModel


async def provide_category_repo(db_session: AsyncSession) -> CategoryRepository:
    """Category repository provider"""
    return CategoryRepository(session=db_session)
