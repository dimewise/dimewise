from fastapi import APIRouter, Depends, FastAPI, Request
from sqlmodel import Session, create_engine, func, select

from app.models import Category, CategoryFull, Expense, ExpensePublic
from app.settings import settings
from app.utils.jwt import JWTBearer

app = FastAPI()
pub = APIRouter(prefix="/api/v1")
prt = APIRouter(prefix="/api/v1", dependencies=[Depends(JWTBearer(settings.JWT_TOKEN))])

engine = create_engine(settings.DB_URL, echo=True)


@pub.get("/")
def root():
    return "Wow"


@prt.get("/categories", response_model=list[CategoryFull])
def get_categories(request: Request):
    creds = request.state.creds
    with Session(engine) as session:
        categories = session.exec(
            select(Category, func.sum(Expense.amount))
            .join(Expense)
            .where(Category.userId == creds["sub"])
            .group_by(Category.id)
        ).all()
        return [CategoryFull(spent=spent, **category.__dict__) for (category, spent) in categories]


@prt.get("/expenses/recent", response_model=list[ExpensePublic])
def get_recent_expenses(request: Request):
    creds = request.state.creds
    with Session(engine) as session:
        expenses = session.exec(select(Expense).where(Expense.userId == creds["sub"])).all()
        return expenses


app.include_router(pub)
app.include_router(prt)
