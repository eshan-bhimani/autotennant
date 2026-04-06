from uuid import UUID

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application
from app.models.property import Property
from app.models.tenant_profile import TenantProfile
from app.services import screening_service

logger = structlog.get_logger()


async def run_screening(ctx: dict, application_id: str) -> dict[str, bool | str]:
    db: AsyncSession = ctx["db_session"]
    app = await db.get(Application, UUID(application_id))

    if not app:
        return {"skipped": True, "reason": "application not found"}

    # Idempotency — do not re-screen if already processed
    if app.status != "SUBMITTED":
        return {"skipped": True, "reason": f"already {app.status}"}

    app.status = "SCREENING"
    await db.commit()

    try:
        order = await screening_service.initiate(app)
        app.smartmove_order_id = order.id
        await db.commit()
        logger.info(
            "screening_worker_initiated",
            application_id=application_id,
            order_id=order.id,
        )
        return {"skipped": False, "order_id": order.id}
    except Exception as exc:
        logger.error(
            "screening_worker_failed",
            application_id=application_id,
            error=str(exc),
        )
        app.status = "SUBMITTED"
        await db.commit()
        raise
