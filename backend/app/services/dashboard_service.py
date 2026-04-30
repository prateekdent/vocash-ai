from app.schemas.dashboard import DashboardSummaryResponse


class DashboardService:
    async def summary(self, dashboard_repo, user_id: str, month: str) -> DashboardSummaryResponse:
        data = await dashboard_repo.summary(user_id=user_id, month=month)
        return DashboardSummaryResponse(**data)
