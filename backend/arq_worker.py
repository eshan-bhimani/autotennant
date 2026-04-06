from collections.abc import AsyncIterator

from arq.connections import RedisSettings
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import async_session
from app.workers.notification_worker import (
    send_application_received,
    send_decision_notification,
    send_score_ready,
    send_viewing_reminder,
)
from app.workers.screening_worker import run_screening


async def startup(ctx: dict) -> None:
    ctx["db_session"] = async_session()


async def shutdown(ctx: dict) -> None:
    session: AsyncSession = ctx["db_session"]
    await session.close()


class WorkerSettings:
    functions = [
        run_screening,
        send_application_received,
        send_score_ready,
        send_decision_notification,
        send_viewing_reminder,
    ]
    on_startup = startup
    on_shutdown = shutdown
    redis_settings = RedisSettings.from_dsn(settings.redis_url)
    max_jobs = 10
    job_timeout = 300
    keep_result = 3600
