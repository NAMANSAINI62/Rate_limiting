from fastapi import APIRouter, Depends
from app.models.user import User
from app.schemas.user import UserResponse
from app.core.dependencies import get_current_user, require_role
router = APIRouter(prefix='/users', tags=['Users'])

@router.get('/me', response_model=UserResponse)
async def read_users_me(current_user: User=Depends(get_current_user)):
    return current_user

@router.get('/admin-dashboard', response_model=UserResponse)
async def admin_only_route(current_user: User=Depends(require_role(['admin']))):
    return current_user