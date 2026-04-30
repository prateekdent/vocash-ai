from datetime import datetime

from bson import ObjectId
from fastapi.testclient import TestClient

from app.api import deps
from app.core.config import Settings, get_settings
from app.main import app
from app.services.usage_service import UsageService


class FakeUsageRepo:
    def __init__(self, initial=0):
        self.count = initial

    async def get_count(self, user_id: str, day: str) -> int:
        return self.count

    async def increment(self, user_id: str, day: str) -> int:
        self.count += 1
        return self.count


class FakeUserRepo:
    def __init__(self):
        oid = ObjectId()
        self.user = {"_id": oid, "email": "u@example.com", "is_pro": False, "created_at": datetime.utcnow()}

    async def find_by_id(self, user_id: str):
        return self.user if str(self.user["_id"]) == user_id else None


def _settings() -> Settings:
    return Settings(
        mongodb_url="mongodb://localhost:27017",
        jwt_secret="x" * 32,
        free_daily_extraction_limit=3,
        default_timezone="Asia/Kolkata",
    )


def test_usage_service_limit_enforced():
    service = UsageService(_settings())
    repo = FakeUsageRepo(initial=3)

    import asyncio

    async def _run():
        try:
            await service.enforce_limit_then_increment(repo, "u1", is_pro=False)
            assert False
        except ValueError as exc:
            assert str(exc) == "LIMIT_REACHED"

    asyncio.run(_run())


def test_usage_today_endpoint():
    fake_user_repo = FakeUserRepo()
    fake_usage_repo = FakeUsageRepo(initial=2)

    def override_settings():
        return _settings()

    def override_user_repo():
        return fake_user_repo

    def override_usage_repo():
        return fake_usage_repo

    async def override_current_user():
        return fake_user_repo.user

    app.dependency_overrides[get_settings] = override_settings
    app.dependency_overrides[deps.get_user_repo] = override_user_repo
    app.dependency_overrides[deps.get_usage_repo] = override_usage_repo
    app.dependency_overrides[deps.get_current_user] = override_current_user

    client = TestClient(app)
    res = client.get("/usage/today")
    assert res.status_code == 200
    body = res.json()
    assert body["used"] == 2
    assert body["limit"] == 3
    assert body["remaining"] == 1

    app.dependency_overrides = {}
