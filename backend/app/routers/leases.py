import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.application import Application
from app.models.landlord_profile import LandlordProfile
from app.models.lease import Lease
from app.models.property import Property
from app.models.tenant_profile import TenantProfile
from app.models.user import User
from app.schemas.lease import LeaseCreate, LeaseDownloadResponse, LeaseResponse
from app.services import docusign_service, s3_service

router = APIRouter()


async def _get_landlord_profile(
    current_user: User, db: AsyncSession
) -> LandlordProfile:
    await db.refresh(current_user, ["landlord_profile"])
    if not current_user.landlord_profile:
        raise HTTPException(status_code=404, detail="Landlord profile not found")
    return current_user.landlord_profile


def _to_response(lease: Lease) -> dict:
    signed_lease_url = None
    if lease.signed_lease_s3_key:
        signed_lease_url = s3_service.sensitive_url(lease.signed_lease_s3_key)
    return {
        "id": lease.id,
        "application_id": lease.application_id,
        "property_id": lease.property_id,
        "tenant_id": lease.tenant_id,
        "start_date": lease.start_date,
        "end_date": lease.end_date,
        "monthly_rent": float(lease.monthly_rent),
        "docusign_envelope_id": lease.docusign_envelope_id,
        "status": lease.status,
        "signed_lease_url": signed_lease_url,
    }


@router.post("", response_model=LeaseResponse, status_code=201)
async def create_lease(
    data: LeaseCreate,
    current_user: User = Depends(require_role("LANDLORD")),
    db: AsyncSession = Depends(get_db),
) -> LeaseResponse:
    profile = await _get_landlord_profile(current_user, db)

    app = await db.get(Application, data.application_id)
    if not app or app.status != "APPROVED":
        raise HTTPException(
            status_code=400, detail="Application not found or not approved"
        )

    prop = await db.get(Property, app.property_id)
    if not prop or prop.landlord_id != profile.id:
        raise HTTPException(status_code=404, detail="Property not found")

    lease = Lease(
        application_id=data.application_id,
        property_id=app.property_id,
        tenant_id=app.tenant_id,
        start_date=data.start_date,
        end_date=data.end_date,
        monthly_rent=data.monthly_rent,
    )
    db.add(lease)
    await db.commit()
    await db.refresh(lease)

    return LeaseResponse(**_to_response(lease))


@router.get("/{lease_id}", response_model=LeaseResponse)
async def get_lease(
    lease_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LeaseResponse:
    lease = await db.get(Lease, lease_id)
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")

    if current_user.role == "LANDLORD":
        prop = await db.get(Property, lease.property_id)
        await db.refresh(current_user, ["landlord_profile"])
        if not prop or not current_user.landlord_profile or prop.landlord_id != current_user.landlord_profile.id:
            raise HTTPException(status_code=404, detail="Lease not found")
    elif current_user.role == "TENANT":
        await db.refresh(current_user, ["tenant_profile"])
        if not current_user.tenant_profile or lease.tenant_id != current_user.tenant_profile.id:
            raise HTTPException(status_code=404, detail="Lease not found")

    return LeaseResponse(**_to_response(lease))


@router.post("/{lease_id}/send", response_model=LeaseResponse)
async def send_lease(
    lease_id: uuid.UUID,
    current_user: User = Depends(require_role("LANDLORD")),
    db: AsyncSession = Depends(get_db),
) -> LeaseResponse:
    profile = await _get_landlord_profile(current_user, db)

    lease = await db.get(Lease, lease_id)
    if not lease or lease.status != "DRAFT":
        raise HTTPException(
            status_code=400, detail="Lease not found or not in DRAFT status"
        )

    prop = await db.get(Property, lease.property_id)
    if not prop or prop.landlord_id != profile.id:
        raise HTTPException(status_code=404, detail="Property not found")

    if lease.docusign_envelope_id:
        await docusign_service.send_envelope(lease.docusign_envelope_id)
    else:
        tenant = await db.get(TenantProfile, lease.tenant_id)
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")

        tenant_user = await db.get(User, tenant.user_id)
        if not tenant_user:
            raise HTTPException(status_code=404, detail="Tenant user not found")

        envelope_id = await docusign_service.create_envelope(
            landlord_email=current_user.email,
            landlord_name=profile.full_name,
            tenant_email=tenant_user.email,
            tenant_name=tenant.full_name,
            lease_document_b64="",  # generated from lease template
            document_name=f"Lease — {prop.address_line1}",
        )
        lease.docusign_envelope_id = envelope_id
        await docusign_service.send_envelope(envelope_id)

    lease.status = "SENT"
    await db.commit()
    await db.refresh(lease)

    return LeaseResponse(**_to_response(lease))


@router.get("/{lease_id}/download", response_model=LeaseDownloadResponse)
async def download_lease(
    lease_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LeaseDownloadResponse:
    lease = await db.get(Lease, lease_id)
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")

    if current_user.role == "LANDLORD":
        prop = await db.get(Property, lease.property_id)
        await db.refresh(current_user, ["landlord_profile"])
        if not prop or not current_user.landlord_profile or prop.landlord_id != current_user.landlord_profile.id:
            raise HTTPException(status_code=404, detail="Lease not found")
    elif current_user.role == "TENANT":
        await db.refresh(current_user, ["tenant_profile"])
        if not current_user.tenant_profile or lease.tenant_id != current_user.tenant_profile.id:
            raise HTTPException(status_code=404, detail="Lease not found")

    if not lease.signed_lease_s3_key:
        raise HTTPException(status_code=404, detail="Signed lease not yet available")

    url = s3_service.sensitive_url(lease.signed_lease_s3_key)
    return LeaseDownloadResponse(download_url=url)
