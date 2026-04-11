"""Daily job — send rent reminders and mark overdue payments."""
from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

import structlog
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session
from app.models.landlord_profile import LandlordProfile
from app.models.lease import Lease
from app.models.property import Property
from app.models.rent_payment import RentPayment
from app.models.tenant_profile import TenantProfile
from app.models.user import User
from app.services import notification_service

logger = structlog.get_logger()

REMINDER_DAYS_BEFORE = 3


async def _send_reminder(
    db: AsyncSession,
    payment: RentPayment,
    lease: Lease,
    kind: str,
) -> None:
    """kind is either 'upcoming' or 'overdue'."""
    tenant = await db.get(TenantProfile, lease.tenant_id)
    prop = await db.get(Property, lease.property_id)
    landlord = await db.get(LandlordProfile, prop.landlord_id) if prop else None
    if not tenant or not prop or not landlord:
        return

    event = (
        "rent_due_reminder" if kind == "upcoming" else "rent_overdue_notice"
    )
    subject = (
        "Rent Due Soon" if kind == "upcoming" else "Rent Payment Overdue"
    )
    context = {
        "property_address": f"{prop.address_line1}, {prop.city}, {prop.state}",
        "amount": f"{float(payment.amount):,.2f}",
        "due_date": payment.due_date.isoformat(),
        "landlord_name": landlord.full_name,
    }

    try:
        await notification_service.send_email(
            recipient_user_id=tenant.user_id,
            subject=subject,
            event=event,
            context=context,
            db=db,
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "rent_reminder_email_failed",
            rent_payment_id=str(payment.id),
            error=str(exc),
        )

    if tenant.phone:
        try:
            await notification_service.send_sms(
                phone=tenant.phone,
                event=event,
                context=context,
            )
        except Exception as exc:  # noqa: BLE001
            logger.warning(
                "rent_reminder_sms_failed",
                rent_payment_id=str(payment.id),
                error=str(exc),
            )


async def process_rent_reminders(ctx: dict) -> dict[str, int]:
    """Send reminders for upcoming rent and escalate overdue payments."""
    today = date.today()
    upcoming_cutoff = today + timedelta(days=REMINDER_DAYS_BEFORE)
    now = datetime.now(timezone.utc)

    sent_upcoming = 0
    sent_overdue = 0
    marked_late = 0

    async with async_session() as db:
        # 1. Upcoming reminders — due within REMINDER_DAYS_BEFORE and not yet reminded.
        stmt = select(RentPayment, Lease).join(Lease, RentPayment.lease_id == Lease.id).where(
            and_(
                RentPayment.status == "PENDING",
                RentPayment.due_date <= upcoming_cutoff,
                RentPayment.due_date >= today,
                RentPayment.reminder_sent_at.is_(None),
            )
        )
        result = await db.execute(stmt)
        for payment, lease in result.all():
            await _send_reminder(db, payment, lease, "upcoming")
            payment.reminder_sent_at = now
            sent_upcoming += 1

        # 2. Escalate to LATE if due_date has passed and still not paid.
        late_stmt = select(RentPayment).where(
            and_(
                RentPayment.status == "PENDING",
                RentPayment.due_date < today,
            )
        )
        late_result = await db.execute(late_stmt)
        for p in late_result.scalars().all():
            p.status = "LATE"
            marked_late += 1

        # 3. Overdue notice — mark LATE payments that haven't had an overdue notice yet.
        overdue_stmt = select(RentPayment, Lease).join(
            Lease, RentPayment.lease_id == Lease.id
        ).where(
            and_(
                RentPayment.status == "LATE",
                RentPayment.overdue_notice_sent_at.is_(None),
            )
        )
        overdue_result = await db.execute(overdue_stmt)
        for payment, lease in overdue_result.all():
            await _send_reminder(db, payment, lease, "overdue")
            payment.overdue_notice_sent_at = now
            sent_overdue += 1

        await db.commit()

    logger.info(
        "rent_reminders_run",
        sent_upcoming=sent_upcoming,
        sent_overdue=sent_overdue,
        marked_late=marked_late,
    )
    return {
        "sent_upcoming": sent_upcoming,
        "sent_overdue": sent_overdue,
        "marked_late": marked_late,
    }
