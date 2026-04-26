from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database import get_db
from models import User, Notification, NotificationType
from schemas import UserOut, ManagerHierarchy, UserUpdate, DeleteUserIn
from auth import get_current_user, require_roles
from email_service import send_email, tpl_account_approved, tpl_account_rejected, tpl_account_deleted
import os

router = APIRouter(prefix="/users", tags=["users"])

def _to_out(u: User) -> UserOut:
    return UserOut(
        id=u.id, email=u.email, name=u.name, role=u.role.value,
        department=u.department, manager_id=u.manager_id,
        status=u.status, pending_manager_name=u.pending_manager_name,
        pending_manager_email=u.pending_manager_email,
        reliability_score=u.reliability_score, completed_count=u.completed_count,
        no_show_count=u.no_show_count, cancelled_count=u.cancelled_count,
    )


@router.get("", response_model=List[UserOut])
async def list_users(db: AsyncSession = Depends(get_db), user: User = Depends(require_roles("manager", "admin"))):
    if user.role.value == "manager":
        res = await db.execute(select(User).where((User.manager_id == user.id) | (User.id == user.id)))
    else:
        res = await db.execute(select(User).order_by(User.name))
    return [_to_out(u) for u in res.scalars().all()]
    
@router.get("/hierarchy", response_model=List[ManagerHierarchy])
async def get_user_hierarchy(db: AsyncSession = Depends(get_db), user: User = Depends(require_roles("admin"))):
    # Fetch all managers
    managers_res = await db.execute(select(User).where(User.role == "manager").order_by(User.name))
    managers = managers_res.scalars().all()
    
    hierarchy = []
    for manager in managers:
        employees_res = await db.execute(select(User).where(User.manager_id == manager.id).order_by(User.name))
        employees = employees_res.scalars().all()
        hierarchy.append(ManagerHierarchy(
            manager=_to_out(manager),
            employees=[_to_out(e) for e in employees]
        ))
    
    # Also handle employees with no manager? Or admins who have employees?
    # Usually, hierarchy is Manager -> Employee.
    return hierarchy

@router.get("/pending", response_model=List[UserOut])
async def list_pending_users(db: AsyncSession = Depends(get_db), user: User = Depends(require_roles("manager", "admin"))):
    if user.role.value == "manager":
        res = await db.execute(select(User).where(User.pending_manager_email == user.email, User.status == "pending"))
    else:
        res = await db.execute(select(User).where(User.role == "manager", User.status == "pending"))
    return [_to_out(u) for u in res.scalars().all()]

@router.post("/{user_id}/approve")
async def approve_user(user_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_roles("manager", "admin"))):
    res = await db.execute(select(User).where(User.id == user_id))
    u = res.scalar_one_or_none()
    if not u or u.status != "pending":
        raise HTTPException(status_code=404, detail="Pending user not found")
        
    if u.role.value == "manager" and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can approve managers")
    if u.role.value == "employee" and u.pending_manager_email != current_user.email:
        raise HTTPException(status_code=403, detail="Not authorized to approve this user")
        
    u.status = "approved"
    if u.role.value == "employee":
        u.manager_id = current_user.id
        
    db.add(Notification(
        user_id=u.id,
        type=NotificationType.booking_approved,
        title="Account Approved",
        message="Your account has been approved. You can now log in.",
        link="/login"
    ))
    await db.commit()
    
    # Send email notification
    front_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    subject, html = tpl_account_approved(u.name, f"{front_url}/auth")
    import asyncio
    asyncio.create_task(send_email(u.email, subject, html))
    
    return {"message": "User approved"}

@router.post("/{user_id}/reject")
async def reject_user(user_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_roles("manager", "admin"))):
    res = await db.execute(select(User).where(User.id == user_id))
    u = res.scalar_one_or_none()
    if not u or u.status != "pending":
        raise HTTPException(status_code=404, detail="Pending user not found")
        
    if u.role.value == "manager" and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Only admins can reject managers")
    if u.role.value == "employee" and u.pending_manager_email != current_user.email:
        raise HTTPException(status_code=403, detail="Not authorized to reject this user")
        
    u.status = "rejected"
    await db.commit()
    
    # Send email notification
    subject, html = tpl_account_rejected(u.name)
    import asyncio
    asyncio.create_task(send_email(u.email, subject, html))
    
    return {"message": "User rejected"}


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: str, db: AsyncSession = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role.value == "employee" and user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    res = await db.execute(select(User).where(User.id == user_id))
    u = res.scalar_one_or_none()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return _to_out(u)
    
@router.put("/{user_id}", response_model=UserOut)
async def update_user(user_id: str, data: UserUpdate, db: AsyncSession = Depends(get_db), user: User = Depends(require_roles("admin"))):
    res = await db.execute(select(User).where(User.id == user_id))
    u = res.scalar_one_or_none()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    
    if data.name is not None: u.name = data.name
    if data.email is not None: u.email = data.email
    if data.role is not None: u.role = data.role
    if data.department is not None: u.department = data.department
    if data.manager_id is not None: u.manager_id = data.manager_id
    
    await db.commit()
    await db.refresh(u)
    return _to_out(u)

@router.delete("/{user_id}")
async def delete_user(user_id: str, data: DeleteUserIn, db: AsyncSession = Depends(get_db), user: User = Depends(require_roles("admin"))):
    res = await db.execute(select(User).where(User.id == user_id))
    u = res.scalar_one_or_none()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Send email notification before deletion
    subject, html = tpl_account_deleted(u.name, data.reason)
    import asyncio
    asyncio.create_task(send_email(u.email, subject, html))
    
    # Delete the user
    await db.delete(u)
    await db.commit()
    
    return {"message": "User deleted successfully"}
