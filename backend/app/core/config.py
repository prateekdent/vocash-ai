from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    env: str = "development"
    app_name: str = "Vocash"
    log_level: str = "info"

    backend_host: str = "0.0.0.0"
    backend_port: int = 5000

    mongodb_url: str
    mongodb_db_name: str = "vocash"

    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 10080

    openai_api_key: str = "test-key"
    openai_model: str = "gpt-4o-mini"
    razorpay_key_secret: str = "test_razorpay_secret"
    pro_plan_validity_days: int = 30

    free_daily_extraction_limit: int = 3
    default_timezone: str = "Asia/Kolkata"

    @field_validator("jwt_secret")
    @classmethod
    def validate_jwt_secret(cls, value: str) -> str:
        if len(value) < 32:
            raise ValueError("JWT_SECRET must be at least 32 characters")
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
