import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class PropertyCreate(BaseModel):
    address_line1: str = Field(max_length=255)
    city: str = Field(max_length=100)
    state: str = Field(min_length=2, max_length=2)
    zip: str = Field(max_length=10)
    bedrooms: int | None = None
    bathrooms: float | None = None
    monthly_rent: float | None = None
    description: str | None = None


class PropertyUpdate(BaseModel):
    address_line1: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, min_length=2, max_length=2)
    zip: str | None = Field(default=None, max_length=10)
    bedrooms: int | None = None
    bathrooms: float | None = None
    monthly_rent: float | None = None
    description: str | None = None
    status: str | None = Field(default=None, pattern="^(VACANT|LISTED|OCCUPIED)$")


class PropertyResponse(BaseModel):
    id: uuid.UUID
    landlord_id: uuid.UUID
    address_line1: str
    city: str
    state: str
    zip: str
    bedrooms: int | None
    bathrooms: float | None
    monthly_rent: float | None
    description: str | None
    ai_optimized_description: str | None
    status: str
    listed_at: datetime | None
    photos: list[str]
    application_count: int = 0

    model_config = {"from_attributes": True}


class PropertyListResponse(BaseModel):
    items: list[PropertyResponse]
    total: int


class PropertySearchResponse(BaseModel):
    items: list[PropertyResponse]
    total: int
    page: int
    per_page: int


class PhotoUploadResponse(BaseModel):
    upload_url: str
    s3_key: str


class PhotoConfirmRequest(BaseModel):
    s3_key: str


class OptimizedListingResponse(BaseModel):
    description: str
    suggested_price: int
    tags: list[str]
