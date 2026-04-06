import uuid
from datetime import datetime, timezone

import structlog
from arq import create_pool
from arq.connections import RedisSettings
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.cache import get_cache
from app.config import settings
from app.models.application import Application
from app.models.landlord_profile import LandlordProfile
from app.models.property import Property
from app.models.tenant_profile import TenantProfile
from app.services import s3_service, screening_service

logger = structlog.get_logger()


async def _invalidate_application_cache(
    application_id: uuid.UUID, property_id: uuid.UUID
) -> None:
    cache = await get_cache()
    await cache.delete(f"application:{application_id}")
    await cache.delete(f"property:{property_id}")


async def submit_application(
    db: AsyncSession,
    tenant_profile: TenantProfile,
    property_id: uuid.UUID,
) -> Application:
    prop = await db.get(Property, property_id)
    if not prop or prop.status != "LISTED":
        raise ValueError("Property not found or not listed")

    existing = await db.execute(
        select(Application).where(
            Application.property_id == property_id,
            Application.tenant_id == tenant_profile.id,
            Application.status.notin_(["WITHDRAWN", "REJECTED"]),
        )
    )
    if existing.scalar_one_or_none():
        raise ValueError("You have already applied to this property")

    application = Application(
        property_id=property_id,
        tenant_id=tenant_profile.id,
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)

    redis = await create_pool(RedisSettings.from_dsn(settings.redis_url))
    await redis.enqueue_job("run_screening", str(application.id))
    await redis.enqueue_job("send_application_received", str(application.id))
    await redis.close()

    await _invalidate_application_cache(application.id, property_id)
    logger.info(
        "application_submitted",
        application_id=str(application.id),
        property_id=str(property_id),
    )
    return application


async def get_application(
    db: AsyncSession,
    application_id: uuid.UUID,
    user_id: uuid.UUID,
    role: str,
) -> dict:
    app = await db.get(Application, application_id)
    if not app:
        raise ValueError("Application not found")

    if role == "TENANT":
        tenant_profile = (
            await db.execute(
                select(TenantProfile).where(TenantProfile.user_id == user_id)
            )
        ).scalar_one_or_none()
        if not tenant_profile or app.tenant_id != tenant_profile.id:
            raise ValueError("Application not found")
    elif role == "LANDLORD":
        prop = await db.get(Property, app.property_id)
        landlord_profile = (
            await db.execute(
                select(LandlordProfile).where(LandlordProfile.user_id == user_id)
            )
        ).scalar_one_or_none()
        if not prop or not landlord_profile or prop.landlord_id != landlord_profile.id:
            raise ValueError("Application not found")

    screening_report_url = None
    if app.screening_report_s3_key:
        screening_report_url = s3_service.sensitive_url(app.screening_report_s3_key)

    return {
        "id": app.id,
        "property_id": app.property_id,
        "tenant_id": app.tenant_id,
        "status": app.status,
        "qualification_score": app.qualification_score,
        "screening_report_url": screening_report_url,
        "smartmove_order_id": app.smartmove_order_id,
        "landlord_notes": app.landlord_notes,
        "submitted_at": app.submitted_at,
        "screened_at": app.screened_at,
        "decided_at": app.decided_at,
    }


async def get_applications_for_property(
    db: AsyncSession,
    property_id: uuid.UUID,
    landlord_profile: LandlordProfile,
) -> dict:
    prop = await db.get(Property, property_id)
    if not prop or prop.landlord_id != landlord_profile.id:
        raise ValueError("Property not found")

    result = await db.execute(
        select(Application)
        .where(Application.property_id == property_id)
        .order_by(Application.qualification_score.desc().nullslast())
    )
    applications = result.scalars().all()

    items = []
    for app in applications:
        screening_report_url = None
        if app.screening_report_s3_key:
            screening_report_url = s3_service.sensitive_url(app.screening_report_s3_key)
        items.append({
            "id": app.id,
            "property_id": app.property_id,
            "tenant_id": app.tenant_id,
            "status": app.status,
            "qualification_score": app.qualification_score,
            "screening_report_url": screening_report_url,
            "smartmove_order_id": app.smartmove_order_id,
            "landlord_notes": app.landlord_notes,
            "submitted_at": app.submitted_at,
            "screened_at": app.screened_at,
            "decided_at": app.decided_at,
        })

    return {"items": items, "total": len(items)}


async def get_tenant_applications(
    db: AsyncSession, tenant_profile: TenantProfile
) -> dict:
    result = await db.execute(
        select(Application)
        .where(Application.tenant_id == tenant_profile.id)
        .order_by(Application.submitted_at.desc())
    )
    applications = result.scalars().all()

    items = []
    for app in applications:
        items.append({
            "id": app.id,
            "property_id": app.property_id,
            "tenant_id": app.tenant_id,
            "status": app.status,
            "qualification_score": app.qualification_score,
            "screening_report_url": None,
            "smartmove_order_id": app.smartmove_order_id,
            "landlord_notes": None,
            "submitted_at": app.submitted_at,
            "screened_at": app.screened_at,
            "decided_at": app.decided_at,
        })

    return {"items": items, "total": len(items)}


async def update_application_status(
    db: AsyncSession,
    application_id: uuid.UUID,
    landlord_profile: LandlordProfile,
    new_status: str,
) -> Application:
    app = await db.get(Application, application_id)
    if not app:
        raise ValueError("Application not found")

    prop = await db.get(Property, app.property_id)
    if not prop or prop.landlord_id != landlord_profile.id:
        raise ValueError("Application not found")

    if app.status not in ("SCORED", "SUBMITTED", "SCREENING"):
        raise ValueError(f"Cannot change status from {app.status}")

    app.status = new_status
    app.decided_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(app)

    redis = await create_pool(RedisSettings.from_dsn(settings.redis_url))
    await redis.enqueue_job("send_decision_notification", str(app.id))
    await redis.close()

    await _invalidate_application_cache(app.id, app.property_id)
    logger.info(
        "application_status_updated",
        application_id=str(app.id),
        status=new_status,
    )
    return app


async def initiate_screening(
    db: AsyncSession,
    application_id: uuid.UUID,
    tenant_profile: TenantProfile,
) -> dict[str, str]:
    app = await db.get(Application, application_id)
    if not app or app.tenant_id != tenant_profile.id:
        raise ValueError("Application not found")

    if app.status != "SUBMITTED":
        raise ValueError("Screening already initiated or completed")

    order = await screening_service.initiate(app)
    app.smartmove_order_id = order.id
    app.status = "SCREENING"
    await db.commit()

    await _invalidate_application_cache(app.id, app.property_id)
    return {
        "smartmove_order_id": order.id,
        "payment_url": order.payment_url,
    }
