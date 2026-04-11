from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ConnectOnboardResponse(BaseModel):
    account_id: str
    onboarding_url: str


class ConnectStatusResponse(BaseModel):
    onboarded: bool
    charges_enabled: bool
    payouts_enabled: bool
    details_submitted: bool
    account_id: str | None = None


class RentPaymentBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    lease_id: UUID
    period_start: date
    period_end: date
    due_date: date
    amount: float
    platform_fee: float
    status: str
    stripe_payment_intent_id: str | None = None
    paid_at: datetime | None = None
    created_at: datetime


class LandlordPaymentRow(RentPaymentBase):
    tenant_name: str
    property_address: str


class TenantPaymentRow(RentPaymentBase):
    property_address: str
    landlord_name: str


class RentCheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str
    amount: float
    rent_payment_id: UUID


class PaymentStatsResponse(BaseModel):
    collected_this_month: float
    pending_this_month: float
    overdue_total: float
    paid_count: int
    pending_count: int
    overdue_count: int


class GenerateScheduleRequest(BaseModel):
    lease_id: UUID
    months: int = 12
