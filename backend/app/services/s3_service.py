import uuid

import boto3
import structlog

from app.config import settings

logger = structlog.get_logger()

_s3 = boto3.client("s3", region_name=settings.aws_region)
CLOUDFRONT_BASE = f"https://{settings.cloudfront_domain}"


def photo_url(s3_key: str) -> str:
    return f"{CLOUDFRONT_BASE}/{s3_key}"


def sensitive_url(s3_key: str) -> str:
    return _s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.aws_s3_bucket, "Key": s3_key},
        ExpiresIn=3600,
    )


def generate_upload_url(property_id: uuid.UUID, extension: str = "jpg") -> tuple[str, str]:
    s3_key = f"properties/{property_id}/photos/{uuid.uuid4()}.{extension}"
    url = _s3.generate_presigned_url(
        "put_object",
        Params={"Bucket": settings.aws_s3_bucket, "Key": s3_key},
        ExpiresIn=900,
    )
    logger.info("presigned_upload_generated", property_id=str(property_id), s3_key=s3_key)
    return url, s3_key


def photo_urls(s3_keys: list[str] | None) -> list[str]:
    if not s3_keys:
        return []
    return [photo_url(key) for key in s3_keys]
