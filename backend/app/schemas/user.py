from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class UserCreate(BaseModel):

    username: str = Field(..., min_length=3, max_length=50, description='Unique username')
    email: EmailStr = Field(..., description='Valid email address')
    password: str = Field(..., min_length=8, description='Password (min 8 chars)')

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True