from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorDatabase


class UsageRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["usage"]

    async def get_count(self, user_id: str, day: str) -> int:
        doc = await self.collection.find_one({"user_id": user_id, "date": day})
        return int(doc["extraction_count"]) if doc else 0

    async def increment(self, user_id: str, day: str) -> int:
        now = datetime.now(timezone.utc)
        await self.collection.update_one(
            {"user_id": user_id, "date": day},
            {
                "$inc": {"extraction_count": 1},
                "$set": {"updated_at": now},
                "$setOnInsert": {"created_at": now, "user_id": user_id, "date": day},
            },
            upsert=True,
        )
        return await self.get_count(user_id=user_id, day=day)
