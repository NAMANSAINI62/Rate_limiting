from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config.settings import settings
from app.database.base import get_db
from app.models.user import User
from app.schemas.token import TokenPayload
jwt_bearer = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials=Depends(jwt_bearer), db: AsyncSession=Depends(get_db)) -> User:
    token = credentials.credentials
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate credentials', headers={'WWW-Authenticate': 'Bearer'})
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get('sub')
        if user_id is None:
            raise credentials_exception
        token_data = TokenPayload(sub=user_id, role=payload.get('role', 'user'), exp=payload.get('exp', 0))
    except JWTError:
        raise credentials_exception
    result = await db.execute(select(User).filter(User.id == int(token_data.sub)))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user

def require_role(allowed_roles: list[str]):

    async def role_checker(current_user: User=Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f'Operation not permitted. Required role: {allowed_roles}')
        return current_user
    return role_checker