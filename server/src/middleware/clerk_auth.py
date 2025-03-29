from clerk_backend_api import Clerk
from clerk_backend_api.jwks_helpers import AuthenticateRequestOptions
from litestar.connection import Request
from litestar.enums import ScopeType
from litestar.exceptions import NotAuthorizedException
from litestar.middleware.base import ASGIMiddleware
from litestar.types import ASGIApp, Receive, Scope, Send

from src.core.settings import settings

clerk = Clerk(bearer_auth=settings.clerk_secret_key)


class ClerkAuthMiddleware(ASGIMiddleware):
    scopes = (ScopeType.HTTP, ScopeType.ASGI)

    async def handle(self, scope: Scope, receive: Receive, send: Send, next_app: ASGIApp) -> None:
        """Middleware to authenticate users using Clerk"""
        # if scope["type"] != "http":
        #     await next_app(scope, receive, send)
        #     return

        request = Request(scope, receive)

        # Authenticate request using Clerk
        request_state = clerk.authenticate_request(
            request, AuthenticateRequestOptions(authorized_parties=["https://example.com"])
        )

        if not request_state.is_signed_in:
            err = "Authentication failed"
            raise NotAuthorizedException(err)

        # Continue request processing
        await next_app(scope, receive, send)
