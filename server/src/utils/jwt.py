from fastapi import HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt


class JWTBearer(HTTPBearer):
    def __init__(self, secret: str):
        super().__init__(auto_error=True)
        self.secret = secret

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials | None = await super().__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=401, detail="Invalid authentication scheme.")
            decoded = self.verify_jwt(credentials.credentials)
            if not decoded:
                raise HTTPException(status_code=401, detail="Invalid credentials.")
            request.state.user_id = decoded["sub"]
            return credentials
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    def verify_jwt(self, jwtoken: str) -> dict:
        try:
            return jwt.decode(
                jwtoken,
                self.secret,
                algorithms=["HS256"],
                audience="authenticated",
            )
        except JWTError:
            return {}
