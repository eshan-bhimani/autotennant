"""Rent collection via Stripe Connect + payment dashboard endpoints."""
from __future__ import annotations

import uuid
from datetime import date, timedelta
from decimal import Decimal

import structlog
from dateutil.relativedelta import relativedelta  # type: ignore[import-not-found]
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.landlord_profile import LandlordProfile
from app.models.lease import Lease
from app.models.property import Property
from app.models.rent_payment import RentPayment
from app.models.tenant_profile import TenantProfile
from app.models.user import User
from app.config import settings
from app.schemas.payment import (
    ConnectOnboardResponse,
    ConnectStatusResponse,
    GenerateScheduleRequest,
    LandlordPaymentRow,
    PaymentStatsResponse,
    RentCheckoutResponse,
    TenantPaymentRow,
)
from app.services import stripe_service

logger = structlog.get_logger()

router = APIRouter()


async def _get_landlord_profile(
    user: User, db: AsyncSession
) -> LandlordProfile:
    await db.refresh(user, ["landlord_profile"])
    if not user.landlord_profile:
        raise HTTPException(status_code=404, detail="Landlord profile not found")
    return user.landlord_profile


async def _get_tenant_profile(user: User, db: AsyncSession) -> TenantProfile:
    await db.refresh(user, ["tenant_profile"])
    if not user.tenant_profile:
        raise HTTPException(status_code=404, detail="Tenant profile not found")
    return user.tenant_profile


# ---------- Connect onboarding ----------


@router.post("/connect/onboard", response_model=ConnectOnboardResponse)
async def create_connect_onboarding(
    current_user: User = Depends(require_role("LANDLORD")),
    db: AsyncSession = Depends(get_db),
) -> ConnectOnboardResponse:
    profile = await _get_landlord_profile(current_user, db)

    account_id = profile.stripe_connect_account_id
    if not account_id:
        account_id = await stripe_service.create_connect_account(
            email=current_user.email,
            full_name=profile.full_name,
        )
        profile.stripe_connect_account_id = account_id
        await db.commit()

    onboarding_url = await stripe_service.create_account_link(account_id)
    return ConnectOnboardResponse(
        account_id=account_id, onboarding_url=onboarding_url
    )


@router.get("/connect/status", response_model=ConnectStatusResponse)
async def get_connect_status(
    current_user: User = Depends(require_role("LANDLORD")),
    db: AsyncSession = Depends(get_db),
) -> ConnectStatusResponse:
    profile = await _get_landlord_profile(current_user, db)

    if not profile.stripe_connect_account_id:
        return ConnectStatusResponse(
            onboarded=False,
            charges_enabled=False,
            payouts_enabled=False,
            details_submitted=False,
        )

    status = await stripe_service.get_account_status(profile.stripe_connect_account_id)
    onboarded = bool(status["details_submitted"]) and bool(status["charges_enabled"])

    if (
        profile.stripe_connect_onboarded != onboarded
        or profile.stripe_charges_enabled != bool(status["charges_enabled"])
    ):
        profile.stripe_connect_onboarded = onboarded
        profile.stripe_charges_enabled = bool(status["charges_enabled"])
        await db.commit()

    return ConnectStatusResponse(
        onboarded=onboarded,
        charges_enabled=bool(status["charges_enabled"]),
        payouts_enabled=bool(status["payouts_enabled"]),
        details_submitted=bool(status["details_submitted"]),
        account_id=profile.stripe_connect_account_id,
    )


# ---------- Schedule generation ----------


def _generate_schedule(lease: Lease, months: int) -> list[RentPayment]:
    rows: list[RentPayment] = []
    cursor = lease.start_date
    end = lease.end_date
    i = 0
    while cursor <= end and i < months:
        period_start = cursor
        period_end = cursor + relativedelta(months=1) - timedelta(days=1)
        if period_end > end:
            period_end = end
        due = period_start
        rows.append(
            RentPayment(
                lease_id=lease.id,
                period_start=period_start,
                period_end=period_end,
                due_date=due,
                amount=Decimal(str(lease.monthly_rent)),
                platform_fee=Decimal("0"),
                status="PENDING",
            )
        )
        cursor = cursor + relativedelta(months=1)
        i += 1
    return rows


