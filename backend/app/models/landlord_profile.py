import uuid
from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class LandlordProfile(Base):
    __tablename__ = "landlord_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    subscription_status: Mapped[str] = mapped_column(
        String(20),
        default="TRIAL",
        server_default="TRIAL",
        comment="CHECK IN ('TRIAL','ACTIVE','CANCELLED')",
    )
    subscription_expires_at: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )
    stripe_customer_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    stripe_connect_account_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    stripe_connect_onboarded: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false", nullable=False
    )
    stripe_charges_enabled: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false", nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="landlord_profile")
    properties: Mapped[list["Property"]] = relationship(
        "Property", back_populates="landlord", cascade="all, delete-orphan"
    )
