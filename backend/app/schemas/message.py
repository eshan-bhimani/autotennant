from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    thread_id: UUID
    sender_user_id: UUID
    body: str
    read_at: datetime | None = None
    created_at: datetime


class ThreadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    landlord_id: UUID
    tenant_id: UUID
    property_id: UUID | None = None
    created_at: datetime
    last_message_at: datetime

    # Enriched
    counterparty_name: str
    counterparty_role: str
    property_address: str | None = None
    last_message_preview: str | None = None
    unread_count: int = 0


class ThreadWithMessages(ThreadOut):
    messages: list[MessageOut] = []


class CreateThreadRequest(BaseModel):
    counterparty_user_id: UUID
    property_id: UUID | None = None
    initial_message: str | None = None


class SendMessageRequest(BaseModel):
    body: str = Field(..., min_length=1, max_length=5000)
