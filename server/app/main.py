from fastapi import APIRouter, Depends, FastAPI, Request
from models import Category, Expense
from sqlmodel import Session, create_engine, select
from utils.jwt import JWTBearer

from app.settings import Settings

app = FastAPI()
pub = APIRouter(prefix="/api/v1")
prt = APIRouter(prefix="/api/v1", dependencies=[Depends(JWTBearer(Settings.JWT_TOKEN))])

engine = create_engine(Settings.DB_URL, echo=True)


@pub.get("/")
def root():
    return "Wow"


@prt.get("/categories", response_model="list[Category]")
def get_categories(request: Request):
    creds = request.state.creds
    with Session(engine) as session:
        categories = session.exec(select(Category).where(Category.userId == creds["sub"])).all()
        return categories


@prt.get("/expenses/recent", response_model="list[Expense]")
def get_recent_expenses(request: Request):
    creds = request.state.creds
    with Session(engine) as session:
        expenses = session.exec(select(Expense).where(Expense.userId == creds["sub"])).all()
        return expenses


app.include_router(pub)
app.include_router(prt)
