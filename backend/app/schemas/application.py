import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ApplicationCreate(BaseModel):
    property_id: uuid.UUID


class ApplicationStatusUpdate(BaseModel):
    status: str = Field(pattern="^(APPROVED|REJECTED)$")


class ScreeningInitiate(BaseModel):
    pass


class ApplicationResponse(BaseModel):
    id: uuid.UUID
    property_id: uuid.UUID
    tenant_id: uuid.UUID
    status: str
    qualification_score: int | None
    screening_report_url: str | None = None
    smartmove_order_id: str | None
    landlord_notes: str | None
    submitted_at: datetime
    screened_at: datetime | None
    decided_at: datetime | None
    score_explanation: str | None = None

    model_config = {"from_attributes": True}


class ApplicationListResponse(BaseModel):
    items: list[ApplicationResponse]
    total: int


class ScreeningResponse(BaseModel):
    smartmove_order_id: str
    payment_url: str


class WebhookResponse(BaseModel):
    status: str
    message: str
