from datetime import datetime, timezone
from typing import Any, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class UserRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["users"]

    async def find_by_email(self, email: str) -> Optional[dict[str, Any]]:
        return await self.collection.find_one({"email": email.lower()})

    async def find_by_id(self, user_id: str) -> Optional[dict[str, Any]]:
        return await self.collection.find_one({"_id": ObjectId(user_id)})

    async def create(self, email: str, password_hash: str) -> dict[str, Any]:
        now = datetime.now(timezone.utc)
        doc = {
            "email": email.lower(),
            "password_hash": password_hash,
            "auth_provider": "email",
            "is_pro": False,
            "pro_valid_until": None,
            "created_at": now,
            "updated_at": now,
        }
        result = await self.collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc

    async def activate_pro(self, user_id: str, valid_until: datetime) -> None:
        now = datetime.now(timezone.utc)
        await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "is_pro": True,
                    "pro_valid_until": valid_until,
                    "updated_at": now,
                }
            },
        )
