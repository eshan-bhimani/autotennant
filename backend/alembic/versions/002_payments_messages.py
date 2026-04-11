"""Payments, messaging, Stripe Connect

Revision ID: 002
Revises: 001
Create Date: 2026-04-07

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import TIMESTAMP, UUID

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- landlord_profiles: Stripe Connect ---
    op.add_column(
        "landlord_profiles",
        sa.Column("stripe_connect_account_id", sa.String(255), nullable=True),
    )
    op.add_column(
        "landlord_profiles",
        sa.Column(
            "stripe_connect_onboarded",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )
    op.add_column(
        "landlord_profiles",
        sa.Column(
            "stripe_charges_enabled",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )

    # --- rent_payments ---
    op.create_table(
        "rent_payments",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "lease_id",
            UUID(as_uuid=True),
            sa.ForeignKey("leases.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("period_start", sa.Date, nullable=False),
        sa.Column("period_end", sa.Date, nullable=False),
        sa.Column("due_date", sa.Date, nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column(
            "platform_fee",
            sa.Numeric(10, 2),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "status",
            sa.String(20),
            nullable=False,
            server_default="PENDING",
        ),
        sa.Column("stripe_payment_intent_id", sa.String(255), nullable=True),
        sa.Column("paid_at", TIMESTAMP(timezone=True), nullable=True),
        sa.Column("reminder_sent_at", TIMESTAMP(timezone=True), nullable=True),
        sa.Column("overdue_notice_sent_at", TIMESTAMP(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            TIMESTAMP(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            TIMESTAMP(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "status IN ('PENDING','PROCESSING','PAID','LATE','FAILED','REFUNDED')",
            name="ck_rent_payment_status",
        ),
    )
    op.create_index("ix_rent_payments_lease_id", "rent_payments", ["lease_id"])
    op.create_index("ix_rent_payments_status", "rent_payments", ["status"])
    op.create_index("ix_rent_payments_due_date", "rent_payments", ["due_date"])
    op.create_index(
        "ix_rent_payments_stripe_pi",
        "rent_payments",
        ["stripe_payment_intent_id"],
    )
    op.create_unique_constraint(
        "uq_rent_payments_lease_period",
        "rent_payments",
        ["lease_id", "period_start"],
    )

    # --- message_threads ---
    op.create_table(
        "message_threads",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "landlord_id",
            UUID(as_uuid=True),
            sa.ForeignKey("landlord_profiles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "tenant_id",
            UUID(as_uuid=True),
            sa.ForeignKey("tenant_profiles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "property_id",
            UUID(as_uuid=True),
            sa.ForeignKey("properties.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            TIMESTAMP(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.Column(
            "last_message_at",
            TIMESTAMP(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.UniqueConstraint(
            "landlord_id",
            "tenant_id",
            "property_id",
            name="uq_thread_participants",
        ),
    )
    op.create_index(
        "ix_message_threads_landlord_id", "message_threads", ["landlord_id"]
    )
    op.create_index(
        "ix_message_threads_tenant_id", "message_threads", ["tenant_id"]
    )
    op.create_index(
        "ix_message_threads_last_message_at",
        "message_threads",
        ["last_message_at"],
    )

    # --- messages ---
    op.create_table(
        "messages",
        sa.Column(
            "id",
            UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column(
            "thread_id",
            UUID(as_uuid=True),
            sa.ForeignKey("message_threads.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "sender_user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("body", sa.Text, nullable=False),
        sa.Column("read_at", TIMESTAMP(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            TIMESTAMP(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
    )
    op.create_index("ix_messages_thread_id", "messages", ["thread_id"])
    op.create_index("ix_messages_created_at", "messages", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_messages_created_at", table_name="messages")
    op.drop_index("ix_messages_thread_id", table_name="messages")
    op.drop_table("messages")

    op.drop_index(
        "ix_message_threads_last_message_at", table_name="message_threads"
    )
    op.drop_index("ix_message_threads_tenant_id", table_name="message_threads")
    op.drop_index("ix_message_threads_landlord_id", table_name="message_threads")
    op.drop_table("message_threads")

    op.drop_constraint(
        "uq_rent_payments_lease_period", "rent_payments", type_="unique"
    )
    op.drop_index("ix_rent_payments_stripe_pi", table_name="rent_payments")
    op.drop_index("ix_rent_payments_due_date", table_name="rent_payments")
    op.drop_index("ix_rent_payments_status", table_name="rent_payments")
    op.drop_index("ix_rent_payments_lease_id", table_name="rent_payments")
    op.drop_table("rent_payments")

    op.drop_column("landlord_profiles", "stripe_charges_enabled")
    op.drop_column("landlord_profiles", "stripe_connect_onboarded")
    op.drop_column("landlord_profiles", "stripe_connect_account_id")
