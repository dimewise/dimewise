from litestar import Litestar, get
from litestar.contrib.sqlalchemy.plugins import SQLAlchemyPlugin
from litestar.openapi.config import OpenAPIConfig
from litestar.openapi.plugins import YamlRenderPlugin

from src.categories.controller import CategoryController
from src.core.database import db_config, provide_db
from src.core.settings import settings
from src.expenses.controller import ExpenseController
from src.users.controller import UserController
from src.utils.jwt import jwt_auth


@get("/")
async def root() -> str:
    return "Groot"


app = Litestar(
    debug=True,
    path="/api/v1",
    route_handlers=[root, CategoryController, UserController, ExpenseController],
    on_app_init=[jwt_auth.on_app_init],
    dependencies={"db": provide_db},
    plugins=[SQLAlchemyPlugin(db_config)],
    openapi_config=OpenAPIConfig(
        title="Dimewise", version=settings.app_api_version, render_plugins=[YamlRenderPlugin()]
    ),
)
