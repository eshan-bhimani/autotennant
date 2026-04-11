"""Admin dashboard — aggregate stats and cross-tenant listings."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_role
from app.models.application import Application
from app.models.landlord_profile import LandlordProfile
from app.models.lease import Lease
from app.models.property import Property
from app.models.rent_payment import RentPayment
from app.models.tenant_profile import TenantProfile
from app.models.user import User
from app.schemas.admin import (
    AdminActivityItem,
    AdminPaymentRow,
    AdminPropertyRow,
    AdminStatsResponse,
    AdminUserRow,
)

router = APIRouter()


async def _scalar(db: AsyncSession, stmt) -> int:  # type: ignore[no-untyped-def]
    result = await db.execute(stmt)
    return int(result.scalar_one() or 0)


@router.get("/stats", response_model=AdminStatsResponse)
async def get_stats(
    _: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
) -> AdminStatsResponse:
    total_users = await _scalar(db, select(func.count()).select_from(User))
    total_landlords = await _scalar(
        db, select(func.count()).select_from(LandlordProfile)
    )
    total_tenants = await _scalar(
        db, select(func.count()).select_from(TenantProfile)
    )
    total_properties = await _scalar(
        db, select(func.count()).select_from(Property)
    )
    listed_properties = await _scalar(
        db,
        select(func.count())
        .select_from(Property)
        .where(Property.status == "LISTED"),
    )
    occupied_properties = await _scalar(
        db,
        select(func.count())
        .select_from(Property)
        .where(Property.status == "OCCUPIED"),
    )
    total_applications = await _scalar(
        db, select(func.count()).select_from(Application)
    )
    approved_applications = await _scalar(
        db,
        select(func.count())
        .select_from(Application)
        .where(Application.status == "APPROVED"),
    )
    active_leases = await _scalar(
        db,
        select(func.count())
        .select_from(Lease)
        .where(Lease.status.in_(["ACTIVE", "SIGNED"])),
    )

    gross_result = await db.execute(
        select(func.coalesce(func.sum(RentPayment.amount), 0)).where(
            RentPayment.status == "PAID"
        )
    )
    gross_volume = float(gross_result.scalar_one() or 0)

    fee_result = await db.execute(
        select(func.coalesce(func.sum(RentPayment.platform_fee), 0)).where(
            RentPayment.status == "PAID"
        )
    )
    platform_revenue = float(fee_result.scalar_one() or 0)

    paid_count = await _scalar(
        db,
        select(func.count())
        .select_from(RentPayment)
        .where(RentPayment.status == "PAID"),
    )
    pending_count = await _scalar(
        db,
        select(func.count())
        .select_from(RentPayment)
        .where(RentPayment.status.in_(["PENDING", "PROCESSING"])),
    )
    overdue_count = await _scalar(
        db,
        select(func.count())
        .select_from(RentPayment)
        .where(RentPayment.status == "LATE"),
    )

    return AdminStatsResponse(
        total_users=total_users,
        total_landlords=total_landlords,
        total_tenants=total_tenants,
        total_properties=total_properties,
        listed_properties=listed_properties,
        occupied_properties=occupied_properties,
        total_applications=total_applications,
        approved_applications=approved_applications,
        active_leases=active_leases,
        gross_payment_volume=round(gross_volume, 2),
        platform_revenue=round(platform_revenue, 2),
        paid_count=paid_count,
        pending_count=pending_count,
        overdue_count=overdue_count,
    )


@router.get("/users", response_model=list[AdminUserRow])
async def list_users(
    role: str | None = Query(None),
    limit: int = Query(50, le=200),
    _: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
) -> list[AdminUserRow]:
    stmt = select(User).order_by(User.created_at.desc()).limit(limit)
    if role:
        stmt = stmt.where(User.role == role)
    result = await db.execute(stmt)
    users = result.scalars().all()

    rows: list[AdminUserRow] = []
    for u in users:
        await db.refresh(u, ["landlord_profile", "tenant_profile"])
        full_name: str | None = None
        if u.landlord_profile:
            full_name = u.landlord_profile.full_name
        elif u.tenant_profile:
            full_name = u.tenant_profile.full_name
        rows.append(
            AdminUserRow(
                id=u.id,
                email=u.email,
                role=u.role,
                full_name=full_name,
                created_at=u.created_at,
            )
        )
    return rows


@router.get("/properties", response_model=list[AdminPropertyRow])
async def list_properties(
    limit: int = Query(50, le=200),
    _: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
) -> list[AdminPropertyRow]:
    stmt = (
        select(Property, LandlordProfile)
        .join(LandlordProfile, Property.landlord_id == LandlordProfile.id)
        .order_by(Property.listed_at.desc().nulls_last())
        .limit(limit)
    )
    result = await db.execute(stmt)
    rows: list[AdminPropertyRow] = []
    for prop, landlord in result.all():
        rows.append(
            AdminPropertyRow(
                id=prop.id,
                address_line1=prop.address_line1,
                city=prop.city,
                state=prop.state,
                monthly_rent=float(prop.monthly_rent) if prop.monthly_rent else None,
                status=prop.status,
                landlord_name=landlord.full_name,
            )
        )
    return rows


@router.get("/payments", response_model=list[AdminPaymentRow])
async def list_payments(
    limit: int = Query(100, le=500),
    _: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
) -> list[AdminPaymentRow]:
    stmt = (
        select(RentPayment, Lease, Property, LandlordProfile, TenantProfile)
        .join(Lease, RentPayment.lease_id == Lease.id)
        .join(Property, Lease.property_id == Property.id)
        .join(LandlordProfile, Property.landlord_id == LandlordProfile.id)
        .join(TenantProfile, Lease.tenant_id == TenantProfile.id)
        .order_by(RentPayment.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    rows: list[AdminPaymentRow] = []
    for payment, _lease, prop, landlord, tenant in result.all():
        rows.append(
            AdminPaymentRow(
                id=payment.id,
                lease_id=payment.lease_id,
                amount=float(payment.amount),
                platform_fee=float(payment.platform_fee),
                status=payment.status,
                due_date=payment.due_date,
                paid_at=payment.paid_at,
                tenant_name=tenant.full_name,
                landlord_name=landlord.full_name,
                property_address=f"{prop.address_line1}, {prop.city}, {prop.state}",
            )
        )
    return rows


@router.get("/activity", response_model=list[AdminActivityItem])
async def list_activity(
    limit: int = Query(25, le=100),
    _: User = Depends(require_role("ADMIN")),
    db: AsyncSession = Depends(get_db),
) -> list[AdminActivityItem]:
    items: list[AdminActivityItem] = []

    # Recent users
    user_result = await db.execute(
        select(User).order_by(User.created_at.desc()).limit(limit)
    )
    for u in user_result.scalars().all():
        items.append(
            AdminActivityItem(
                timestamp=u.created_at,
                kind="user_registered",
                message=f"{u.role.title()} {u.email} joined",
            )
        )

    # Recent applications
    app_result = await db.execute(
        select(Application).order_by(Application.submitted_at.desc()).limit(limit)
    )
    for a in app_result.scalars().all():
        items.append(
            AdminActivityItem(
                timestamp=a.submitted_at,
                kind="application_submitted",
                message=f"Application {a.id} — status {a.status}",
            )
        )

    # Recent payments
    pay_result = await db.execute(
        select(RentPayment).order_by(RentPayment.created_at.desc()).limit(limit)
    )
    for p in pay_result.scalars().all():
        items.append(
            AdminActivityItem(
                timestamp=p.created_at,
                kind="rent_payment",
                message=f"Rent ${float(p.amount):,.2f} — {p.status}",
            )
        )

    items.sort(key=lambda x: x.timestamp, reverse=True)
    return items[:limit]
