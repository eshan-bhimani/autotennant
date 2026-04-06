from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import (
    GoogleAuthRequest,
    LoginRequest,
    MessageResponse,
    RefreshResponse,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services import auth_service

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(
    data: RegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    try:
        user, access_token, refresh_token = await auth_service.register_user(
            db,
            email=data.email,
            password=data.password,
            role=data.role,
            full_name=data.full_name,
            phone=data.phone,
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc))

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.refresh_token_expire_days * 86400,
        path="/auth/refresh",
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    try:
        user, access_token, refresh_token = await auth_service.login_user(
            db, email=data.email, password=data.password
        )
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.refresh_token_expire_days * 86400,
        path="/auth/refresh",
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/google", response_model=TokenResponse)
async def google_auth(
    data: GoogleAuthRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    try:
        user, access_token, refresh_token = await auth_service.google_auth(
            db, token=data.id_token
        )
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc))

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.refresh_token_expire_days * 86400,
        path="/auth/refresh",
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=RefreshResponse)
async def refresh(
    refresh_token: str | None = Cookie(default=None),
    db: AsyncSession = Depends(get_db),
) -> RefreshResponse:
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")

    try:
        new_access_token, _ = await auth_service.refresh_access_token(
            db, refresh_token
        )
    except (ValueError, Exception):
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    return RefreshResponse(access_token=new_access_token)


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.post("/logout", response_model=MessageResponse)
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    response.delete_cookie(
        key="refresh_token",
        path="/auth/refresh",
    )
    return MessageResponse(detail="Logged out successfully")
