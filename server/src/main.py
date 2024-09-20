from litestar import Litestar, get
from litestar.contrib.sqlalchemy.plugins import SQLAlchemyPlugin
from litestar.openapi.config import OpenAPIConfig
from litestar.openapi.plugins import YamlRenderPlugin

from src.categories.controller import CategoryController
from src.database import db_config, provide_db
from src.settings import settings
from src.utils.jwt import jwt_auth


@get("/")
async def root() -> str:
    return "Groot"


# @get("/expenses/recent", response_model=list[ExpensePublic])
# async def get_recent_expenses(req: Request):
#     expenses = await Expense.get_all(req.state.db, req.state.user_id)
#     return expenses


app = Litestar(
    debug=True,
    path="/api/v1",
    route_handlers=[root, CategoryController],
    on_app_init=[jwt_auth.on_app_init],
    dependencies={"db": provide_db},
    plugins=[SQLAlchemyPlugin(db_config)],
    openapi_config=OpenAPIConfig(title="Dimewise", version=settings.VERSION, render_plugins=[YamlRenderPlugin()]),
)
