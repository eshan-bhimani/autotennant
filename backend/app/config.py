from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Database — Supabase PostgreSQL (port 6543 = Supavisor/PgBouncer)
    database_url: str
    test_database_url: str = ""

    # Redis — ElastiCache (ARQ broker + cache)
    redis_url: str = "redis://localhost:6379"

    # JWT — RS256 key pair
    jwt_private_key: str
    jwt_public_key: str
    jwt_algorithm: str = "RS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # Google OAuth
    google_client_id: str
    google_client_secret: str = ""

    # Anthropic
    anthropic_api_key: str

    # AWS
    aws_s3_bucket: str = "autotennant-uploads"
    aws_region: str = "us-east-1"
    cloudfront_domain: str = ""

    # SES
    aws_ses_from_email: str = "noreply@autotennant.com"

    # Twilio
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""

    # SmartMove (TransUnion)
    smartmove_api_key: str = ""
    smartmove_webhook_secret: str = ""

    # DocuSign
    docusign_integration_key: str = ""
    docusign_account_id: str = ""
    docusign_webhook_secret: str = ""

    # Stripe (Connect platform + subscription billing)
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_publishable_key: str = ""
    stripe_platform_fee_bps: int = 150  # 1.5% platform fee on rent
    stripe_connect_return_url: str = "http://localhost:3000/landlord/payments?onboarded=1"
    stripe_connect_refresh_url: str = "http://localhost:3000/landlord/payments?refresh=1"

    # Sentry
    sentry_dsn: str = ""

    # App
    app_name: str = "AutoTennant"
    debug: bool = False


settings = Settings()  # type: ignore[call-arg]
