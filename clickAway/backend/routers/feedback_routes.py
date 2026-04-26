from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from database import get_db
from models import User, Booking, Resource, Feedback, FeedbackStatus, UserRole
from schemas import FeedbackIn, FeedbackOut, FeedbackEscalateIn, FeedbackResolveIn
from auth import get_current_user

router = APIRouter(prefix="/feedback", tags=["feedback"])

@router.post("/", response_model=FeedbackOut)
async def create_feedback(feedback_in: FeedbackIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Check if booking exists and belongs to user
    stmt = select(Booking).options(selectinload(Booking.resource)).filter(
        Booking.id == feedback_in.booking_id, 
        Booking.user_id == current_user.id
    )
    result = await db.execute(stmt)
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check if feedback already exists for this booking
    stmt_existing = select(Feedback).filter(Feedback.booking_id == feedback_in.booking_id)
    res_existing = await db.execute(stmt_existing)
    existing = res_existing.scalar_one_or_none()
    
    if existing:
        raise HTTPException(status_code=400, detail="Feedback already submitted for this booking")

    new_feedback = Feedback(
        booking_id=feedback_in.booking_id,
        user_id=current_user.id,
        resource_id=booking.resource_id,
        content=feedback_in.content,
        status=FeedbackStatus.pending
    )
    db.add(new_feedback)
    await db.commit()
    await db.refresh(new_feedback)
    
    # Attach names for response
    new_feedback.user_name = current_user.name
    new_feedback.resource_name = booking.resource.name
    return new_feedback

@router.get("/", response_model=List[FeedbackOut])
async def get_feedback(
    scope: str = "mine", 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Feedback).options(
        selectinload(Feedback.user),
        selectinload(Feedback.resource)
    )
    
    if scope == "mine":
        stmt = stmt.filter(Feedback.user_id == current_user.id)
    elif scope == "team":
        if current_user.role not in [UserRole.manager, UserRole.admin]:
            raise HTTPException(status_code=403, detail="Not authorized")
        # Joining User to filter by manager_id
        stmt = stmt.join(User, Feedback.user_id == User.id).filter(User.manager_id == current_user.id)
    elif scope == "all":
        if current_user.role != UserRole.admin:
            raise HTTPException(status_code=403, detail="Not authorized")
    else:
        raise HTTPException(status_code=400, detail="Invalid scope")
    
    result = await db.execute(stmt)
    feedbacks = result.scalars().all()
    
    for f in feedbacks:
        f.user_name = f.user.name
        f.resource_name = f.resource.name
    return feedbacks

@router.post("/{id}/escalate", response_model=FeedbackOut)
async def escalate_feedback(id: str, escalate_in: FeedbackEscalateIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role not in [UserRole.manager, UserRole.admin]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    stmt = select(Feedback).options(selectinload(Feedback.user), selectinload(Feedback.resource)).filter(Feedback.id == id)
    result = await db.execute(stmt)
    feedback = result.scalar_one_or_none()
    
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    feedback.status = FeedbackStatus.escalated
    feedback.manager_note = escalate_in.manager_note
    await db.commit()
    await db.refresh(feedback)
    
    feedback.user_name = feedback.user.name
    feedback.resource_name = feedback.resource.name
    return feedback

@router.post("/{id}/resolve", response_model=FeedbackOut)
async def resolve_feedback(id: str, resolve_in: FeedbackResolveIn, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    stmt = select(Feedback).options(selectinload(Feedback.user), selectinload(Feedback.resource)).filter(Feedback.id == id)
    result = await db.execute(stmt)
    feedback = result.scalar_one_or_none()
    
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    feedback.status = FeedbackStatus.resolved
    feedback.admin_note = resolve_in.admin_note
    await db.commit()
    await db.refresh(feedback)
    
    feedback.user_name = feedback.user.name
    feedback.resource_name = feedback.resource.name
    return feedback
