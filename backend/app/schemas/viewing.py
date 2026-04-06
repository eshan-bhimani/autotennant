import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ViewingCreate(BaseModel):
    application_id: uuid.UUID
    scheduled_at: datetime


class ViewingStatusUpdate(BaseModel):
    status: str = Field(pattern="^(COMPLETED|CANCELLED|NO_SHOW)$")
    landlord_notes: str | None = None


class ViewingResponse(BaseModel):
    id: uuid.UUID
    application_id: uuid.UUID
    scheduled_at: datetime
    google_event_id: str | None
    status: str
    landlord_notes: str | None

    model_config = {"from_attributes": True}


class ViewingListResponse(BaseModel):
    items: list[ViewingResponse]
    total: int
