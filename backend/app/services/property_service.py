import uuid
from datetime import datetime, timezone

import structlog
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.cache import get_cache
from app.models.application import Application
from app.models.landlord_profile import LandlordProfile
from app.models.property import Property
from app.schemas.property import PropertyCreate, PropertyUpdate
from app.services import ai_service, s3_service

logger = structlog.get_logger()


def _to_response(prop: Property, application_count: int = 0) -> dict:
    return {
        "id": prop.id,
        "landlord_id": prop.landlord_id,
        "address_line1": prop.address_line1,
        "city": prop.city,
        "state": prop.state,
        "zip": prop.zip,
        "bedrooms": prop.bedrooms,
        "bathrooms": float(prop.bathrooms) if prop.bathrooms is not None else None,
        "monthly_rent": float(prop.monthly_rent) if prop.monthly_rent is not None else None,
        "description": prop.description,
        "ai_optimized_description": prop.ai_optimized_description,
        "status": prop.status,
        "listed_at": prop.listed_at,
        "photos": s3_service.photo_urls(prop.photos_s3_keys),
        "application_count": application_count,
    }


async def _invalidate_property_cache(property_id: uuid.UUID, city: str | None = None) -> None:
    cache = await get_cache()
    await cache.delete(f"property:{property_id}")
    if city:
        keys = [k async for k in cache.scan_iter(f"search:{city.lower()}:*")]
        if keys:
            await cache.delete(*keys)


async def get_landlord_properties(
    db: AsyncSession, landlord_profile: LandlordProfile
) -> dict:
    stmt = (
        select(Property, func.count(Application.id).label("app_count"))
        .outerjoin(Application, Application.property_id == Property.id)
        .where(Property.landlord_id == landlord_profile.id)
        .group_by(Property.id)
        .order_by(Property.created_at.desc() if hasattr(Property, "created_at") else Property.id)
    )
    result = await db.execute(stmt)
    rows = result.all()

    items = [_to_response(prop, app_count) for prop, app_count in rows]
    return {"items": items, "total": len(items)}


async def create_property(
    db: AsyncSession, landlord_profile: LandlordProfile, data: PropertyCreate
) -> dict:
    prop = Property(
        landlord_id=landlord_profile.id,
        address_line1=data.address_line1,
        city=data.city,
        state=data.state,
        zip=data.zip,
        bedrooms=data.bedrooms,
        bathrooms=data.bathrooms,
        monthly_rent=data.monthly_rent,
        description=data.description,
    )
    db.add(prop)
    await db.commit()
    await db.refresh(prop)

    await _invalidate_property_cache(prop.id, prop.city)
    logger.info("property_created", property_id=str(prop.id))
    return _to_response(prop)


async def get_property(
    db: AsyncSession, property_id: uuid.UUID, landlord_profile: LandlordProfile
) -> dict:
    prop = await db.get(Property, property_id)
    if not prop or prop.landlord_id != landlord_profile.id:
        raise ValueError("Property not found")

    app_count_result = await db.execute(
        select(func.count(Application.id)).where(Application.property_id == property_id)
    )
    app_count = app_count_result.scalar() or 0

    return _to_response(prop, app_count)


async def update_property(
    db: AsyncSession,
    property_id: uuid.UUID,
    landlord_profile: LandlordProfile,
    data: PropertyUpdate,
) -> dict:
    prop = await db.get(Property, property_id)
    if not prop or prop.landlord_id != landlord_profile.id:
        raise ValueError("Property not found")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prop, field, value)

    if data.status == "LISTED" and not prop.listed_at:
        prop.listed_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(prop)

    await _invalidate_property_cache(prop.id, prop.city)
    logger.info("property_updated", property_id=str(prop.id))
    return _to_response(prop)


async def delete_property(
    db: AsyncSession, property_id: uuid.UUID, landlord_profile: LandlordProfile
) -> None:
    prop = await db.get(Property, property_id)
    if not prop or prop.landlord_id != landlord_profile.id:
        raise ValueError("Property not found")

    prop.status = "VACANT"
    await db.commit()

    await _invalidate_property_cache(prop.id, prop.city)
    logger.info("property_soft_deleted", property_id=str(prop.id))


async def optimize_listing(
    db: AsyncSession, property_id: uuid.UUID, landlord_profile: LandlordProfile
) -> dict[str, str | int | list[str]]:
    prop = await db.get(Property, property_id)
    if not prop or prop.landlord_id != landlord_profile.id:
        raise ValueError("Property not found")

    result = await ai_service.optimize_listing(prop)
    prop.ai_optimized_description = result["description"]
    await db.commit()

    await _invalidate_property_cache(prop.id, prop.city)
    return result


async def generate_photo_upload_url(
    db: AsyncSession, property_id: uuid.UUID, landlord_profile: LandlordProfile
) -> tuple[str, str]:
    prop = await db.get(Property, property_id)
    if not prop or prop.landlord_id != landlord_profile.id:
        raise ValueError("Property not found")

    return s3_service.generate_upload_url(property_id)


async def confirm_photo_upload(
    db: AsyncSession,
    property_id: uuid.UUID,
    landlord_profile: LandlordProfile,
    s3_key: str,
) -> None:
    prop = await db.get(Property, property_id)
    if not prop or prop.landlord_id != landlord_profile.id:
        raise ValueError("Property not found")

    if prop.photos_s3_keys is None:
        prop.photos_s3_keys = [s3_key]
    else:
        prop.photos_s3_keys = [*prop.photos_s3_keys, s3_key]

    await db.commit()
    await _invalidate_property_cache(prop.id, prop.city)
    logger.info("photo_confirmed", property_id=str(prop.id), s3_key=s3_key)


async def search_properties(
    db: AsyncSession, query: str, skip: int = 0, limit: int = 20
) -> dict:
    cache = await get_cache()
    cache_key = f"search:{query.lower()}:{skip}:{limit}"
    cached = await cache.get(cache_key)
    if cached:
        import json
        return json.loads(cached)

    count_stmt = (
        select(func.count(Property.id))
        .where(Property.status == "LISTED")
        .where(
            Property.search_vector.op("@@")(func.plainto_tsquery("english", query))
        )
    )
    total = (await db.execute(count_stmt)).scalar() or 0

    stmt = (
        select(Property)
        .where(Property.status == "LISTED")
        .where(
            Property.search_vector.op("@@")(func.plainto_tsquery("english", query))
        )
        .order_by(
            func.ts_rank(Property.search_vector, func.plainto_tsquery("english", query)).desc()
        )
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    properties = result.scalars().all()

    response = {
        "items": [_to_response(p) for p in properties],
        "total": total,
        "page": (skip // limit) + 1,
        "per_page": limit,
    }

    import json
    await cache.setex(cache_key, 60, json.dumps(response, default=str))
    return response
