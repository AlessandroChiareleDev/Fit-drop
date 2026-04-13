import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogRead

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])


@router.get("", response_model=list[AuditLogRead])
async def list_audit_logs(
    actor_id: uuid.UUID | None = None,
    entity_type: str | None = None,
    action: str | None = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    q = select(AuditLog).order_by(AuditLog.created_at.desc())
    if actor_id:
        q = q.where(AuditLog.actor_id == str(actor_id))
    if entity_type:
        q = q.where(AuditLog.entity_type == entity_type)
    if action:
        q = q.where(AuditLog.action == action)
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()
