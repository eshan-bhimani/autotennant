import uuid
from datetime import date

from pydantic import BaseModel


class LeaseCreate(BaseModel):
    application_id: uuid.UUID
    start_date: date
    end_date: date
    monthly_rent: float


class LeaseResponse(BaseModel):
    id: uuid.UUID
    application_id: uuid.UUID
    property_id: uuid.UUID
    tenant_id: uuid.UUID
    start_date: date
    end_date: date
    monthly_rent: float
    docusign_envelope_id: str | None
    status: str
    signed_lease_url: str | None = None

    model_config = {"from_attributes": True}


class LeaseDownloadResponse(BaseModel):
    download_url: str
