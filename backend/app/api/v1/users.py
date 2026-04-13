import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, UserUpdate, LoginRequest, LoginResponse

router = APIRouter(prefix="/users", tags=["users"])


def _hash_password(password: str) -> str:
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()


@router.post("", response_model=UserRead, status_code=201)
async def create_user(body: UserCreate, db: AsyncSession = Depends(get_db)):
    data = body.model_dump(exclude={"password"})
    if body.password:
        data["password_hash"] = _hash_password(body.password)
    if body.trainer_id:
        data["trainer_id"] = str(body.trainer_id)
    user = User(**data)
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not user.password_hash:
        raise HTTPException(401, "Credenciais inválidas")
    if user.password_hash != _hash_password(body.password):
        raise HTTPException(401, "Credenciais inválidas")
    # Simple token = user ID (no JWT for now, will add later)
    return LoginResponse(token=user.id, user=UserRead.model_validate(user))


@router.get("/me/{token}", response_model=UserRead)
async def get_current_user(token: str, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, token)
    if not user:
        raise HTTPException(401, "Token inválido")
    return user


@router.get("", response_model=list[UserRead])
async def list_users(
    skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, str(user_id))
    if not user:
        raise HTTPException(404, "User not found")
    return user


@router.patch("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: uuid.UUID, body: UserUpdate, db: AsyncSession = Depends(get_db)
):
    user = await db.get(User, str(user_id))
    if not user:
        raise HTTPException(404, "User not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    await db.flush()
    await db.refresh(user)
    return user
