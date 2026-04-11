"""Stripe Connect + rent collection service.

Wraps the Stripe SDK so the rest of the app never touches stripe directly.
All network calls are run in a thread pool because the Stripe Python SDK is
synchronous.
"""
from __future__ import annotations

import asyncio
from typing import Any

import stripe
import structlog

from app.config import settings

logger = structlog.get_logger()


def _configure() -> None:
    if settings.stripe_secret_key and stripe.api_key != settings.stripe_secret_key:
        stripe.api_key = settings.stripe_secret_key


def _require_key() -> None:
    if not settings.stripe_secret_key or settings.stripe_secret_key.startswith(
        "sk_test_placeholder"
    ):
        raise RuntimeError(
            "Stripe is not configured. Set STRIPE_SECRET_KEY in environment."
        )


async def _run(fn, *args, **kwargs):  # type: ignore[no-untyped-def]
    return await asyncio.to_thread(fn, *args, **kwargs)


# ---------- Connect onboarding ----------


async def create_connect_account(email: str, full_name: str) -> str:
    _require_key()
    _configure()
    account = await _run(
        stripe.Account.create,
        type="express",
        email=email,
        business_type="individual",
        business_profile={
            "name": full_name,
            "product_description": "Residential rental income via AutoTenant",
        },
        capabilities={
            "transfers": {"requested": True},
            "card_payments": {"requested": True},
        },
    )
    logger.info("stripe_connect_account_created", account_id=account.id, email=email)
    return account.id


async def create_account_link(account_id: str) -> str:
    _require_key()
    _configure()
    link = await _run(
        stripe.AccountLink.create,
        account=account_id,
        refresh_url=settings.stripe_connect_refresh_url,
        return_url=settings.stripe_connect_return_url,
        type="account_onboarding",
    )
    return link.url


async def get_account_status(account_id: str) -> dict[str, Any]:
    _require_key()
    _configure()
    account = await _run(stripe.Account.retrieve, account_id)
    return {
        "charges_enabled": bool(account.charges_enabled),
        "payouts_enabled": bool(account.payouts_enabled),
        "details_submitted": bool(account.details_submitted),
        "requirements": account.requirements.to_dict_recursive()
        if getattr(account, "requirements", None)
        else {},
    }


# ---------- Rent collection ----------


def compute_platform_fee_cents(amount_cents: int) -> int:
    """Return the application_fee_amount in cents for a given rent amount."""
    bps = settings.stripe_platform_fee_bps
    return max(0, int(round(amount_cents * bps / 10_000)))


async def create_rent_checkout_session(
    *,
    amount_cents: int,
    connect_account_id: str,
    rent_payment_id: str,
    lease_id: str,
    tenant_email: str,
    property_address: str,
    success_url: str,
    cancel_url: str,
) -> dict[str, Any]:
    """Create a hosted Checkout Session using Stripe Connect destination charges.

    The platform (AutoTenant) is the merchant of record; funds are routed to
    the landlord's Connect account minus the application fee.
    """
    _require_key()
    _configure()

    fee_cents = compute_platform_fee_cents(amount_cents)
    session = await _run(
        stripe.checkout.Session.create,
        mode="payment",
        payment_method_types=["card", "us_bank_account"],
        customer_email=tenant_email,
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "unit_amount": amount_cents,
                    "product_data": {
                        "name": "Rent Payment",
                        "description": property_address,
                    },
                },
                "quantity": 1,
            }
        ],
        payment_intent_data={
            "application_fee_amount": fee_cents,
            "transfer_data": {"destination": connect_account_id},
            "receipt_email": tenant_email,
            "metadata": {
                "rent_payment_id": rent_payment_id,
                "lease_id": lease_id,
                "type": "rent_collection",
            },
        },
        metadata={
            "rent_payment_id": rent_payment_id,
            "lease_id": lease_id,
            "type": "rent_collection",
        },
        success_url=success_url,
        cancel_url=cancel_url,
    )
    return {
        "checkout_url": session.url,
        "session_id": session.id,
        "payment_intent_id": session.payment_intent,
        "application_fee_amount": fee_cents,
    }


# ---------- Webhook ----------


def verify_webhook(payload: bytes, signature: str) -> dict[str, Any]:
    _require_key()
    _configure()
    if not settings.stripe_webhook_secret:
        raise RuntimeError("STRIPE_WEBHOOK_SECRET not set")
    event = stripe.Webhook.construct_event(
        payload=payload,
        sig_header=signature,
        secret=settings.stripe_webhook_secret,
    )
    return event  # type: ignore[return-value]
