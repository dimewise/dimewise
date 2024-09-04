from fastapi import APIRouter, Depends, FastAPI, Request

from src.categories import Category, CategoryFull
from src.database import get_db_session
from src.expenses import Expense, ExpensePublic
from src.settings import settings
from src.utils.jwt import JWTBearer

app = FastAPI()
pub = APIRouter(prefix="/api/v1")
prt = APIRouter(prefix="/api/v1", dependencies=[Depends(JWTBearer(settings.JWT_TOKEN)), Depends(get_db_session)])


@pub.get("/")
def root():
    return "Groot"


@prt.get("/categories", response_model=list[CategoryFull])
async def get_categories(request: Request):
    categories = await Category.get_all(request.state.db, request.state.user_id)
    return [CategoryFull(spent=spent or 0, **category.__dict__) for (category, spent) in categories]


@prt.get("/expenses/recent", response_model=list[ExpensePublic])
async def get_recent_expenses(request: Request):
    expenses = await Expense.get_all(request.state.db, request.state.user_id)
    return expenses


app.include_router(pub)
app.include_router(prt)
