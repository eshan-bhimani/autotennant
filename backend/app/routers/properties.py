import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import PaginationParams, get_current_user, require_role
from app.models.user import User
from app.schemas.property import (
    OptimizedListingResponse,
    PhotoConfirmRequest,
    PhotoUploadResponse,
    PropertyCreate,
    PropertyListResponse,
    PropertyResponse,
    PropertySearchResponse,
    PropertyUpdate,
)
from app.services import property_service

router = APIRouter()


async def _get_landlord_profile(
    current_user: User, db: AsyncSession
):  # type: ignore[no-untyped-def]
    await db.refresh(current_user, ["landlord_profile"])
    if not current_user.landlord_profile:
        raise HTTPException(status_code=404, detail="Landlord profile not found")
    return current_user.landlord_profile


@router.get("", response_model=PropertyListResponse)
async def list_properties(
    current_user: User = Depends(require_role("LANDLORD")),
    db: AsyncSession = Depends(get_db),
) -> PropertyListResponse:
    profile = await _get_landlord_profile(current_user, db)
    result = await property_service.get_landlord_properties(db, profile)
    return PropertyListResponse(**result)


@router.post("", response_model=PropertyResponse, status_code=201)
async def create_property(
    data: PropertyCreate,
    current_user: User = Depends(require_role("LANDLORD")),
    db: AsyncSession = Depends(get_db),
) -> PropertyResponse:
    profile = await _get_landlord_profile(current_user, db)
    result = await property_service.create_property(db, profile, data)
    return PropertyResponse(**result)


@router.get("/search", response_model=PropertySearchResponse)
async def search_properties(
    q: str = Query(min_length=1, max_length=200),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> PropertySearchResponse:
    result = await property_service.search_properties(db, q, skip, limit)
    return PropertySearchResponse(**result)


@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(
    property_id: uuid.UUID,
    current_user: User = Depends(require_role("LANDLORD")),
    db: AsyncSession = Depends(get_db),
) -> PropertyResponse:
    profile = await _get_landlord_profile(current_user, db)
    try:
        result = await property_service.get_property(db, property_id, profile)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return PropertyResponse(**result)


@router.put("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: uuid.UUID,
    data: PropertyUpdate,
    current_user: User = Depends(require_role("LANDLORD")),
    db: AsyncSession = Depends(get_db),
) -> PropertyResponse:
    profile = await _get_landlord_profile(current_user, db)
    try:
        result = await property_service.update_property(db, property_id, profile, data)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return PropertyResponse(**result)


@router.delete("/{property_id}", status_code=204)
async def delete_property(
    property_id: uuid.UUID,
    current_user: User = Depends(require_role("LANDLORD")),
    db: AsyncSession = Depends(get_db),
) -> None:
    profile = await _get_landlord_profile(current_user, db)
    try:
        await property_service.delete_property(db, property_id, profile)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.post("/{property_id}/optimize", response_model=OptimizedListingResponse)
async def optimize_listing(
    property_id: uuid.UUID,
    current_user: User = Depends(require_role("LANDLORD")),
    db: AsyncSession = Depends(get_db),
) -> OptimizedListingResponse:
    profile = await _get_landlord_profile(current_user, db)
    try:
        result = await property_service.optimize_listing(db, property_id, profile)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return OptimizedListingResponse(**result)


@router.post("/{property_id}/photos", response_model=PhotoUploadResponse)
async def get_photo_upload_url(
    property_id: uuid.UUID,
    current_user: User = Depends(require_role("LANDLORD")),
    db: AsyncSession = Depends(get_db),
) -> PhotoUploadResponse:
    profile = await _get_landlord_profile(current_user, db)
    try:
        upload_url, s3_key = await property_service.generate_photo_upload_url(
            db, property_id, profile
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return PhotoUploadResponse(upload_url=upload_url, s3_key=s3_key)


@router.patch("/{property_id}/photos", status_code=204)
async def confirm_photo_upload(
    property_id: uuid.UUID,
    data: PhotoConfirmRequest,
    current_user: User = Depends(require_role("LANDLORD")),
    db: AsyncSession = Depends(get_db),
) -> None:
    profile = await _get_landlord_profile(current_user, db)
    try:
        await property_service.confirm_photo_upload(
            db, property_id, profile, data.s3_key
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
