import uuid

import boto3
import structlog
from sqlalchemy.ext.asyncio import AsyncSession
from twilio.rest import Client as TwilioClient

from app.config import settings
from app.models.user import User
from app.services import ai_service

logger = structlog.get_logger()

_ses = boto3.client("ses", region_name=settings.aws_region)

_twilio: TwilioClient | None = None


def _get_twilio() -> TwilioClient:
    global _twilio
    if _twilio is None:
        _twilio = TwilioClient(settings.twilio_account_sid, settings.twilio_auth_token)
    return _twilio


async def send_email(
    recipient_user_id: uuid.UUID,
    subject: str,
    event: str,
    context: dict[str, str],
    db: AsyncSession,
) -> None:
    user = await db.get(User, recipient_user_id)
    if not user:
        logger.warning("email_recipient_not_found", user_id=str(recipient_user_id))
        return

    body = await ai_service.draft_communication(event, context)

    _ses.send_email(
        Source=settings.aws_ses_from_email,
        Destination={"ToAddresses": [user.email]},
        Message={
            "Subject": {"Data": subject, "Charset": "UTF-8"},
            "Body": {
                "Text": {"Data": body, "Charset": "UTF-8"},
            },
        },
    )

    logger.info(
        "email_sent",
        recipient=user.email,
        subject=subject,
        event=event,
    )


async def send_sms(
    phone: str,
    event: str,
    context: dict[str, str],
) -> None:
    body = await ai_service.draft_communication(event, context)

    client = _get_twilio()
    client.messages.create(
        body=body,
        from_=settings.twilio_phone_number,
        to=phone,
    )

    logger.info("sms_sent", phone=phone, event=event)
