from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import get_budget_repo, get_budget_service, get_current_user
from app.schemas.budget import BudgetSetRequest, BudgetSetResponse, BudgetStatusResponse

router = APIRouter(prefix="/budget", tags=["budget"])


@router.post("/set", response_model=BudgetSetResponse)
async def set_budget(
    payload: BudgetSetRequest,
    current_user: dict = Depends(get_current_user),
    budget_repo=Depends(get_budget_repo),
    budget_service=Depends(get_budget_service),
) -> BudgetSetResponse:
    try:
        budget_service.ensure_pro(current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail="PRO_REQUIRED") from exc
    return await budget_service.set_budget(
        budget_repo=budget_repo,
        user_id=str(current_user["_id"]),
        month=payload.month,
        category=payload.category,
        limit_amount=payload.limit_amount,
    )


@router.get("/status", response_model=BudgetStatusResponse)
async def budget_status(
    month: str = Query(..., min_length=7, max_length=7),
    current_user: dict = Depends(get_current_user),
    budget_repo=Depends(get_budget_repo),
    budget_service=Depends(get_budget_service),
) -> BudgetStatusResponse:
    try:
        budget_service.ensure_pro(current_user)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail="PRO_REQUIRED") from exc
    return await budget_service.status(
        budget_repo=budget_repo,
        user_id=str(current_user["_id"]),
        month=month,
    )
