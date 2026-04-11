import hashlib
import hmac
import uuid
from datetime import datetime, timezone

import structlog
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.cache import get_cache
from app.config import settings
from app.database import get_db
from app.models.application import Application
from app.models.landlord_profile import LandlordProfile
from app.models.lease import Lease
from app.models.property import Property
from app.models.rent_payment import RentPayment
from app.models.tenant_profile import TenantProfile
from app.schemas.application import WebhookResponse
from app.services import scoring_service, stripe_service

logger = structlog.get_logger()

router = APIRouter()


def _verify_hmac(payload: bytes, signature: str, secret: str) -> None:
    expected = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")


@router.post("/smartmove", response_model=WebhookResponse)
async def smartmove_webhook(
    request: Request,
    x_smartmove_signature: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> WebhookResponse:
    payload = await request.body()
    _verify_hmac(payload, x_smartmove_signature, settings.smartmove_webhook_secret)

    data = await request.json()
    order_id = data.get("order_id")
    if not order_id:
        raise HTTPException(status_code=400, detail="Missing order_id")

    result = await db.execute(
        select(Application).where(Application.smartmove_order_id == order_id)
    )
    app = result.scalar_one_or_none()
    if not app:
        logger.warning("smartmove_webhook_unknown_order", order_id=order_id)
        raise HTTPException(status_code=404, detail="Application not found")

    # Idempotency — skip if already scored
    if app.status in ("SCORED", "APPROVED", "REJECTED"):
        return WebhookResponse(status="ok", message="Already processed")

    credit_score: int | None = data.get("credit_score")
    has_evictions: bool = data.get("has_evictions", False)
    report_s3_key: str | None = data.get("report_s3_key")

    tenant = await db.get(TenantProfile, app.tenant_id)
    prop = await db.get(Property, app.property_id)

    monthly_rent = float(prop.monthly_rent) if prop and prop.monthly_rent else None
    annual_income = float(tenant.annual_income) if tenant and tenant.annual_income else None
    employment_status = tenant.employment_status if tenant else None

    score, factors, hard_fail = scoring_service.compute_qualification_score(
        annual_income=annual_income,
        monthly_rent=monthly_rent,
        credit_score=credit_score,
        employment_status=employment_status,
        has_evictions=has_evictions,
    )

    app.qualification_score = score
    app.screening_report_s3_key = report_s3_key
    app.screened_at = datetime.now(timezone.utc)

    if hard_fail:
        app.status = "REJECTED"
        app.decided_at = datetime.now(timezone.utc)
    else:
        app.status = "SCORED"

    await db.commit()

    cache = await get_cache()
    await cache.delete(f"application:{app.id}")
    await cache.delete(f"property:{app.property_id}")

    logger.info(
        "smartmove_webhook_processed",
        order_id=order_id,
        application_id=str(app.id),
        score=score,
        hard_fail=hard_fail,
    )
    return WebhookResponse(status="ok", message="Score computed")


@router.post("/docusign", response_model=WebhookResponse)
async def docusign_webhook(
    request: Request,
    x_docusign_signature: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> WebhookResponse:
    payload = await request.body()
    _verify_hmac(payload, x_docusign_signature, settings.docusign_webhook_secret)

    data = await request.json()
    envelope_id = data.get("envelope_id")
    envelope_status = data.get("status")

    if not envelope_id or not envelope_status:
        raise HTTPException(status_code=400, detail="Missing envelope_id or status")

    result = await db.execute(
        select(Lease).where(Lease.docusign_envelope_id == envelope_id)
    )
    lease = result.scalar_one_or_none()
    if not lease:
        logger.warning("docusign_webhook_unknown_envelope", envelope_id=envelope_id)
        raise HTTPException(status_code=404, detail="Lease not found")

    status_map: dict[str, str] = {
        "sent": "SENT",
        "completed": "SIGNED",
        "voided": "TERMINATED",
    }
    new_status = status_map.get(envelope_status)
    if not new_status:
        return WebhookResponse(status="ok", message="Unhandled status")

    lease.status = new_status
    if new_status == "SIGNED" and data.get("signed_document_s3_key"):
        lease.signed_lease_s3_key = data["signed_document_s3_key"]

    await db.commit()

    logger.info(
        "docusign_webhook_processed",
        envelope_id=envelope_id,
        new_status=new_status,
    )
    return WebhookResponse(status="ok", message=f"Lease status updated to {new_status}")


@router.post("/stripe", response_model=WebhookResponse)
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(..., alias="Stripe-Signature"),
    db: AsyncSession = Depends(get_db),
) -> WebhookResponse:
    payload = await request.body()
    try:
        event = stripe_service.verify_webhook(payload, stripe_signature)
    except Exception as exc:
        logger.warning("stripe_webhook_bad_signature", error=str(exc))
        raise HTTPException(status_code=400, detail="Invalid signature")

    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        metadata = data.get("metadata") or {}
        rent_payment_id = metadata.get("rent_payment_id")
        pi_id = data.get("payment_intent")
        if rent_payment_id:
            try:
                payment = await db.get(RentPayment, uuid.UUID(rent_payment_id))
            except ValueError:
                payment = None
            if payment and isinstance(pi_id, str):
                payment.stripe_payment_intent_id = pi_id
                await db.commit()
        return WebhookResponse(status="ok", message="Session completed recorded")

    if event_type in ("payment_intent.succeeded", "payment_intent.payment_failed"):
        pi_id = data["id"]
        metadata = data.get("metadata") or {}
        rent_payment_id = metadata.get("rent_payment_id")

        payment: RentPayment | None = None
        if rent_payment_id:
            try:
                payment = await db.get(RentPayment, uuid.UUID(rent_payment_id))
            except ValueError:
                payment = None
        if not payment:
            result = await db.execute(
                select(RentPayment).where(
                    RentPayment.stripe_payment_intent_id == pi_id
                )
            )
            payment = result.scalar_one_or_none()

        if not payment:
            logger.warning("stripe_webhook_unknown_intent", payment_intent_id=pi_id)
            return WebhookResponse(status="ok", message="Unknown intent")

        if event_type == "payment_intent.succeeded":
            payment.status = "PAID"
            payment.paid_at = datetime.now(timezone.utc)
            logger.info(
                "rent_payment_succeeded",
                rent_payment_id=str(payment.id),
                amount=float(payment.amount),
            )
        else:
            payment.status = "FAILED"
            logger.warning(
                "rent_payment_failed",
                rent_payment_id=str(payment.id),
                payment_intent_id=pi_id,
            )
        await db.commit()
        return WebhookResponse(status="ok", message=f"Handled {event_type}")

    if event_type == "account.updated":
        account_id = data["id"]
        result = await db.execute(
            select(LandlordProfile).where(
                LandlordProfile.stripe_connect_account_id == account_id
            )
        )
        profile = result.scalar_one_or_none()
        if profile:
            profile.stripe_charges_enabled = bool(data.get("charges_enabled", False))
            profile.stripe_connect_onboarded = bool(
                data.get("details_submitted", False)
            ) and profile.stripe_charges_enabled
            await db.commit()
            logger.info(
                "stripe_account_updated",
                account_id=account_id,
                charges_enabled=profile.stripe_charges_enabled,
            )
        return WebhookResponse(status="ok", message="Account updated")

    logger.info("stripe_webhook_unhandled", event_type=event_type)
    return WebhookResponse(status="ok", message="Ignored")
