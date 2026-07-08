from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.base import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.schemas.token import Token
from app.services.auth_service import create_user, authenticate_user
from app.core.security import create_access_token
router = APIRouter(prefix='/auth', tags=['Authentication'])

@router.post('/signup', response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_in: UserCreate, db: AsyncSession=Depends(get_db)):
    user = await create_user(db, user_in, role='user')
    return user

@router.post('/login', response_model=Token)
async def login(user_in: UserLogin, db: AsyncSession=Depends(get_db)):
    user = await authenticate_user(db, email=user_in.email, password=user_in.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Incorrect email or password', headers={'WWW-Authenticate': 'Bearer'})
    token_payload = {'sub': str(user.id), 'role': user.role}
    access_token = create_access_token(data=token_payload)
    return {'access_token': access_token, 'token_type': 'bearer', 'user': {'id': user.id, 'username': user.username, 'role': user.role}}