from datetime import datetime, timezone

from bson import ObjectId
from fastapi.testclient import TestClient

from app.api import deps
from app.core.config import Settings, get_settings
from app.main import app


class FakeUserRepo:
    def __init__(self):
        self.users_by_email = {}
        self.users_by_id = {}

    async def find_by_email(self, email: str):
        return self.users_by_email.get(email.lower())

    async def find_by_id(self, user_id: str):
        return self.users_by_id.get(user_id)

    async def create(self, email: str, password_hash: str):
        oid = ObjectId()
        user = {
            "_id": oid,
            "email": email.lower(),
            "password_hash": password_hash,
            "is_pro": False,
            "created_at": datetime.now(timezone.utc),
        }
        self.users_by_email[email.lower()] = user
        self.users_by_id[str(oid)] = user
        return user


def _override_settings():
    return Settings(
        mongodb_url="mongodb://localhost:27017",
        jwt_secret="x" * 32,
        jwt_algorithm="HS256",
        jwt_access_token_expire_minutes=10080,
    )


def build_client():
    repo = FakeUserRepo()

    def _get_repo():
        return repo

    app.dependency_overrides[deps.get_user_repo] = _get_repo
    app.dependency_overrides[get_settings] = _override_settings
    return TestClient(app), repo


def test_register_login_and_me():
    client, _repo = build_client()

    reg = client.post("/auth/register", json={"email": "user@example.com", "password": "StrongPass123"})
    assert reg.status_code == 201
    token = reg.json()["access_token"]

    login = client.post("/auth/login", json={"email": "user@example.com", "password": "StrongPass123"})
    assert login.status_code == 200

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "user@example.com"

    app.dependency_overrides = {}


def test_login_invalid_password():
    client, _repo = build_client()
    client.post("/auth/register", json={"email": "user2@example.com", "password": "StrongPass123"})

    bad = client.post("/auth/login", json={"email": "user2@example.com", "password": "wrongpass"})
    assert bad.status_code == 401

    app.dependency_overrides = {}
