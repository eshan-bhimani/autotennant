import uuid

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TenantProfile(Base):
    __tablename__ = "tenant_profiles"

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
    annual_income: Mapped[float | None] = mapped_column(
        Numeric(12, 2), nullable=True
    )
    employer_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    employment_status: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
        comment="CHECK IN ('EMPLOYED','SELF_EMPLOYED','STUDENT','OTHER')",
    )

    user: Mapped["User"] = relationship("User", back_populates="tenant_profile")
    applications: Mapped[list["Application"]] = relationship(
        "Application", back_populates="tenant", cascade="all, delete-orphan"
    )
