import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Lease(Base):
    __tablename__ = "leases"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    application_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("applications.id"),
        nullable=False,
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
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    monthly_rent: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    docusign_envelope_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(20),
        default="DRAFT",
        server_default="DRAFT",
        comment="CHECK IN ('DRAFT','SENT','SIGNED','ACTIVE','TERMINATED')",
    )
    signed_lease_s3_key: Mapped[str | None] = mapped_column(
        String(500), nullable=True
    )

    application: Mapped["Application"] = relationship(
        "Application", back_populates="lease"
    )
    property: Mapped["Property"] = relationship(
        "Property", back_populates="leases"
    )
    tenant: Mapped["TenantProfile"] = relationship("TenantProfile")
    rent_payments: Mapped[list["RentPayment"]] = relationship(
        "RentPayment",
        back_populates="lease",
        cascade="all, delete-orphan",
        order_by="RentPayment.due_date",
    )
