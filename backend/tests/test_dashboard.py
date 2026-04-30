from decimal import Decimal

from bson import ObjectId
from fastapi.testclient import TestClient

from app.api import deps
from app.main import app


class FakeDashboardRepo:
    async def summary(self, user_id: str, month: str):
        assert month == "2026-04"
        return {
            "month": month,
            "total_spend": Decimal("12500"),
            "currency": "INR",
            "category_breakdown": [
                {"category": "Food & Dining", "amount": Decimal("4200"), "percent": 33.6},
                {"category": "Transport", "amount": Decimal("3000"), "percent": 24.0},
            ],
            "recent": [
                {"id": "e1", "item": "Petrol", "amount": Decimal("500"), "expense_date": "2026-04-23"}
            ],
        }


def test_dashboard_summary_endpoint():
    repo = FakeDashboardRepo()

    def override_dashboard_repo():
        return repo

    async def override_current_user():
        return {"_id": ObjectId("66a000000000000000000001"), "is_pro": False}

    app.dependency_overrides[deps.get_dashboard_repo] = override_dashboard_repo
    app.dependency_overrides[deps.get_current_user] = override_current_user

    client = TestClient(app)
    res = client.get("/dashboard/summary?month=2026-04")

    assert res.status_code == 200
    body = res.json()
    assert body["month"] == "2026-04"
    assert body["total_spend"] == "12500"
    assert len(body["category_breakdown"]) == 2
    assert len(body["recent"]) == 1

    app.dependency_overrides = {}
