from datetime import datetime, timezone
from typing import Any, List, Optional, Tuple

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class ExpenseRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["expenses"]

    async def create(self, payload: dict[str, Any]) -> dict[str, Any]:
        now = datetime.now(timezone.utc)
        doc = {**payload, "created_at": now, "updated_at": now, "is_deleted": False}
        result = await self.collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc

    async def list(
        self,
        user_id: str,
        from_date: Optional[str],
        to_date: Optional[str],
        category: Optional[str],
        page: int,
        page_size: int,
    ) -> Tuple[List[dict[str, Any]], int]:
        query: dict[str, Any] = {"user_id": user_id, "is_deleted": False}
        if category:
            query["category"] = category
        if from_date or to_date:
            date_range: dict[str, str] = {}
            if from_date:
                date_range["$gte"] = from_date
            if to_date:
                date_range["$lte"] = to_date
            query["expense_date"] = date_range

        total = await self.collection.count_documents(query)
        cursor = (
            self.collection.find(query)
            .sort("expense_date", -1)
            .skip((page - 1) * page_size)
            .limit(page_size)
        )
        items = await cursor.to_list(length=page_size)
        return items, total

    async def update(self, expense_id: str, user_id: str, payload: dict[str, Any]) -> bool:
        now = datetime.now(timezone.utc)
        result = await self.collection.update_one(
            {"_id": ObjectId(expense_id), "user_id": user_id, "is_deleted": False},
            {"$set": {**payload, "updated_at": now}},
        )
        return result.modified_count == 1

    async def soft_delete(self, expense_id: str, user_id: str) -> bool:
        now = datetime.now(timezone.utc)
        result = await self.collection.update_one(
            {"_id": ObjectId(expense_id), "user_id": user_id, "is_deleted": False},
            {"$set": {"is_deleted": True, "updated_at": now}},
        )
        return result.modified_count == 1


def object_id_str(value: ObjectId) -> str:
    return str(value)
