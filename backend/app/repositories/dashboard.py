from decimal import Decimal
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class DashboardRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["expenses"]

    async def summary(self, user_id: str, month: str) -> dict[str, Any]:
        month_start = f"{month}-01"
        next_month = self._next_month(month)
        query = {
            "user_id": user_id,
            "is_deleted": False,
            "expense_date": {"$gte": month_start, "$lt": f"{next_month}-01"},
        }

        docs = await self.collection.find(query).to_list(length=None)
        total = sum(Decimal(str(doc.get("amount", 0))) for doc in docs)

        by_category: dict[str, Decimal] = {}
        for doc in docs:
            category = doc.get("category", "Other")
            by_category[category] = by_category.get(category, Decimal("0")) + Decimal(str(doc.get("amount", 0)))

        category_breakdown = []
        for category, amount in sorted(by_category.items(), key=lambda x: x[1], reverse=True):
            percent = float((amount / total * Decimal("100")) if total > 0 else Decimal("0"))
            category_breakdown.append(
                {"category": category, "amount": amount, "percent": round(percent, 2)}
            )

        recent_sorted = sorted(docs, key=lambda x: x.get("expense_date", ""), reverse=True)[:5]
        recent = [
            {
                "id": self._object_id_str(doc["_id"]),
                "item": doc.get("item", ""),
                "amount": Decimal(str(doc.get("amount", 0))),
                "expense_date": doc.get("expense_date", ""),
            }
            for doc in recent_sorted
        ]

        return {
            "month": month,
            "total_spend": total,
            "currency": "INR",
            "category_breakdown": category_breakdown,
            "recent": recent,
        }

    @staticmethod
    def _next_month(month: str) -> str:
        year, mon = month.split("-")
        y = int(year)
        m = int(mon)
        if m == 12:
            return f"{y + 1}-01"
        return f"{y}-{m + 1:02d}"

    @staticmethod
    def _object_id_str(value: ObjectId) -> str:
        return str(value)
