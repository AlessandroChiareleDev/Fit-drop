import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class GymCreate(BaseModel):
    name: str
    owner_id: uuid.UUID
    cnpj: str | None = None
    phone: str | None = None
    email: str | None = None
    description: str | None = None
    city: str
    neighborhood: str
    address: str | None = None
    lat: float | None = None
    lng: float | None = None
    photo_url: str | None = None
    photos: list[str] = []
    operating_hours: dict = {}
    amenities: list[str] = []
    gym_type: str = "gym"


class GymUpdate(BaseModel):
    name: str | None = None
    cnpj: str | None = None
    phone: str | None = None
    email: str | None = None
    description: str | None = None
    address: str | None = None
    lat: float | None = None
    lng: float | None = None
    photo_url: str | None = None
    photos: list[str] | None = None
    operating_hours: dict | None = None
    amenities: list[str] | None = None
    gym_type: str | None = None


class GymRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    owner_id: uuid.UUID
    cnpj: str | None
    phone: str | None
    email: str | None
    description: str | None
    city: str
    neighborhood: str
    address: str | None
    lat: float | None
    lng: float | None
    photo_url: str | None
    photos: list[str]
    operating_hours: dict
    amenities: list[str]
    gym_type: str
    avg_rating: float
    total_reviews: int
    created_at: datetime
    updated_at: datetime
