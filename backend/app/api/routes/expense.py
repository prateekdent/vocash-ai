from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from app.api.deps import (
    get_current_user,
    get_expense_repo,
    get_expense_service,
    get_extraction_service,
    get_usage_repo,
    get_usage_service,
)
from app.schemas.expense import (
    ExpenseListResponse,
    ExpenseSaveRequest,
    ExpenseSaveResponse,
    ExpenseDeleteResponse,
    ExpenseUpdateRequest,
    ExpenseUpdateResponse,
    ExtractRequest,
    ExtractResponse,
)

router = APIRouter(prefix="/expense", tags=["expense"])


@router.post("/extract", response_model=ExtractResponse)
async def extract_expense(
    payload: ExtractRequest,
    current_user: dict = Depends(get_current_user),
    usage_repo=Depends(get_usage_repo),
    usage_service=Depends(get_usage_service),
    extraction_service=Depends(get_extraction_service),
) -> ExtractResponse:
    try:
        await usage_service.enforce_limit_then_increment(
            usage_repo=usage_repo,
            user_id=str(current_user["_id"]),
            is_pro=bool(current_user.get("is_pro", False)),
        )
    except ValueError as exc:
        if str(exc) == "LIMIT_REACHED":
            raise HTTPException(status_code=429, detail="LIMIT_REACHED") from exc
        raise
    return await extraction_service.extract(payload.transcript)


@router.post("/save", response_model=ExpenseSaveResponse, status_code=201)
async def save_expense(
    payload: ExpenseSaveRequest,
    current_user: dict = Depends(get_current_user),
    expense_repo=Depends(get_expense_repo),
    expense_service=Depends(get_expense_service),
) -> ExpenseSaveResponse:
    return await expense_service.save(expense_repo=expense_repo, user_id=str(current_user["_id"]), payload=payload)


@router.get("/list", response_model=ExpenseListResponse)
async def list_expenses(
    current_user: dict = Depends(get_current_user),
    expense_repo=Depends(get_expense_repo),
    expense_service=Depends(get_expense_service),
    from_date: Optional[str] = Query(default=None),
    to_date: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> ExpenseListResponse:
    return await expense_service.list(
        expense_repo=expense_repo,
        user_id=str(current_user["_id"]),
        from_date=from_date,
        to_date=to_date,
        category=category,
        page=page,
        page_size=page_size,
    )


@router.put("/{expense_id}", response_model=ExpenseUpdateResponse)
async def update_expense(
    expense_id: str,
    payload: ExpenseUpdateRequest,
    current_user: dict = Depends(get_current_user),
    expense_repo=Depends(get_expense_repo),
    expense_service=Depends(get_expense_service),
) -> ExpenseUpdateResponse:
    try:
        return await expense_service.update(
            expense_repo=expense_repo,
            expense_id=expense_id,
            user_id=str(current_user["_id"]),
            payload=payload,
        )
    except ValueError as exc:
        if str(exc) == "EXPENSE_NOT_FOUND":
            raise HTTPException(status_code=404, detail="Expense not found") from exc
        raise


@router.delete("/{expense_id}", response_model=ExpenseDeleteResponse)
async def delete_expense(
    expense_id: str,
    current_user: dict = Depends(get_current_user),
    expense_repo=Depends(get_expense_repo),
    expense_service=Depends(get_expense_service),
) -> ExpenseDeleteResponse:
    try:
        return await expense_service.delete(
            expense_repo=expense_repo,
            expense_id=expense_id,
            user_id=str(current_user["_id"]),
        )
    except ValueError as exc:
        if str(exc) == "EXPENSE_NOT_FOUND":
            raise HTTPException(status_code=404, detail="Expense not found") from exc
        raise
