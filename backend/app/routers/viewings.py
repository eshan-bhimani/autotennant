import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.application import Application
from app.models.landlord_profile import LandlordProfile
from app.models.property import Property
from app.models.tenant_profile import TenantProfile
from app.models.user import User
from app.models.viewing import Viewing
from app.schemas.viewing import (
    ViewingCreate,
    ViewingListResponse,
    ViewingResponse,
    ViewingStatusUpdate,
)
from app.services import calendar_service, notification_service

router = APIRouter()


async def _get_landlord_profile(
    current_user: User, db: AsyncSession
) -> LandlordProfile:
    await db.refresh(current_user, ["landlord_profile"])
    if not current_user.landlord_profile:
        raise HTTPException(status_code=404, detail="Landlord profile not found")
    return current_user.landlord_profile


async def _get_tenant_profile(
    current_user: User, db: AsyncSession
) -> TenantProfile:
    await db.refresh(current_user, ["tenant_profile"])
    if not current_user.tenant_profile:
        raise HTTPException(status_code=404, detail="Tenant profile not found")
    return current_user.tenant_profile


@router.post("", response_model=ViewingResponse, status_code=201)
async def create_viewing(
    data: ViewingCreate,
    current_user: User = Depends(require_role("LANDLORD")),
    db: AsyncSession = Depends(get_db),
) -> ViewingResponse:
    profile = await _get_landlord_profile(current_user, db)

    app = await db.get(Application, data.application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    prop = await db.get(Property, app.property_id)
    if not prop or prop.landlord_id != profile.id:
        raise HTTPException(status_code=404, detail="Application not found")

    viewing = Viewing(
        application_id=data.application_id,
        scheduled_at=data.scheduled_at,
    )
    db.add(viewing)
    await db.flush()

    try:
        event_id = await calendar_service.create_event(
            oauth_refresh_token="",  # would come from landlord's stored OAuth token
            summary=f"Property Viewing — {prop.address_line1}",
            location=f"{prop.address_line1}, {prop.city}, {prop.state} {prop.zip}",
            start_time=data.scheduled_at,
        )
        viewing.google_event_id = event_id
    except Exception:
        pass  # calendar integration is best-effort

    await db.commit()
    await db.refresh(viewing)
    return ViewingResponse.model_validate(viewing)


@router.get("/property/{property_id}", response_model=ViewingListResponse)
async def viewings_for_property(
    property_id: uuid.UUID,
    current_user: User = Depends(require_role("LANDLORD")),
    db: AsyncSession = Depends(get_db),
) -> ViewingListResponse:
    profile = await _get_landlord_profile(current_user, db)

    prop = await db.get(Property, property_id)
    if not prop or prop.landlord_id != profile.id:
        raise HTTPException(status_code=404, detail="Property not found")

    result = await db.execute(
        select(Viewing)
        .join(Application, Viewing.application_id == Application.id)
        .where(Application.property_id == property_id)
        .order_by(Viewing.scheduled_at)
    )
    viewings = result.scalars().all()
    items = [ViewingResponse.model_validate(v) for v in viewings]
    return ViewingListResponse(items=items, total=len(items))


@router.get("/available/{property_id}", response_model=ViewingListResponse)
async def available_viewings(
    property_id: uuid.UUID,
    current_user: User = Depends(require_role("TENANT")),
    db: AsyncSession = Depends(get_db),
) -> ViewingListResponse:
    result = await db.execute(
        select(Viewing)
        .join(Application, Viewing.application_id == Application.id)
        .where(
            Application.property_id == property_id,
            Viewing.status == "SCHEDULED",
        )
        .order_by(Viewing.scheduled_at)
    )
    viewings = result.scalars().all()
    items = [ViewingResponse.model_validate(v) for v in viewings]
    return ViewingListResponse(items=items, total=len(items))


@router.post("/{viewing_id}/book", response_model=ViewingResponse)
async def book_viewing(
    viewing_id: uuid.UUID,
    current_user: User = Depends(require_role("TENANT")),
    db: AsyncSession = Depends(get_db),
) -> ViewingResponse:
    profile = await _get_tenant_profile(current_user, db)

    viewing = await db.get(Viewing, viewing_id)
    if not viewing or viewing.status != "SCHEDULED":
        raise HTTPException(status_code=404, detail="Viewing not found or unavailable")

    # Add tenant as attendee on Google Calendar
    if viewing.google_event_id:
        try:
            tenant_user = await db.get(User, profile.user_id)
            if tenant_user:
                await calendar_service.update_event_attendee(
                    oauth_refresh_token="",
                    event_id=viewing.google_event_id,
                    attendee_email=tenant_user.email,
                )
        except Exception:
            pass  # best-effort

    # Send SMS reminder if tenant has phone
    if profile.phone:
        app = await db.get(Application, viewing.application_id)
        if app:
            prop = await db.get(Property, app.property_id)
            if prop:
                await notification_service.send_sms(
                    phone=profile.phone,
                    event="viewing_booked",
                    context={
                        "property_address": prop.address_line1,
                        "scheduled_at": str(viewing.scheduled_at),
                    },
                )

    await db.commit()
    await db.refresh(viewing)
    return ViewingResponse.model_validate(viewing)


@router.patch("/{viewing_id}", response_model=ViewingResponse)
async def update_viewing_status(
    viewing_id: uuid.UUID,
    data: ViewingStatusUpdate,
    current_user: User = Depends(require_role("LANDLORD")),
    db: AsyncSession = Depends(get_db),
) -> ViewingResponse:
    profile = await _get_landlord_profile(current_user, db)

    viewing = await db.get(Viewing, viewing_id)
    if not viewing:
        raise HTTPException(status_code=404, detail="Viewing not found")

    app = await db.get(Application, viewing.application_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    prop = await db.get(Property, app.property_id)
    if not prop or prop.landlord_id != profile.id:
        raise HTTPException(status_code=404, detail="Viewing not found")

    viewing.status = data.status
    if data.landlord_notes is not None:
        viewing.landlord_notes = data.landlord_notes

    if data.status == "CANCELLED" and viewing.google_event_id:
        try:
            await calendar_service.cancel_event(
                oauth_refresh_token="",
                event_id=viewing.google_event_id,
            )
        except Exception:
            pass

    await db.commit()
    await db.refresh(viewing)
    return ViewingResponse.model_validate(viewing)
