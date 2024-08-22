from fastapi import HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt


class JWTBearer(HTTPBearer):
    def __init__(self, secret: str, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)
        self.secret = secret

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials | None = await super(
            JWTBearer, self
        ).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(
                    status_code=401, detail="Invalid authentication scheme."
                )
            decoded = self.verify_jwt(credentials.credentials)
            if not decoded:
                raise HTTPException(status_code=401, detail="Invalid credentials.")
            request.state.creds = decoded
            return credentials
        else:
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
