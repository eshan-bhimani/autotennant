from datetime import datetime, timedelta

import httpx
import structlog

from app.config import settings

logger = structlog.get_logger()

GOOGLE_CALENDAR_BASE = "https://www.googleapis.com/calendar/v3"


async def _get_access_token(refresh_token: str) -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            },
            timeout=15.0,
        )
        resp.raise_for_status()
        return resp.json()["access_token"]


async def create_event(
    oauth_refresh_token: str,
    summary: str,
    location: str,
    start_time: datetime,
    duration_minutes: int = 30,
    attendee_email: str | None = None,
) -> str:
    access_token = await _get_access_token(oauth_refresh_token)
    end_time = start_time + timedelta(minutes=duration_minutes)

    event_body: dict = {
        "summary": summary,
        "location": location,
        "start": {"dateTime": start_time.isoformat(), "timeZone": "UTC"},
        "end": {"dateTime": end_time.isoformat(), "timeZone": "UTC"},
    }
    if attendee_email:
        event_body["attendees"] = [{"email": attendee_email}]

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{GOOGLE_CALENDAR_BASE}/calendars/primary/events",
            headers={"Authorization": f"Bearer {access_token}"},
            json=event_body,
            timeout=15.0,
        )
        resp.raise_for_status()
        data = resp.json()

    logger.info("google_calendar_event_created", event_id=data["id"])
    return data["id"]


async def cancel_event(
    oauth_refresh_token: str,
    event_id: str,
) -> None:
    access_token = await _get_access_token(oauth_refresh_token)

    async with httpx.AsyncClient() as client:
        resp = await client.delete(
            f"{GOOGLE_CALENDAR_BASE}/calendars/primary/events/{event_id}",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=15.0,
        )
        resp.raise_for_status()

    logger.info("google_calendar_event_cancelled", event_id=event_id)


async def update_event_attendee(
    oauth_refresh_token: str,
    event_id: str,
    attendee_email: str,
) -> None:
    access_token = await _get_access_token(oauth_refresh_token)

    async with httpx.AsyncClient() as client:
        get_resp = await client.get(
            f"{GOOGLE_CALENDAR_BASE}/calendars/primary/events/{event_id}",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=15.0,
        )
        get_resp.raise_for_status()
        event = get_resp.json()

        attendees = event.get("attendees", [])
        attendees.append({"email": attendee_email})

        patch_resp = await client.patch(
            f"{GOOGLE_CALENDAR_BASE}/calendars/primary/events/{event_id}",
            headers={"Authorization": f"Bearer {access_token}"},
            json={"attendees": attendees},
            timeout=15.0,
        )
        patch_resp.raise_for_status()

    logger.info(
        "google_calendar_attendee_added",
        event_id=event_id,
        attendee=attendee_email,
    )
