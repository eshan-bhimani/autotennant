"""Initial schema — all 7 tables

Revision ID: 001
Revises:
Create Date: 2026-04-05

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP, ARRAY, TSVECTOR

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- users ---
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=True),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("google_id", sa.String(255), nullable=True),
        sa.Column("created_at", TIMESTAMP(timezone=True), server_default=sa.text("NOW()")),
        sa.Column("updated_at", TIMESTAMP(timezone=True), server_default=sa.text("NOW()")),
        sa.CheckConstraint("role IN ('LANDLORD','TENANT','ADMIN')", name="ck_users_role"),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_google_id", "users", ["google_id"])

    # --- landlord_profiles ---
    op.create_table(
        "landlord_profiles",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("subscription_status", sa.String(20), server_default="TRIAL"),
        sa.Column("subscription_expires_at", TIMESTAMP(timezone=True), nullable=True),
        sa.Column("stripe_customer_id", sa.String(255), nullable=True),
        sa.CheckConstraint("subscription_status IN ('TRIAL','ACTIVE','CANCELLED')", name="ck_landlord_subscription"),
    )

    # --- tenant_profiles ---
    op.create_table(
        "tenant_profiles",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("annual_income", sa.Numeric(12, 2), nullable=True),
        sa.Column("employer_name", sa.String(255), nullable=True),
        sa.Column("employment_status", sa.String(20), nullable=True),
        sa.CheckConstraint("employment_status IN ('EMPLOYED','SELF_EMPLOYED','STUDENT','OTHER')", name="ck_tenant_employment"),
    )

    # --- properties ---
    op.create_table(
        "properties",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("landlord_id", UUID(as_uuid=True), sa.ForeignKey("landlord_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("address_line1", sa.String(255), nullable=False),
        sa.Column("city", sa.String(100), nullable=False),
        sa.Column("state", sa.String(2), nullable=False),
        sa.Column("zip", sa.String(10), nullable=False),
        sa.Column("bedrooms", sa.Integer, nullable=True),
        sa.Column("bathrooms", sa.Numeric(3, 1), nullable=True),
        sa.Column("monthly_rent", sa.Numeric(10, 2), nullable=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("ai_optimized_description", sa.Text, nullable=True),
        sa.Column("status", sa.String(20), server_default="VACANT"),
        sa.Column("listed_at", TIMESTAMP(timezone=True), nullable=True),
        sa.Column("photos_s3_keys", ARRAY(sa.Text), nullable=True),
        sa.Column("search_vector", TSVECTOR, nullable=True),
        sa.CheckConstraint("status IN ('VACANT','LISTED','OCCUPIED')", name="ck_property_status"),
    )
    op.create_index("ix_properties_landlord_id", "properties", ["landlord_id"])
    op.create_index("ix_properties_city", "properties", ["city"])
    op.create_index("ix_properties_status", "properties", ["status"])
    op.create_index("ix_properties_search_vector", "properties", ["search_vector"], postgresql_using="gin")

    # --- applications ---
    op.create_table(
        "applications",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("property_id", UUID(as_uuid=True), sa.ForeignKey("properties.id"), nullable=False),
        sa.Column("tenant_id", UUID(as_uuid=True), sa.ForeignKey("tenant_profiles.id"), nullable=False),
        sa.Column("status", sa.String(20), server_default="SUBMITTED"),
        sa.Column("qualification_score", sa.Integer, nullable=True),
        sa.Column("screening_report_s3_key", sa.String(500), nullable=True),
        sa.Column("smartmove_order_id", sa.String(255), nullable=True),
        sa.Column("landlord_notes", sa.Text, nullable=True),
        sa.Column("submitted_at", TIMESTAMP(timezone=True), server_default=sa.text("NOW()")),
        sa.Column("screened_at", TIMESTAMP(timezone=True), nullable=True),
        sa.Column("decided_at", TIMESTAMP(timezone=True), nullable=True),
        sa.CheckConstraint(
            "status IN ('SUBMITTED','SCREENING','SCORED','APPROVED','REJECTED','WITHDRAWN')",
            name="ck_application_status",
        ),
    )
    op.create_index("ix_applications_property_id", "applications", ["property_id"])
    op.create_index("ix_applications_tenant_id", "applications", ["tenant_id"])
    op.create_index("ix_applications_smartmove_order_id", "applications", ["smartmove_order_id"])

    # --- viewings ---
    op.create_table(
        "viewings",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("application_id", UUID(as_uuid=True), sa.ForeignKey("applications.id"), nullable=False),
        sa.Column("scheduled_at", TIMESTAMP(timezone=True), nullable=False),
        sa.Column("google_event_id", sa.String(255), nullable=True),
        sa.Column("status", sa.String(20), server_default="SCHEDULED"),
        sa.Column("landlord_notes", sa.Text, nullable=True),
        sa.CheckConstraint("status IN ('SCHEDULED','COMPLETED','CANCELLED','NO_SHOW')", name="ck_viewing_status"),
    )

    # --- leases ---
    op.create_table(
        "leases",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("application_id", UUID(as_uuid=True), sa.ForeignKey("applications.id"), nullable=False),
        sa.Column("property_id", UUID(as_uuid=True), sa.ForeignKey("properties.id"), nullable=False),
        sa.Column("tenant_id", UUID(as_uuid=True), sa.ForeignKey("tenant_profiles.id"), nullable=False),
        sa.Column("start_date", sa.Date, nullable=False),
        sa.Column("end_date", sa.Date, nullable=False),
        sa.Column("monthly_rent", sa.Numeric(10, 2), nullable=False),
        sa.Column("docusign_envelope_id", sa.String(255), nullable=True),
        sa.Column("status", sa.String(20), server_default="DRAFT"),
        sa.Column("signed_lease_s3_key", sa.String(500), nullable=True),
        sa.CheckConstraint("status IN ('DRAFT','SENT','SIGNED','ACTIVE','TERMINATED')", name="ck_lease_status"),
    )
    op.create_index("ix_leases_docusign_envelope_id", "leases", ["docusign_envelope_id"])

    # --- search_vector trigger ---
    op.execute("""
        CREATE OR REPLACE FUNCTION properties_search_vector_update() RETURNS trigger AS $$
        BEGIN
            NEW.search_vector :=
                setweight(to_tsvector('english', COALESCE(NEW.address_line1, '')), 'A') ||
                setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'A') ||
                setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
                setweight(to_tsvector('english', COALESCE(NEW.ai_optimized_description, '')), 'B');
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    op.execute("""
        CREATE TRIGGER trig_properties_search_vector
        BEFORE INSERT OR UPDATE ON properties
        FOR EACH ROW EXECUTE FUNCTION properties_search_vector_update();
    """)

    # --- updated_at trigger for users ---
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS trigger AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    op.execute("""
        CREATE TRIGGER trig_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS trig_users_updated_at ON users")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column()")
    op.execute("DROP TRIGGER IF EXISTS trig_properties_search_vector ON properties")
    op.execute("DROP FUNCTION IF EXISTS properties_search_vector_update()")

    op.drop_table("leases")
    op.drop_table("viewings")
    op.drop_table("applications")
    op.drop_table("properties")
    op.drop_table("tenant_profiles")
    op.drop_table("landlord_profiles")
    op.drop_table("users")
