import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.enums import UserRole


class UserCreate(BaseModel):
    name: str
    phone: str
    email: str | None = None
    city: str
    neighborhood: str | None = None
    role: UserRole = UserRole.STUDENT
    password: str | None = None
    avatar_url: str | None = None
    trainer_id: uuid.UUID | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    city: str | None = None
    neighborhood: str | None = None
    role: UserRole | None = None
    avatar_url: str | None = None


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    phone: str
    email: str | None
    city: str
    neighborhood: str | None
    role: UserRole
    avatar_url: str | None
    trainer_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    token: str
    user: UserRead
