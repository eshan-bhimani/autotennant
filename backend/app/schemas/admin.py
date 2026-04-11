from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AdminStatsResponse(BaseModel):
    total_users: int
    total_landlords: int
    total_tenants: int
    total_properties: int
    listed_properties: int
    occupied_properties: int
    total_applications: int
    approved_applications: int
    active_leases: int
    gross_payment_volume: float
    platform_revenue: float
    paid_count: int
    pending_count: int
    overdue_count: int


class AdminUserRow(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    role: str
    full_name: str | None = None
    created_at: datetime


class AdminPropertyRow(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    address_line1: str
    city: str
    state: str
    monthly_rent: float | None = None
    status: str
    landlord_name: str


class AdminPaymentRow(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    lease_id: UUID
    amount: float
    platform_fee: float
    status: str
    due_date: datetime | None = None
    paid_at: datetime | None = None
    tenant_name: str
    landlord_name: str
    property_address: str


class AdminActivityItem(BaseModel):
    timestamp: datetime
    kind: str
    message: str
