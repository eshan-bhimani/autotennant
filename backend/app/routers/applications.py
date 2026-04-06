import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.landlord_profile import LandlordProfile
from app.models.tenant_profile import TenantProfile
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationListResponse,
    ApplicationResponse,
    ApplicationStatusUpdate,
    ScreeningResponse,
)
from app.services import application_service

router = APIRouter()


async def _get_tenant_profile(
    current_user: User, db: AsyncSession
) -> TenantProfile:
    await db.refresh(current_user, ["tenant_profile"])
    if not current_user.tenant_profile:
        raise HTTPException(status_code=404, detail="Tenant profile not found")
    return current_user.tenant_profile


async def _get_landlord_profile(
    current_user: User, db: AsyncSession
) -> LandlordProfile:
    await db.refresh(current_user, ["landlord_profile"])
    if not current_user.landlord_profile:
        raise HTTPException(status_code=404, detail="Landlord profile not found")
    return current_user.landlord_profile


@router.post("", status_code=202, response_model=ApplicationResponse)
async def submit_application(
    data: ApplicationCreate,
    current_user: User = Depends(require_role("TENANT")),
    db: AsyncSession = Depends(get_db),
) -> ApplicationResponse:
    profile = await _get_tenant_profile(current_user, db)
    try:
        app = await application_service.submit_application(
            db, profile, data.property_id
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return ApplicationResponse.model_validate(app)


@router.get("/my", response_model=ApplicationListResponse)
async def my_applications(
    current_user: User = Depends(require_role("TENANT")),
    db: AsyncSession = Depends(get_db),
) -> ApplicationListResponse:
    profile = await _get_tenant_profile(current_user, db)
    result = await application_service.get_tenant_applications(db, profile)
    return ApplicationListResponse(**result)


@router.get("/property/{property_id}", response_model=ApplicationListResponse)
async def applications_for_property(
    property_id: uuid.UUID,
    current_user: User = Depends(require_role("LANDLORD")),
    db: AsyncSession = Depends(get_db),
) -> ApplicationListResponse:
    profile = await _get_landlord_profile(current_user, db)
    try:
        result = await application_service.get_applications_for_property(
            db, property_id, profile
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return ApplicationListResponse(**result)


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ApplicationResponse:
    try:
        result = await application_service.get_application(
            db, application_id, current_user.id, current_user.role
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return ApplicationResponse(**result)


@router.patch("/{application_id}/status", response_model=ApplicationResponse)
async def update_status(
    application_id: uuid.UUID,
    data: ApplicationStatusUpdate,
    current_user: User = Depends(require_role("LANDLORD")),
    db: AsyncSession = Depends(get_db),
) -> ApplicationResponse:
    profile = await _get_landlord_profile(current_user, db)
    try:
        app = await application_service.update_application_status(
            db, application_id, profile, data.status
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return ApplicationResponse.model_validate(app)


@router.post("/{application_id}/screening", response_model=ScreeningResponse)
async def initiate_screening(
    application_id: uuid.UUID,
    current_user: User = Depends(require_role("TENANT")),
    db: AsyncSession = Depends(get_db),
) -> ScreeningResponse:
    profile = await _get_tenant_profile(current_user, db)
    try:
        result = await application_service.initiate_screening(
            db, application_id, profile
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return ScreeningResponse(**result)
