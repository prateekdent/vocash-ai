from datetime import datetime
from decimal import Decimal

from bson import ObjectId
from fastapi.testclient import TestClient

from app.api import deps
from app.core.config import Settings, get_settings
from app.main import app
from app.schemas.expense import ExtractResponse


class FakeUsageRepo:
    def __init__(self, initial=0):
        self.count = initial

    async def get_count(self, user_id: str, day: str) -> int:
        return self.count

    async def increment(self, user_id: str, day: str) -> int:
        self.count += 1
        return self.count


class FakeExtractionService:
    async def extract(self, transcript: str) -> ExtractResponse:
        return ExtractResponse(
            amount=Decimal("500"),
            currency="INR",
            category="Transport",
            item="Petrol",
            expense_date="2026-04-23",
            notes=None,
            raw_transcript=transcript,
        )


def _override_current_user(is_pro: bool = False):
    async def _user():
        return {
            "_id": ObjectId(),
            "email": "u@example.com",
            "is_pro": is_pro,
            "created_at": datetime.utcnow(),
        }

    return _user


def test_extract_within_limit_returns_200():
    usage_repo = FakeUsageRepo(initial=1)

    def override_usage_repo():
        return usage_repo

    def override_extraction_service():
        return FakeExtractionService()

    def override_settings():
        return Settings(
            mongodb_url="mongodb://localhost:27017",
            jwt_secret="x" * 32,
            free_daily_extraction_limit=3,
            default_timezone="Asia/Kolkata",
        )

    app.dependency_overrides[deps.get_current_user] = _override_current_user(False)
    app.dependency_overrides[get_settings] = override_settings
    app.dependency_overrides[deps.get_usage_repo] = override_usage_repo
    app.dependency_overrides[deps.get_extraction_service] = override_extraction_service

    client = TestClient(app)
    res = client.post("/expense/extract", json={"transcript": "Aaj 500 ka petrol bhara"})
    assert res.status_code == 200
    assert res.json()["category"] == "Transport"
    assert usage_repo.count == 2

    app.dependency_overrides = {}


def test_extract_limit_reached_returns_429():
    usage_repo = FakeUsageRepo(initial=3)

    def override_usage_repo():
        return usage_repo

    def override_extraction_service():
        return FakeExtractionService()

    def override_settings():
        return Settings(
            mongodb_url="mongodb://localhost:27017",
            jwt_secret="x" * 32,
            free_daily_extraction_limit=3,
            default_timezone="Asia/Kolkata",
        )

    app.dependency_overrides[deps.get_current_user] = _override_current_user(False)
    app.dependency_overrides[get_settings] = override_settings
    app.dependency_overrides[deps.get_usage_repo] = override_usage_repo
    app.dependency_overrides[deps.get_extraction_service] = override_extraction_service

    client = TestClient(app)
    res = client.post("/expense/extract", json={"transcript": "Aaj 500 ka petrol bhara"})
    assert res.status_code == 429
    assert res.json()["detail"] == "LIMIT_REACHED"
    assert usage_repo.count == 3

    app.dependency_overrides = {}
