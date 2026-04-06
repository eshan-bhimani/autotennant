from uuid import UUID

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application
from app.models.property import Property
from app.models.tenant_profile import TenantProfile
from app.models.user import User
from app.services import notification_service

logger = structlog.get_logger()


async def send_application_received(ctx: dict, application_id: str) -> dict[str, bool]:
    db: AsyncSession = ctx["db_session"]
    app = await db.get(Application, UUID(application_id))
    if not app:
        return {"skipped": True}

    prop = await db.get(Property, app.property_id)
    if not prop:
        return {"skipped": True}

    tenant = await db.get(TenantProfile, app.tenant_id)
    if not tenant:
        return {"skipped": True}

    await notification_service.send_email(
        recipient_user_id=tenant.user_id,
        subject="Application Received",
        event="application_received",
        context={
            "property_address": prop.address_line1,
            "city": prop.city,
            "state": prop.state,
        },
        db=db,
    )

    logger.info("notification_application_received", application_id=application_id)
    return {"skipped": False}


async def send_score_ready(ctx: dict, application_id: str) -> dict[str, bool]:
    db: AsyncSession = ctx["db_session"]
    app = await db.get(Application, UUID(application_id))
    if not app or app.qualification_score is None:
        return {"skipped": True}

    prop = await db.get(Property, app.property_id)
    if not prop:
        return {"skipped": True}

    # Notify landlord that a score is ready
    from app.models.landlord_profile import LandlordProfile
    landlord = await db.get(LandlordProfile, prop.landlord_id)
    if not landlord:
        return {"skipped": True}

    await notification_service.send_email(
        recipient_user_id=landlord.user_id,
        subject="Applicant Score Ready",
        event="score_ready",
        context={
            "property_address": prop.address_line1,
            "score": str(app.qualification_score),
        },
        db=db,
    )

    logger.info("notification_score_ready", application_id=application_id)
    return {"skipped": False}


async def send_decision_notification(ctx: dict, application_id: str) -> dict[str, bool]:
    db: AsyncSession = ctx["db_session"]
    app = await db.get(Application, UUID(application_id))
    if not app or app.status not in ("APPROVED", "REJECTED"):
        return {"skipped": True}

    tenant = await db.get(TenantProfile, app.tenant_id)
    if not tenant:
        return {"skipped": True}

    prop = await db.get(Property, app.property_id)
    if not prop:
        return {"skipped": True}

    await notification_service.send_email(
        recipient_user_id=tenant.user_id,
        subject=f"Application {app.status.capitalize()}",
        event="application_decision",
        context={
            "property_address": prop.address_line1,
            "decision": app.status,
        },
        db=db,
    )

    if tenant.phone:
        await notification_service.send_sms(
            phone=tenant.phone,
            event="application_decision",
            context={
                "property_address": prop.address_line1,
                "decision": app.status,
            },
        )

    logger.info(
        "notification_decision_sent",
        application_id=application_id,
        decision=app.status,
    )
    return {"skipped": False}


async def send_viewing_reminder(ctx: dict, viewing_id: str) -> dict[str, bool]:
    db: AsyncSession = ctx["db_session"]

    from app.models.viewing import Viewing
    viewing = await db.get(Viewing, UUID(viewing_id))
    if not viewing or viewing.status != "SCHEDULED":
        return {"skipped": True}

    app = await db.get(Application, viewing.application_id)
    if not app:
        return {"skipped": True}

    tenant = await db.get(TenantProfile, app.tenant_id)
    if not tenant or not tenant.phone:
        return {"skipped": True}

    prop = await db.get(Property, app.property_id)
    if not prop:
        return {"skipped": True}

    await notification_service.send_sms(
        phone=tenant.phone,
        event="viewing_reminder",
        context={
            "property_address": prop.address_line1,
            "scheduled_at": str(viewing.scheduled_at),
        },
    )

    logger.info("notification_viewing_reminder", viewing_id=viewing_id)
    return {"skipped": False}
