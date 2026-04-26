from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
import shutil
import os
import uuid
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database import get_db
from models import Resource, ResourcePolicy, ResourceType, User
from schemas import ResourceIn, ResourceOut, PolicyIn, PolicyOut
from auth import get_current_user, require_roles

router = APIRouter(prefix="/resources", tags=["resources"])

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    _: User = Depends(require_roles("admin")),
):
    # Determine base directory
    backend_dir = Path(__file__).parent.parent
    upload_dir = backend_dir / "static" / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    file_path = upload_dir / filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Return URL (relative to root)
    return {"url": f"/static/uploads/{filename}"}


def _to_out(r: Resource) -> ResourceOut:
    policy_out = None
    if r.policy:
        policy_out = PolicyOut(
            id=r.policy.id, resource_id=r.policy.resource_id,
            max_duration_minutes=r.policy.max_duration_minutes,
            min_advance_minutes=r.policy.min_advance_minutes,
            max_advance_days=r.policy.max_advance_days,
            allowed_departments=r.policy.allowed_departments or [],
            allowed_roles=r.policy.allowed_roles or [],
        )
    return ResourceOut(
        id=r.id, name=r.name, type=r.type.value, description=r.description,
        floor=r.floor, building=r.building, capacity=r.capacity,
        amenities=r.amenities or [], image_url=r.image_url,
        availability_start=r.availability_start, availability_end=r.availability_end,
        x=r.x, y=r.y, requires_approval=r.requires_approval, active=r.active,
        policy=policy_out,
    )


@router.get("", response_model=List[ResourceOut])
async def list_resources(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from sqlalchemy.orm import selectinload
    res = await db.execute(select(Resource).options(selectinload(Resource.policy)).order_by(Resource.floor, Resource.name))
    return [_to_out(r) for r in res.scalars().all()]


@router.get("/{resource_id}", response_model=ResourceOut)
async def get_resource(
    resource_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from sqlalchemy.orm import selectinload
    res = await db.execute(
        select(Resource).options(selectinload(Resource.policy)).where(Resource.id == resource_id)
    )
    r = res.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    return _to_out(r)


@router.post("", response_model=ResourceOut)
async def create_resource(
    body: ResourceIn,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    data = body.model_dump()
    policy_data = data.pop("policy", None)
    if "type" in data:
        data["type"] = ResourceType(data["type"])
    r = Resource(**data)
    db.add(r)
    await db.flush()
    if policy_data:
        p = ResourcePolicy(resource_id=r.id, **policy_data)
        db.add(p)
    await db.commit()
    await db.refresh(r)
    from sqlalchemy.orm import selectinload
    res = await db.execute(
        select(Resource).options(selectinload(Resource.policy)).where(Resource.id == r.id)
    )
    return _to_out(res.scalar_one())


@router.put("/{resource_id}", response_model=ResourceOut)
async def update_resource(
    resource_id: str,
    body: ResourceIn,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    from sqlalchemy.orm import selectinload
    res = await db.execute(
        select(Resource).options(selectinload(Resource.policy)).where(Resource.id == resource_id)
    )
    r = res.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    data = body.model_dump()
    policy_data = data.pop("policy", None)
    if "type" in data:
        data["type"] = ResourceType(data["type"])
    for k, v in data.items():
        setattr(r, k, v)
    if policy_data:
        if r.policy:
            for k, v in policy_data.items():
                setattr(r.policy, k, v)
        else:
            db.add(ResourcePolicy(resource_id=r.id, **policy_data))
    await db.commit()
    res2 = await db.execute(
        select(Resource).options(selectinload(Resource.policy)).where(Resource.id == r.id)
    )
    return _to_out(res2.scalar_one())


@router.delete("/{resource_id}")
async def delete_resource(
    resource_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    res = await db.execute(select(Resource).where(Resource.id == resource_id))
    r = res.scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    r.active = False
    await db.commit()
    return {"ok": True}


@router.put("/{resource_id}/policy", response_model=PolicyOut)
async def upsert_policy(
    resource_id: str,
    body: PolicyIn,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_roles("admin")),
):
    res = await db.execute(select(ResourcePolicy).where(ResourcePolicy.resource_id == resource_id))
    p = res.scalar_one_or_none()
    if p is None:
        p = ResourcePolicy(resource_id=resource_id, **body.model_dump())
        db.add(p)
    else:
        for k, v in body.model_dump().items():
            setattr(p, k, v)
    await db.commit()
    await db.refresh(p)
    return PolicyOut(
        id=p.id, resource_id=p.resource_id,
        max_duration_minutes=p.max_duration_minutes,
        min_advance_minutes=p.min_advance_minutes,
        max_advance_days=p.max_advance_days,
        allowed_departments=p.allowed_departments or [],
        allowed_roles=p.allowed_roles or [],
    )
