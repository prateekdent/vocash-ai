from app.schemas.budget import BudgetSetResponse, BudgetStatusResponse


class BudgetService:
    @staticmethod
    def ensure_pro(user: dict) -> None:
        if not bool(user.get("is_pro", False)):
            raise PermissionError("PRO_REQUIRED")

    async def set_budget(self, budget_repo, user_id: str, month: str, category: str, limit_amount: float) -> BudgetSetResponse:
        await budget_repo.set_budget(
            user_id=user_id,
            month=month,
            category=category,
            limit_amount=limit_amount,
        )
        return BudgetSetResponse(saved=True)

    async def status(self, budget_repo, user_id: str, month: str) -> BudgetStatusResponse:
        items = await budget_repo.get_status(user_id=user_id, month=month)
        return BudgetStatusResponse(month=month, items=items)
