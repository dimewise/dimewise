from uuid import UUID

from fastapi import APIRouter, Depends, FastAPI, Request

from src.categories import Category, CategoryFull, CategoryPatch, CategoryPost
from src.database import get_db_session
from src.expenses import Expense, ExpensePublic
from src.settings import settings
from src.users import User
from src.utils.jwt import JWTBearer

app = FastAPI()
pub = APIRouter(prefix="/api/v1")
prt = APIRouter(prefix="/api/v1", dependencies=[Depends(JWTBearer(settings.JWT_TOKEN)), Depends(get_db_session)])


@pub.get("/")
def root():
    return "Groot"


@prt.get("/categories", response_model=list[CategoryFull])
async def get_categories(req: Request):
    categories = await Category.get_all(req.state.db, req.state.user_id)
    return categories


@prt.post("/category")
async def create_category(req: Request, category: CategoryPost):
    await Category.create(req.state.db, req.state.user_id, category)


@prt.delete("/category/{category_id}")
async def delete_category(req: Request, category_id: UUID):
    await Category.delete(req.state.db, req.state.user_id, category_id)


@prt.patch("/category/{category_id}")
async def update_category(req: Request, category_id: UUID, category: CategoryPatch):
    await Category.update(req.state.db, req.state.user_id, category_id, category)


@prt.get("/expenses/recent", response_model=list[ExpensePublic])
async def get_recent_expenses(req: Request):
    expenses = await Expense.get_all(req.state.db, req.state.user_id)
    return expenses


app.include_router(pub)
app.include_router(prt)
