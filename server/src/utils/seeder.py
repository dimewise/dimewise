import asyncio
from datetime import date
from sys import argv
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from src.core.settings import settings
from src.models.category import Category
from src.models.expense import Expense
from src.models.user import User


async def main():
    engine = create_async_engine(settings.db_url, echo=True)
    session = async_sessionmaker(bind=engine)

    async with session() as s:
        try:
            user_id = argv[1]
        except IndexError:
            msg = (
                f"Please provide an user id for which the items will be created for.\n"
                f"Examples:\n"
                f"\tWith taskfile: task db:seed USER_ID={uuid4()}\n"
                f"\tWith python: python -m seeder {uuid4()}"
            )
            raise Exception(msg) from None
        u = (await s.execute(select(User).where(User.id == user_id))).one()[0]
        c1 = Category(id=uuid4(), user_id=u.id, name="Groceries", budget=26000)
        c2 = Category(id=uuid4(), user_id=u.id, name="Health", budget=17000)
        e1 = Expense(category_id=c1.id, user_id=u.id, title="FamilyMart", amount=400, date=date(2024, 9, 9))
        e2 = Expense(category_id=c1.id, user_id=u.id, title="Hanamasa", amount=1500, date=date(2024, 9, 8))
        e3 = Expense(category_id=c1.id, user_id=u.id, title="MyBasket", amount=1300, date=date(2024, 9, 8))
        e4 = Expense(category_id=c2.id, user_id=u.id, title="Gym", amount=8000, date=date(2024, 9, 5))
        e5 = Expense(category_id=c2.id, user_id=u.id, title="Vitamins", amount=6000, date=date(2024, 9, 4))
        e6 = Expense(category_id=c2.id, user_id=u.id, title="Protein", amount=6900, date=date(2024, 9, 5))
        items = [c1, c2, e1, e2, e3, e4, e5, e6]
        for item in items:
            s.add(item)
        await s.commit()


if __name__ == "__main__":
    asyncio.run(main())
