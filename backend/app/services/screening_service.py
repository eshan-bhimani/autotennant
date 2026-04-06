import hashlib
import hmac

import httpx
import structlog

from app.config import settings
from app.models.application import Application

logger = structlog.get_logger()

SMARTMOVE_BASE_URL = "https://api.smartmove.us/v1"


class SmartMoveOrder:
    def __init__(self, order_id: str, payment_url: str) -> None:
        self.id = order_id
        self.payment_url = payment_url


async def initiate(application: Application) -> SmartMoveOrder:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SMARTMOVE_BASE_URL}/screenings",
            headers={
                "Authorization": f"Bearer {settings.smartmove_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "application_id": str(application.id),
                "property_id": str(application.property_id),
                "tenant_id": str(application.tenant_id),
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()

    logger.info(
        "smartmove_screening_initiated",
        application_id=str(application.id),
        order_id=data["order_id"],
    )
    return SmartMoveOrder(
        order_id=data["order_id"],
        payment_url=data["payment_url"],
    )


def verify_webhook_signature(payload: bytes, signature: str) -> bool:
    expected = hmac.new(
        settings.smartmove_webhook_secret.encode(),
        payload,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def parse_screening_result(data: dict) -> dict:
    return {
        "order_id": data["order_id"],
        "credit_score": data.get("credit_score"),
        "has_evictions": data.get("has_evictions", False),
        "report_s3_key": data.get("report_url"),
    }
