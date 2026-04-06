import uuid
from datetime import datetime, timedelta, timezone

import structlog
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.landlord_profile import LandlordProfile
from app.models.tenant_profile import TenantProfile
from app.models.user import User

logger = structlog.get_logger()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: uuid.UUID, role: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "role": role,
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
        "type": "access",
    }
    return jwt.encode(payload, settings.jwt_private_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(user_id: uuid.UUID) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(days=settings.refresh_token_expire_days),
        "type": "refresh",
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, settings.jwt_private_key, algorithm=settings.jwt_algorithm)


def decode_refresh_token(token: str) -> dict:
    payload = jwt.decode(token, settings.jwt_public_key, algorithms=[settings.jwt_algorithm])
    if payload.get("type") != "refresh":
        raise ValueError("Not a refresh token")
    return payload


async def register_user(
    db: AsyncSession,
    email: str,
    password: str,
    role: str,
    full_name: str,
    phone: str | None = None,
) -> tuple[User, str, str]:
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise ValueError("Email already registered")

    user = User(
        email=email,
        password_hash=hash_password(password),
        role=role,
    )
    db.add(user)
    await db.flush()

    if role == "LANDLORD":
        profile = LandlordProfile(user_id=user.id, full_name=full_name, phone=phone)
        db.add(profile)
    elif role == "TENANT":
        profile = TenantProfile(user_id=user.id, full_name=full_name, phone=phone)
        db.add(profile)

    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id)

    logger.info("user_registered", user_id=str(user.id), role=role)
    return user, access_token, refresh_token


async def login_user(
    db: AsyncSession, email: str, password: str
) -> tuple[User, str, str]:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash:
        raise ValueError("Invalid email or password")
    if not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password")

    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id)

    logger.info("user_logged_in", user_id=str(user.id))
    return user, access_token, refresh_token


async def google_auth(
    db: AsyncSession, token: str
) -> tuple[User, str, str]:
    try:
        idinfo = google_id_token.verify_oauth2_token(
            token, google_requests.Request(), settings.google_client_id
        )
    except Exception as exc:
        logger.warning("google_token_verification_failed", error=str(exc))
        raise ValueError("Invalid Google ID token") from exc

    google_id = idinfo["sub"]
    email = idinfo["email"]

    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()

    if not user:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if user:
            user.google_id = google_id
        else:
            user = User(
                email=email,
                google_id=google_id,
                role="TENANT",
            )
            db.add(user)
            await db.flush()
            profile = TenantProfile(
                user_id=user.id,
                full_name=idinfo.get("name", email.split("@")[0]),
            )
            db.add(profile)

        await db.commit()
        await db.refresh(user)

    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id)

    logger.info("google_auth_success", user_id=str(user.id))
    return user, access_token, refresh_token


async def refresh_access_token(
    db: AsyncSession, refresh_token_str: str
) -> tuple[str, User]:
    payload = decode_refresh_token(refresh_token_str)
    user_id = payload["sub"]

    user = await db.get(User, uuid.UUID(user_id))
    if not user:
        raise ValueError("User not found")

    new_access_token = create_access_token(user.id, user.role)
    return new_access_token, user
