from app.repositories.expenses import object_id_str
from app.schemas.expense import (
    ExpenseDeleteResponse,
    ExpenseItem,
    ExpenseListResponse,
    ExpenseSaveRequest,
    ExpenseSaveResponse,
    ExpenseUpdateRequest,
    ExpenseUpdateResponse,
)
from typing import Optional


class ExpenseService:
    async def save(self, expense_repo, user_id: str, payload: ExpenseSaveRequest) -> ExpenseSaveResponse:
        data = payload.model_dump()
        if hasattr(data.get("amount"), "__float__"):
            data["amount"] = float(data["amount"])
        doc = await expense_repo.create({**data, "user_id": user_id})
        return ExpenseSaveResponse(id=object_id_str(doc["_id"]), user_id=user_id, created_at=doc["created_at"])

    async def list(
        self,
        expense_repo,
        user_id: str,
        from_date: Optional[str],
        to_date: Optional[str],
        category: Optional[str],
        page: int,
        page_size: int,
    ) -> ExpenseListResponse:
        items, total = await expense_repo.list(
            user_id=user_id,
            from_date=from_date,
            to_date=to_date,
            category=category,
            page=page,
            page_size=page_size,
        )
        return ExpenseListResponse(
            items=[
                ExpenseItem(
                    id=object_id_str(item["_id"]),
                    amount=item["amount"],
                    category=item["category"],
                    item=item["item"],
                    expense_date=item["expense_date"],
                    source=item["source"],
                )
                for item in items
            ],
            pagination={"page": page, "page_size": page_size, "total": total},
        )

    async def update(
        self,
        expense_repo,
        expense_id: str,
        user_id: str,
        payload: ExpenseUpdateRequest,
    ) -> ExpenseUpdateResponse:
        data = payload.model_dump()
        if hasattr(data.get("amount"), "__float__"):
            data["amount"] = float(data["amount"])
        updated = await expense_repo.update(expense_id=expense_id, user_id=user_id, payload=data)
        if not updated:
            raise ValueError("EXPENSE_NOT_FOUND")
        return ExpenseUpdateResponse(id=expense_id, updated=True)

    async def delete(self, expense_repo, expense_id: str, user_id: str) -> ExpenseDeleteResponse:
        deleted = await expense_repo.soft_delete(expense_id=expense_id, user_id=user_id)
        if not deleted:
            raise ValueError("EXPENSE_NOT_FOUND")
        return ExpenseDeleteResponse(id=expense_id, deleted=True)
