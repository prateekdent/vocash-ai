from datetime import datetime

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user, get_dashboard_repo, get_dashboard_service
from app.schemas.dashboard import DashboardSummaryResponse

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummaryResponse)
async def dashboard_summary(
    current_user: dict = Depends(get_current_user),
    dashboard_repo=Depends(get_dashboard_repo),
    dashboard_service=Depends(get_dashboard_service),
    month: str = Query(default_factory=lambda: datetime.utcnow().strftime("%Y-%m")),
) -> DashboardSummaryResponse:
    return await dashboard_service.summary(
        dashboard_repo=dashboard_repo,
        user_id=str(current_user["_id"]),
        month=month,
    )
