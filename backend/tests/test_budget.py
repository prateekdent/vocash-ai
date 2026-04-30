from datetime import datetime

from bson import ObjectId
from fastapi.testclient import TestClient

from app.api import deps
from app.main import app


class FakeBudgetRepo:
    def __init__(self):
        self.budgets = {}
        self.spent = {}

    async def set_budget(self, user_id: str, month: str, category: str, limit_amount: float):
        self.budgets[(user_id, month, category)] = float(limit_amount)

    async def get_status(self, user_id: str, month: str):
        items = []
        for (uid, m, category), limit_amount in self.budgets.items():
            if uid == user_id and m == month:
                spent_amount = float(self.spent.get((uid, m, category), 0.0))
                items.append(
                    {
                        "category": category,
                        "limit_amount": limit_amount,
                        "spent_amount": spent_amount,
                        "remaining": limit_amount - spent_amount,
                    }
                )
        return items


def _user(is_pro: bool):
    async def _override():
        return {
            "_id": ObjectId("66a000000000000000000001"),
            "email": "u@example.com",
            "is_pro": is_pro,
            "created_at": datetime.utcnow(),
        }

    return _override


def test_non_pro_blocked_for_budget_endpoints():
    repo = FakeBudgetRepo()

    def override_repo():
        return repo

    app.dependency_overrides[deps.get_current_user] = _user(False)
    app.dependency_overrides[deps.get_budget_repo] = override_repo

    client = TestClient(app)

    set_res = client.post("/budget/set", json={"month": "2026-04", "category": "Food & Dining", "limit_amount": 6000})
    status_res = client.get("/budget/status?month=2026-04")

    assert set_res.status_code == 403
    assert status_res.status_code == 403
    assert set_res.json()["detail"] == "PRO_REQUIRED"
    assert status_res.json()["detail"] == "PRO_REQUIRED"

    app.dependency_overrides = {}


def test_pro_user_set_and_status_flow():
    repo = FakeBudgetRepo()
    repo.spent[("66a000000000000000000001", "2026-04", "Food & Dining")] = 4200.0

    def override_repo():
        return repo

    app.dependency_overrides[deps.get_current_user] = _user(True)
    app.dependency_overrides[deps.get_budget_repo] = override_repo

    client = TestClient(app)

    set_res = client.post("/budget/set", json={"month": "2026-04", "category": "Food & Dining", "limit_amount": 6000})
    assert set_res.status_code == 200
    assert set_res.json() == {"saved": True}

    status_res = client.get("/budget/status?month=2026-04")
    assert status_res.status_code == 200
    body = status_res.json()
    assert body["month"] == "2026-04"
    assert len(body["items"]) == 1
    assert body["items"][0]["category"] == "Food & Dining"
    assert body["items"][0]["limit_amount"] == 6000
    assert body["items"][0]["spent_amount"] == 4200
    assert body["items"][0]["remaining"] == 1800

    app.dependency_overrides = {}