@router.post("/schedule", status_code=201)
async def generate_schedule(
    req: GenerateScheduleRequest,
    current_user: User = Depends(require_role("LANDLORD")),
    db: AsyncSession = Depends(get_db),
) -> dict:
    profile = await _get_landlord_profile(current_user, db)

    lease = await db.get(Lease, req.lease_id)
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")

    prop = await db.get(Property, lease.property_id)
    if not prop or prop.landlord_id != profile.id:
        raise HTTPException(status_code=404, detail="Lease not found")

    # Idempotent — only generate if this lease has no existing schedule
    existing = await db.execute(
        select(func.count()).select_from(RentPayment).where(
            RentPayment.lease_id == lease.id
        )
    )
    if existing.scalar_one() > 0:
        return {"status": "ok", "created": 0, "message": "Schedule already exists"}

    rows = _generate_schedule(lease, req.months)
    for row in rows:
        db.add(row)
    await db.commit()

    return {"status": "ok", "created": len(rows)}


# ---------- Listing endpoints ----------


@router.get("/landlord", response_model=list[LandlordPaymentRow])
async def list_landlord_payments(
    status: str | None = Query(None),
    lease_id: uuid.UUID | None = Query(None),
    current_user: User = Depends(require_role("LANDLORD")),
    db: AsyncSession = Depends(get_db),
) -> list[LandlordPaymentRow]:
    profile = await _get_landlord_profile(current_user, db)

    stmt = (
        select(RentPayment, Lease, Property, TenantProfile)
        .join(Lease, RentPayment.lease_id == Lease.id)
        .join(Property, Lease.property_id == Property.id)
        .join(TenantProfile, Lease.tenant_id == TenantProfile.id)
        .where(Property.landlord_id == profile.id)
        .order_by(RentPayment.due_date.desc())
    )
    if status:
        stmt = stmt.where(RentPayment.status == status)
    if lease_id:
        stmt = stmt.where(RentPayment.lease_id == lease_id)

    result = await db.execute(stmt)
    rows: list[LandlordPaymentRow] = []
    for payment, _lease, prop, tenant in result.all():
        rows.append(
            LandlordPaymentRow(
                id=payment.id,
                lease_id=payment.lease_id,
                period_start=payment.period_start,
                period_end=payment.period_end,
                due_date=payment.due_date,
                amount=float(payment.amount),
                platform_fee=float(payment.platform_fee),
                status=payment.status,
                stripe_payment_intent_id=payment.stripe_payment_intent_id,
                paid_at=payment.paid_at,
                created_at=payment.created_at,
                tenant_name=tenant.full_name,
                property_address=f"{prop.address_line1}, {prop.city}, {prop.state}",
            )
        )
    return rows


@router.get("/tenant", response_model=list[TenantPaymentRow])
async def list_tenant_payments(
    current_user: User = Depends(require_role("TENANT")),
    db: AsyncSession = Depends(get_db),
) -> list[TenantPaymentRow]:
    profile = await _get_tenant_profile(current_user, db)

    stmt = (
        select(RentPayment, Lease, Property, LandlordProfile)
        .join(Lease, RentPayment.lease_id == Lease.id)
        .join(Property, Lease.property_id == Property.id)
        .join(LandlordProfile, Property.landlord_id == LandlordProfile.id)
        .where(Lease.tenant_id == profile.id)
        .order_by(RentPayment.due_date.desc())
    )
    result = await db.execute(stmt)
    rows: list[TenantPaymentRow] = []
    for payment, _lease, prop, landlord in result.all():
        rows.append(
            TenantPaymentRow(
                id=payment.id,
                lease_id=payment.lease_id,
                period_start=payment.period_start,
                period_end=payment.period_end,
                due_date=payment.due_date,
                amount=float(payment.amount),
                platform_fee=float(payment.platform_fee),
                status=payment.status,
                stripe_payment_intent_id=payment.stripe_payment_intent_id,
                paid_at=payment.paid_at,
                created_at=payment.created_at,
                property_address=f"{prop.address_line1}, {prop.city}, {prop.state}",
                landlord_name=landlord.full_name,
            )
        )
    return rows


