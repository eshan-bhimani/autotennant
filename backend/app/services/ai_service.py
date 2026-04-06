import json

import anthropic
import structlog

from app.config import settings
from app.models.property import Property

logger = structlog.get_logger()

_client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)


async def optimize_listing(prop: Property) -> dict[str, str | int | list[str]]:
    msg = await _client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=(
            "You are a professional real estate copywriter. "
            "Return ONLY valid JSON — no markdown, no preamble. "
            "Schema: {description: str, suggested_price: int, tags: list[str]}. "
            "description must be under 200 words. Never fabricate amenities."
        ),
        messages=[
            {
                "role": "user",
                "content": (
                    f"Property: {prop.bedrooms}bd/{prop.bathrooms}ba, "
                    f"{prop.address_line1}, {prop.city}, {prop.state}. "
                    f"Current rent: ${prop.monthly_rent}/mo. "
                    f"Owner notes: {prop.description or 'None'}"
                ),
            }
        ],
    )
    result: dict[str, str | int | list[str]] = json.loads(msg.content[0].text)
    logger.info("listing_optimized", property_id=str(prop.id))
    return result


async def explain_score(
    qualification_score: int,
    factors: dict[str, float],
) -> str:
    msg = await _client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        system=(
            "You are a fair housing-compliant rental analyst. "
            "Explain the qualification score to a landlord in plain English. "
            "Never reference or infer race, national origin, religion, sex, "
            "disability, or familial status. Focus only on financial factors."
        ),
        messages=[
            {
                "role": "user",
                "content": (
                    f"Score: {qualification_score}/100. "
                    f"Factor breakdown: {json.dumps(factors)}"
                ),
            }
        ],
    )
    return msg.content[0].text


async def draft_communication(event: str, context: dict[str, str]) -> str:
    msg = await _client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        system=(
            "You are a professional property management assistant. "
            "Draft a concise, friendly notification message. "
            "Never reference or infer race, national origin, religion, sex, "
            "disability, or familial status."
        ),
        messages=[
            {
                "role": "user",
                "content": f"Event: {event}. Context: {json.dumps(context)}",
            }
        ],
    )
    return msg.content[0].text
