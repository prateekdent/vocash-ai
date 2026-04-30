from datetime import datetime, timezone
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase


class BudgetRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.budgets = db["budgets"]
        self.expenses = db["expenses"]

    async def set_budget(
        self,
        user_id: str,
        month: str,
        category: str,
        limit_amount: float,
    ) -> None:
        now = datetime.now(timezone.utc)
        await self.budgets.update_one(
            {"user_id": user_id, "month": month, "category": category},
            {
                "$set": {
                    "limit_amount": float(limit_amount),
                    "updated_at": now,
                },
                "$setOnInsert": {
                    "user_id": user_id,
                    "month": month,
                    "category": category,
                    "created_at": now,
                },
            },
            upsert=True,
        )

    async def get_status(self, user_id: str, month: str) -> list[dict[str, Any]]:
        budgets = await self.budgets.find({"user_id": user_id, "month": month}).to_list(length=None)
        if not budgets:
            return []

        month_start = f"{month}-01"
        next_month = self._next_month(month)
        query = {
            "user_id": user_id,
            "is_deleted": False,
            "expense_date": {"$gte": month_start, "$lt": f"{next_month}-01"},
        }
        expenses = await self.expenses.find(query).to_list(length=None)

        spent_by_category: dict[str, float] = {}
        for exp in expenses:
            cat = exp.get("category", "Other")
            spent_by_category[cat] = spent_by_category.get(cat, 0.0) + float(exp.get("amount", 0))

        items: list[dict[str, Any]] = []
        for budget in budgets:
            category = str(budget["category"])
            limit_amount = float(budget["limit_amount"])
            spent_amount = float(spent_by_category.get(category, 0.0))
            items.append(
                {
                    "category": category,
                    "limit_amount": limit_amount,
                    "spent_amount": spent_amount,
                    "remaining": limit_amount - spent_amount,
                }
            )
        return items

    @staticmethod
    def _next_month(month: str) -> str:
        year, mon = month.split("-")
        y = int(year)
        m = int(mon)
        if m == 12:
            return f"{y + 1}-01"
        return f"{y}-{m + 1:02d}"
