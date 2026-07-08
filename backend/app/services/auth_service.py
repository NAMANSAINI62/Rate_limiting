from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password

async def create_user(db: AsyncSession, user_in: UserCreate, role: str='user') -> User:

    result = await db.execute(select(User).filter(User.email == user_in.email))

    if result.scalars().first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='A user with this email already exists.')
    result = await db.execute(select(User).filter(User.username == user_in.username))

    if result.scalars().first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='This username is already taken.')
    
    hashed_password = get_password_hash(user_in.password)

    db_user = User(username=user_in.username, email=user_in.email, hashed_password=hashed_password, role=role)

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:

    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalars().first()

    if not user:
        return None
        
    if not verify_password(password, user.hashed_password):
        return None
    return user