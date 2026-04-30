from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    is_pro: bool
    created_at: datetime


class AuthResponse(BaseModel):
    user: UserPublic
    access_token: str
    token_type: str = "bearer"
