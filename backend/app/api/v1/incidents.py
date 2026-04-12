import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.enums import IncidentStatus
from app.models.incident import Incident
from app.schemas.incident import IncidentCreate, IncidentRead, IncidentUpdate

router = APIRouter(prefix="/incidents", tags=["incidents"])


@router.post("", response_model=IncidentRead, status_code=201)
async def create_incident(body: IncidentCreate, db: AsyncSession = Depends(get_db)):
    incident = Incident(**body.model_dump())
    db.add(incident)
    await db.flush()
    await db.refresh(incident)
    return incident


@router.get("", response_model=list[IncidentRead])
async def list_incidents(
    status: IncidentStatus | None = None,
    session_id: uuid.UUID | None = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    q = select(Incident).order_by(Incident.created_at.desc())
    if status:
        q = q.where(Incident.status == status)
    if session_id:
        q = q.where(Incident.session_id == session_id)
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{incident_id}", response_model=IncidentRead)
async def get_incident(incident_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    incident = await db.get(Incident, incident_id)
    if not incident:
        raise HTTPException(404, "Incident not found")
    return incident


@router.patch("/{incident_id}", response_model=IncidentRead)
async def update_incident(
    incident_id: uuid.UUID,
    body: IncidentUpdate,
    db: AsyncSession = Depends(get_db),
):
    incident = await db.get(Incident, incident_id)
    if not incident:
        raise HTTPException(404, "Incident not found")

    data = body.model_dump(exclude_unset=True)

    if "status" in data and data["status"] in (
        IncidentStatus.RESOLVED,
        IncidentStatus.DISMISSED,
    ):
        data["resolved_at"] = datetime.now(timezone.utc)

    for field, value in data.items():
        setattr(incident, field, value)

    await db.flush()
    await db.refresh(incident)
    return incident
