"""In-app messaging between landlords and tenants."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

import structlog
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.landlord_profile import LandlordProfile
from app.models.message import Message, MessageThread
from app.models.property import Property
from app.models.tenant_profile import TenantProfile
from app.models.user import User
from app.schemas.message import (
    CreateThreadRequest,
    MessageOut,
    SendMessageRequest,
    ThreadOut,
    ThreadWithMessages,
)

logger = structlog.get_logger()

router = APIRouter()


async def _authorize_thread(
    thread: MessageThread, user: User, db: AsyncSession
) -> tuple[LandlordProfile | None, TenantProfile | None]:
    """Return (landlord, tenant) profiles if the user is a participant."""
    await db.refresh(user, ["landlord_profile", "tenant_profile"])

    landlord = await db.get(LandlordProfile, thread.landlord_id)
    tenant = await db.get(TenantProfile, thread.tenant_id)
    if not landlord or not tenant:
        raise HTTPException(status_code=404, detail="Thread not found")

    is_landlord = (
        user.landlord_profile is not None
        and user.landlord_profile.id == thread.landlord_id
    )
    is_tenant = (
        user.tenant_profile is not None
        and user.tenant_profile.id == thread.tenant_id
    )
    if not (is_landlord or is_tenant):
        raise HTTPException(status_code=404, detail="Thread not found")
    return landlord, tenant


async def _enrich_thread(
    thread: MessageThread,
    current_user: User,
    db: AsyncSession,
) -> ThreadOut:
    landlord = await db.get(LandlordProfile, thread.landlord_id)
    tenant = await db.get(TenantProfile, thread.tenant_id)
    prop = (
        await db.get(Property, thread.property_id) if thread.property_id else None
    )

    is_landlord = current_user.role == "LANDLORD"
    counterparty_name = tenant.full_name if is_landlord else landlord.full_name  # type: ignore[union-attr]
    counterparty_role = "TENANT" if is_landlord else "LANDLORD"

    last_msg_result = await db.execute(
        select(Message)
        .where(Message.thread_id == thread.id)
        .order_by(Message.created_at.desc())
        .limit(1)
    )
    last_msg = last_msg_result.scalar_one_or_none()

    unread_count_result = await db.execute(
        select(func.count())
        .select_from(Message)
        .where(
            and_(
                Message.thread_id == thread.id,
                Message.sender_user_id != current_user.id,
                Message.read_at.is_(None),
            )
        )
    )
    unread = unread_count_result.scalar_one()

    return ThreadOut(
        id=thread.id,
        landlord_id=thread.landlord_id,
        tenant_id=thread.tenant_id,
        property_id=thread.property_id,
        created_at=thread.created_at,
        last_message_at=thread.last_message_at,
        counterparty_name=counterparty_name,  # type: ignore[arg-type]
        counterparty_role=counterparty_role,
        property_address=(
            f"{prop.address_line1}, {prop.city}, {prop.state}" if prop else None
        ),
        last_message_preview=(last_msg.body[:120] if last_msg else None),
        unread_count=int(unread),
    )


@router.get("/threads", response_model=list[ThreadOut])
async def list_threads(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ThreadOut]:
    await db.refresh(current_user, ["landlord_profile", "tenant_profile"])

    if current_user.role == "LANDLORD":
        if not current_user.landlord_profile:
            return []
        stmt = select(MessageThread).where(
            MessageThread.landlord_id == current_user.landlord_profile.id
        )
    elif current_user.role == "TENANT":
        if not current_user.tenant_profile:
            return []
        stmt = select(MessageThread).where(
            MessageThread.tenant_id == current_user.tenant_profile.id
        )
    else:
        raise HTTPException(status_code=403, detail="Not allowed")

    stmt = stmt.order_by(MessageThread.last_message_at.desc())
    result = await db.execute(stmt)
    threads = result.scalars().all()

    return [await _enrich_thread(t, current_user, db) for t in threads]


@router.post("/threads", response_model=ThreadOut, status_code=201)
async def create_thread(
    data: CreateThreadRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ThreadOut:
    await db.refresh(current_user, ["landlord_profile", "tenant_profile"])

    counterparty = await db.get(User, data.counterparty_user_id)
    if not counterparty:
        raise HTTPException(status_code=404, detail="Counterparty not found")

    if current_user.role == "LANDLORD":
        if not current_user.landlord_profile:
            raise HTTPException(status_code=404, detail="Landlord profile not found")
        await db.refresh(counterparty, ["tenant_profile"])
        if not counterparty.tenant_profile:
            raise HTTPException(
                status_code=400, detail="Counterparty must be a tenant"
            )
        landlord_id = current_user.landlord_profile.id
        tenant_id = counterparty.tenant_profile.id
    elif current_user.role == "TENANT":
        if not current_user.tenant_profile:
            raise HTTPException(status_code=404, detail="Tenant profile not found")
        await db.refresh(counterparty, ["landlord_profile"])
        if not counterparty.landlord_profile:
            raise HTTPException(
                status_code=400, detail="Counterparty must be a landlord"
            )
        landlord_id = counterparty.landlord_profile.id
        tenant_id = current_user.tenant_profile.id
    else:
        raise HTTPException(status_code=403, detail="Not allowed")

    # Try to find an existing thread with the same participants + property
    stmt = select(MessageThread).where(
        and_(
            MessageThread.landlord_id == landlord_id,
            MessageThread.tenant_id == tenant_id,
            MessageThread.property_id == data.property_id,
        )
    )
    result = await db.execute(stmt)
    thread = result.scalar_one_or_none()

    if not thread:
        thread = MessageThread(
            landlord_id=landlord_id,
            tenant_id=tenant_id,
            property_id=data.property_id,
        )
        db.add(thread)
        await db.flush()

    if data.initial_message:
        msg = Message(
            thread_id=thread.id,
            sender_user_id=current_user.id,
            body=data.initial_message,
        )
        db.add(msg)
        thread.last_message_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(thread)
    return await _enrich_thread(thread, current_user, db)


@router.get("/threads/{thread_id}", response_model=ThreadWithMessages)
async def get_thread(
    thread_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ThreadWithMessages:
    thread = await db.get(MessageThread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    await _authorize_thread(thread, current_user, db)

    result = await db.execute(
        select(Message)
        .where(Message.thread_id == thread.id)
        .order_by(Message.created_at.asc())
    )
    messages = result.scalars().all()

    # Mark inbound messages as read
    now = datetime.now(timezone.utc)
    dirty = False
    for m in messages:
        if m.sender_user_id != current_user.id and m.read_at is None:
            m.read_at = now
            dirty = True
    if dirty:
        await db.commit()

    enriched = await _enrich_thread(thread, current_user, db)
    return ThreadWithMessages(
        **enriched.model_dump(),
        messages=[MessageOut.model_validate(m) for m in messages],
    )


@router.post(
    "/threads/{thread_id}/messages",
    response_model=MessageOut,
    status_code=201,
)
async def send_message(
    thread_id: uuid.UUID,
    data: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageOut:
    thread = await db.get(MessageThread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    await _authorize_thread(thread, current_user, db)

    msg = Message(
        thread_id=thread.id,
        sender_user_id=current_user.id,
        body=data.body.strip(),
    )
    db.add(msg)
    thread.last_message_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(msg)

    logger.info(
        "message_sent",
        thread_id=str(thread.id),
        sender=str(current_user.id),
    )
    return MessageOut.model_validate(msg)