@router.get("/landlord/stats", response_model=PaymentStatsResponse)
async def landlord_payment_stats(
    current_user: User = Depends(require_role("LANDLORD")),
    db: AsyncSession = Depends(get_db),
) -> PaymentStatsResponse:
    profile = await _get_landlord_profile(current_user, db)

    today = date.today()
    month_start = today.replace(day=1)
    next_month = (month_start + relativedelta(months=1))

    base = (
        select(RentPayment)
        .join(Lease, RentPayment.lease_id == Lease.id)
        .join(Property, Lease.property_id == Property.id)
        .where(Property.landlord_id == profile.id)
    )

    result = await db.execute(base)
    payments = result.scalars().all()

    collected = 0.0
    pending_mo = 0.0
    overdue_total = 0.0
    paid_ct = pending_ct = overdue_ct = 0

    for p in payments:
        amt = float(p.amount)
        in_month = month_start <= p.due_date < next_month
        if p.status == "PAID":
            if p.paid_at and month_start <= p.paid_at.date() < next_month:
                collected += amt
            paid_ct += 1
        elif p.status in ("PENDING", "PROCESSING"):
            if in_month:
                pending_mo += amt
            pending_ct += 1
            if p.due_date < today:
                overdue_total += amt
                overdue_ct += 1
        elif p.status == "LATE":
            overdue_total += amt
            overdue_ct += 1

    return PaymentStatsResponse(
        collected_this_month=round(collected, 2),
        pending_this_month=round(pending_mo, 2),
        overdue_total=round(overdue_total, 2),
        paid_count=paid_ct,
        pending_count=pending_ct,
        overdue_count=overdue_ct,
    )


# ---------- Tenant checkout ----------


@router.post(
    "/rent/{rent_payment_id}/checkout", response_model=RentCheckoutResponse
)
async def create_rent_checkout(
    rent_payment_id: uuid.UUID,
    current_user: User = Depends(require_role("TENANT")),
    db: AsyncSession = Depends(get_db),
) -> RentCheckoutResponse:
    profile = await _get_tenant_profile(current_user, db)

    payment = await db.get(RentPayment, rent_payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    lease = await db.get(Lease, payment.lease_id)
    if not lease or lease.tenant_id != profile.id:
        raise HTTPException(status_code=404, detail="Payment not found")

    if payment.status in ("PAID", "PROCESSING"):
        raise HTTPException(
            status_code=400, detail=f"Payment already {payment.status.lower()}"
        )

    prop = await db.get(Property, lease.property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    landlord = await db.get(LandlordProfile, prop.landlord_id)
    if not landlord or not landlord.stripe_connect_account_id:
        raise HTTPException(
            status_code=409,
            detail="Landlord has not completed Stripe Connect onboarding.",
        )
    if not landlord.stripe_charges_enabled:
        raise HTTPException(
            status_code=409,
            detail="Landlord's Stripe account cannot yet accept charges.",
        )

    amount_cents = int(round(float(payment.amount) * 100))
    frontend_base = settings.stripe_connect_return_url.split("/landlord")[0]
    success_url = (
        f"{frontend_base}/tenant/payments?status=success&session_id={{CHECKOUT_SESSION_ID}}"
    )
    cancel_url = f"{frontend_base}/tenant/payments?status=cancel"

    checkout = await stripe_service.create_rent_checkout_session(
        amount_cents=amount_cents,
        connect_account_id=landlord.stripe_connect_account_id,
        rent_payment_id=str(payment.id),
        lease_id=str(lease.id),
        tenant_email=current_user.email,
        property_address=f"{prop.address_line1}, {prop.city}, {prop.state}",
        success_url=success_url,
        cancel_url=cancel_url,
    )

    payment.stripe_payment_intent_id = (
        checkout["payment_intent_id"] if isinstance(checkout["payment_intent_id"], str) else None
    )
    payment.platform_fee = Decimal(str(checkout["application_fee_amount"] / 100))
    payment.status = "PROCESSING"
    await db.commit()

    return RentCheckoutResponse(
        checkout_url=checkout["checkout_url"],
        session_id=checkout["session_id"],
        amount=float(payment.amount),
        rent_payment_id=payment.id,
    )
