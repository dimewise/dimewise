from fastapi import APIRouter, Depends, FastAPI, Request, status
from fastapi.openapi.utils import get_openapi
from gotrue import VerifyTokenHashParams
from pydantic import BaseModel
from supabase import Client, create_client

from models import Category, Expense
from settings import settings
from utils.jwt import JWTBearer

app = FastAPI()
pub = APIRouter()
prt = APIRouter(dependencies=[Depends(JWTBearer(settings.SUPABASE_JWT))])

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


def custom_openapi():
    openapi_schema = get_openapi(
        title="Dimewise", routes=app.routes, version="3.0.1", openapi_version="3.0.1"
    )
    app.openapi_schema = openapi_schema
    return app.openapi_schema


# app.openapi = custom_openapi


class SignInUpRequest(BaseModel):
    email: str
    password: str


class VerifyRequest(BaseModel):
    token: str


@pub.get("/")
def root():
    return "Wow"


@prt.get("/categories")
def get_categories(request: Request) -> list[Category]:
    creds = request.state.creds
    categories = (
        supabase.table("Category").select("*").eq("userId", creds["sub"]).execute()
    ).data
    return [
        Category(
            id=category.get("uuid"),
            budget=category.get("budget"),
            name=category.get("name"),
        )
        for category in categories
    ]


@prt.get("/expenses/recent")
def get_recent_expenses(request: Request) -> list[Expense]:
    creds = request.state.creds
    expenses = (
        supabase.table("Expense")
        .select("*")
        .eq("userId", creds["sub"])
        .order("date")
        .limit(10)
        .execute()
    ).data
    return [
        Expense(
            id=expense.get("uuid"),
            title=expense.get("title"),
            description=expense.get("description"),
            amount=expense.get("amount"),
            date=expense.get("date"),
            category_id=expense.get("categoryId"),
        )
        for expense in expenses
    ]


@pub.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(req: SignInUpRequest):
    user = supabase.auth.sign_up({"email": req.email, "password": req.password})
    print(user)


@pub.post("/signin", status_code=status.HTTP_201_CREATED)
def signin(req: SignInUpRequest):
    user = supabase.auth.sign_in_with_password(
        {"email": req.email, "password": req.password}
    )
    print(user)


@pub.post("/verify", status_code=status.HTTP_201_CREATED)
def verify(req: VerifyRequest):
    res = supabase.auth.verify_otp(
        VerifyTokenHashParams(token_hash=req.token, type="signup")
    )
    print(res)


app.include_router(pub)
app.include_router(prt)
