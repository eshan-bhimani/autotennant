import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY, TIMESTAMP, TSVECTOR, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Property(Base):
    __tablename__ = "properties"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    landlord_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("landlord_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    address_line1: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(2), nullable=False)
    zip: Mapped[str] = mapped_column(String(10), nullable=False)
    bedrooms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bathrooms: Mapped[float | None] = mapped_column(Numeric(3, 1), nullable=True)
    monthly_rent: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_optimized_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20),
        default="VACANT",
        server_default="VACANT",
        comment="CHECK IN ('VACANT','LISTED','OCCUPIED')",
    )
    listed_at: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )
    photos_s3_keys: Mapped[list[str] | None] = mapped_column(
        ARRAY(Text), nullable=True
    )
    search_vector: Mapped[str | None] = mapped_column(TSVECTOR, nullable=True)

    landlord: Mapped["LandlordProfile"] = relationship(
        "LandlordProfile", back_populates="properties"
    )
    applications: Mapped[list["Application"]] = relationship(
        "Application", back_populates="property", cascade="all, delete-orphan"
    )
    leases: Mapped[list["Lease"]] = relationship(
        "Lease", back_populates="property", cascade="all, delete-orphan"
    )
