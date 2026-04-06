import httpx
import structlog

from app.config import settings

logger = structlog.get_logger()

DOCUSIGN_BASE = "https://demo.docusign.net/restapi/v2.1"


async def _get_access_token() -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://account-d.docusign.com/oauth/token",
            data={
                "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
                "assertion": settings.docusign_integration_key,
            },
            timeout=15.0,
        )
        resp.raise_for_status()
        return resp.json()["access_token"]


async def create_envelope(
    landlord_email: str,
    landlord_name: str,
    tenant_email: str,
    tenant_name: str,
    lease_document_b64: str,
    document_name: str = "Lease Agreement",
) -> str:
    access_token = await _get_access_token()
    account_id = settings.docusign_account_id

    envelope_definition = {
        "emailSubject": f"Please sign: {document_name}",
        "documents": [
            {
                "documentBase64": lease_document_b64,
                "name": document_name,
                "fileExtension": "pdf",
                "documentId": "1",
            }
        ],
        "recipients": {
            "signers": [
                {
                    "email": landlord_email,
                    "name": landlord_name,
                    "recipientId": "1",
                    "routingOrder": "1",
                    "tabs": {
                        "signHereTabs": [
                            {
                                "anchorString": "/landlord_sign/",
                                "anchorUnits": "pixels",
                            }
                        ]
                    },
                },
                {
                    "email": tenant_email,
                    "name": tenant_name,
                    "recipientId": "2",
                    "routingOrder": "2",
                    "tabs": {
                        "signHereTabs": [
                            {
                                "anchorString": "/tenant_sign/",
                                "anchorUnits": "pixels",
                            }
                        ]
                    },
                },
            ]
        },
        "status": "created",
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{DOCUSIGN_BASE}/accounts/{account_id}/envelopes",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            json=envelope_definition,
            timeout=30.0,
        )
        resp.raise_for_status()
        data = resp.json()

    envelope_id = data["envelopeId"]
    logger.info("docusign_envelope_created", envelope_id=envelope_id)
    return envelope_id


async def send_envelope(envelope_id: str) -> None:
    access_token = await _get_access_token()
    account_id = settings.docusign_account_id

    async with httpx.AsyncClient() as client:
        resp = await client.put(
            f"{DOCUSIGN_BASE}/accounts/{account_id}/envelopes/{envelope_id}",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            json={"status": "sent"},
            timeout=15.0,
        )
        resp.raise_for_status()

    logger.info("docusign_envelope_sent", envelope_id=envelope_id)


async def get_envelope_status(envelope_id: str) -> str:
    access_token = await _get_access_token()
    account_id = settings.docusign_account_id

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{DOCUSIGN_BASE}/accounts/{account_id}/envelopes/{envelope_id}",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=15.0,
        )
        resp.raise_for_status()
        return resp.json()["status"]
