from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List

from database import get_db
from models import Notification, User
from schemas import NotificationOut
from auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=List[NotificationOut])
async def list_notifications(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    res = await db.execute(
        select(Notification).where(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc()).limit(100)
    )
    return [NotificationOut.model_validate(n) for n in res.scalars().all()]


@router.get("/unread", response_model=List[NotificationOut])
async def unread_notifications(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    res = await db.execute(
        select(Notification).where(
            Notification.user_id == user.id, Notification.read == False  # noqa
        ).order_by(Notification.created_at.desc()).limit(50)
    )
    return [NotificationOut.model_validate(n) for n in res.scalars().all()]


@router.post("/{notification_id}/read")
async def mark_read(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    res = await db.execute(
        select(Notification).where(Notification.id == notification_id, Notification.user_id == user.id)
    )
    n = res.scalar_one_or_none()
    if n:
        n.read = True
        await db.commit()
    return {"ok": True}


@router.post("/read-all")
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await db.execute(
        update(Notification).where(Notification.user_id == user.id, Notification.read == False).values(read=True)  # noqa
    )
    await db.commit()
    return {"ok": True}
