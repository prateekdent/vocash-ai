from datetime import datetime, timezone
import hashlib
import hmac

from bson import ObjectId
from fastapi.testclient import TestClient

from app.api import deps
from app.core.config import Settings, get_settings
from app.main import app


class FakeUserRepo:
    def __init__(self):
        self.activated = None

    async def activate_pro(self, user_id: str, valid_until: datetime):
        self.activated = {"user_id": user_id, "valid_until": valid_until}


def _signature(secret: str, order_id: str, payment_id: str) -> str:
    return hmac.new(
        secret.encode("utf-8"),
        f"{order_id}|{payment_id}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def _current_user():
    async def _override():
        return {
            "_id": ObjectId("66a000000000000000000001"),
            "email": "u@example.com",
            "is_pro": False,
            "created_at": datetime.now(timezone.utc),
        }

    return _override


def test_valid_signature_activates_pro():
    secret = "rzp_test_secret"
    order_id = "order_123"
    payment_id = "pay_123"
    signature = _signature(secret, order_id, payment_id)
    repo = FakeUserRepo()

    def override_user_repo():
        return repo

    def override_settings():
        return Settings(
            mongodb_url="mongodb://localhost:27017",
            jwt_secret="x" * 32,
            razorpay_key_secret=secret,
            pro_plan_validity_days=30,
        )

    app.dependency_overrides[deps.get_current_user] = _current_user()
    app.dependency_overrides[deps.get_user_repo] = override_user_repo
    app.dependency_overrides[get_settings] = override_settings

    client = TestClient(app)
    res = client.post(
        "/payment/verify",
        json={
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        },
    )

    assert res.status_code == 200
    body = res.json()
    assert body["verified"] is True
    assert body["plan"] == "pro"
    assert repo.activated is not None

    app.dependency_overrides = {}


def test_invalid_signature_rejected():
    repo = FakeUserRepo()

    def override_user_repo():
        return repo

    def override_settings():
        return Settings(
            mongodb_url="mongodb://localhost:27017",
            jwt_secret="x" * 32,
            razorpay_key_secret="rzp_test_secret",
            pro_plan_validity_days=30,
        )

    app.dependency_overrides[deps.get_current_user] = _current_user()
    app.dependency_overrides[deps.get_user_repo] = override_user_repo
    app.dependency_overrides[get_settings] = override_settings

    client = TestClient(app)
    res = client.post(
        "/payment/verify",
        json={
            "razorpay_order_id": "order_123",
            "razorpay_payment_id": "pay_123",
            "razorpay_signature": "invalid_signature",
        },
    )

    assert res.status_code == 400
    assert res.json()["detail"] == "INVALID_SIGNATURE"
    assert repo.activated is None

    app.dependency_overrides = {}
