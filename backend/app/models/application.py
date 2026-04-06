import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import TIMESTAMP, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    property_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("properties.id"),
        nullable=False,
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenant_profiles.id"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(20),
        default="SUBMITTED",
        server_default="SUBMITTED",
        comment="CHECK IN ('SUBMITTED','SCREENING','SCORED','APPROVED','REJECTED','WITHDRAWN')",
    )
    qualification_score: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )
    screening_report_s3_key: Mapped[str | None] = mapped_column(
        String(500), nullable=True
    )
    smartmove_order_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    landlord_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    screened_at: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )
    decided_at: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )

    property: Mapped["Property"] = relationship(
        "Property", back_populates="applications"
    )
    tenant: Mapped["TenantProfile"] = relationship(
        "TenantProfile", back_populates="applications"
    )
    viewings: Mapped[list["Viewing"]] = relationship(
        "Viewing", back_populates="application", cascade="all, delete-orphan"
    )
    lease: Mapped["Lease | None"] = relationship(
        "Lease", back_populates="application", uselist=False
    )
