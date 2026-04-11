from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

import sentry_sdk
import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.cache import close_cache
from app.config import settings
from app.exceptions import register_exception_handlers


def configure_logging() -> None:
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.dev.set_exc_info,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(0),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )


def configure_sentry() -> None:
    if settings.sentry_dsn:
        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            traces_sample_rate=0.1,
            profiles_sample_rate=0.1,
            environment="production" if not settings.debug else "development",
        )


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    yield
    await close_cache()


def create_app() -> FastAPI:
    configure_logging()
    configure_sentry()

    app = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "https://autotennant.com",
            "https://www.autotennant.com",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)

    from app.routers import (
        admin,
        applications,
        auth,
        leases,
        messages,
        payments,
        properties,
        viewings,
        webhooks,
    )
    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(properties.router, prefix="/properties", tags=["properties"])
    app.include_router(applications.router, prefix="/applications", tags=["applications"])
    app.include_router(viewings.router, prefix="/viewings", tags=["viewings"])
    app.include_router(leases.router, prefix="/leases", tags=["leases"])
    app.include_router(payments.router, prefix="/payments", tags=["payments"])
    app.include_router(messages.router, prefix="/messages", tags=["messages"])
    app.include_router(admin.router, prefix="/admin", tags=["admin"])
    app.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])

    return app


app = create_app()
