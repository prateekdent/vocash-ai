from datetime import datetime, timezone
from decimal import Decimal

from bson import ObjectId
from fastapi.testclient import TestClient

from app.api import deps
from app.main import app


class FakeExpenseRepo:
    def __init__(self):
        self.items = []

    async def create(self, payload):
        doc = {**payload, "_id": ObjectId(), "created_at": datetime.now(timezone.utc)}
        self.items.append(doc)
        return doc

    async def list(self, user_id, from_date, to_date, category, page, page_size):
        filtered = [x for x in self.items if x["user_id"] == user_id]
        if category:
            filtered = [x for x in filtered if x["category"] == category]
        return filtered, len(filtered)

    async def update(self, expense_id, user_id, payload):
        for idx, item in enumerate(self.items):
            if str(item["_id"]) == expense_id and item["user_id"] == user_id and not item.get("is_deleted", False):
                self.items[idx] = {**item, **payload}
                return True
        return False

    async def soft_delete(self, expense_id, user_id):
        for idx, item in enumerate(self.items):
            if str(item["_id"]) == expense_id and item["user_id"] == user_id and not item.get("is_deleted", False):
                self.items[idx]["is_deleted"] = True
                return True
        return False


def test_expense_save_and_list():
    repo = FakeExpenseRepo()

    def override_expense_repo():
        return repo

    async def override_current_user():
        return {"_id": ObjectId("66a000000000000000000001"), "is_pro": False}

    app.dependency_overrides[deps.get_expense_repo] = override_expense_repo
    app.dependency_overrides[deps.get_current_user] = override_current_user

    client = TestClient(app)

    save_res = client.post(
        "/expense/save",
        json={
            "amount": 500,
            "currency": "INR",
            "category": "Transport",
            "item": "Petrol",
            "expense_date": "2026-04-23",
            "notes": "fuel",
            "source": "voice",
            "raw_transcript": "Aaj 500 ka petrol bhara",
        },
    )
    assert save_res.status_code == 201

    list_res = client.get("/expense/list")
    assert list_res.status_code == 200
    body = list_res.json()
    assert body["pagination"]["total"] == 1
    assert body["items"][0]["item"] == "Petrol"
    assert Decimal(str(body["items"][0]["amount"])) == Decimal("500")

    app.dependency_overrides = {}


def test_expense_update_and_delete_with_ownership():
    repo = FakeExpenseRepo()
    owner_id = ObjectId("66a000000000000000000001")
    other_id = ObjectId("66a000000000000000000002")
    seed_id = ObjectId("66a000000000000000000099")
    repo.items.append(
        {
            "_id": seed_id,
            "user_id": str(owner_id),
            "amount": 500,
            "currency": "INR",
            "category": "Transport",
            "item": "Petrol",
            "expense_date": "2026-04-23",
            "source": "voice",
            "is_deleted": False,
        }
    )

    def override_expense_repo():
        return repo

    async def owner_user():
        return {"_id": owner_id, "is_pro": False}

    async def other_user():
        return {"_id": other_id, "is_pro": False}

    app.dependency_overrides[deps.get_expense_repo] = override_expense_repo
    app.dependency_overrides[deps.get_current_user] = owner_user
    client = TestClient(app)

    update_res = client.put(
        f"/expense/{seed_id}",
        json={
            "amount": 650,
            "currency": "INR",
            "category": "Transport",
            "item": "Diesel",
            "expense_date": "2026-04-23",
            "notes": "updated",
            "source": "voice",
            "raw_transcript": "diesel update",
        },
    )
    assert update_res.status_code == 200
    assert repo.items[0]["item"] == "Diesel"

    app.dependency_overrides[deps.get_current_user] = other_user
    forbidden_update = client.put(
        f"/expense/{seed_id}",
        json={
            "amount": 700,
            "currency": "INR",
            "category": "Transport",
            "item": "ShouldFail",
            "expense_date": "2026-04-23",
            "notes": None,
            "source": "voice",
            "raw_transcript": None,
        },
    )
    assert forbidden_update.status_code == 404

    app.dependency_overrides[deps.get_current_user] = owner_user
    delete_res = client.delete(f"/expense/{seed_id}")
    assert delete_res.status_code == 200
    assert repo.items[0]["is_deleted"] is True

    delete_again = client.delete(f"/expense/{seed_id}")
    assert delete_again.status_code == 404

    app.dependency_overrides = {}
