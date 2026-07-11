from fastapi import Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from typing import Optional

from app.config.settings import settings
optional_jwt_bearer = HTTPBearer(auto_error=False)

async def get_client_identifier(request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_jwt_bearer)) -> str:
    client_ip = request.client.host if request.client else "127.0.0.1"

    if credentials:
        try:
            token = credentials.credentials
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id = payload.get("sub")
            if user_id:
                return f"user:{user_id}"
        except JWTError:
            pass
    return f"ip:{client_ip}"
