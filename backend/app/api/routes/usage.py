from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, get_usage_repo, get_usage_service
from app.schemas.usage import UsageTodayResponse

router = APIRouter(prefix="/usage", tags=["usage"])


@router.get("/today", response_model=UsageTodayResponse)
async def usage_today(
    current_user: dict = Depends(get_current_user),
    usage_repo=Depends(get_usage_repo),
    usage_service=Depends(get_usage_service),
) -> UsageTodayResponse:
    status = await usage_service.get_today(
        usage_repo=usage_repo,
        user_id=str(current_user["_id"]),
        is_pro=bool(current_user.get("is_pro", False)),
    )
    return UsageTodayResponse(
        date=status.date,
        used=status.used,
        limit=status.limit,
        is_pro=status.is_pro,
        remaining=status.remaining,
    )
