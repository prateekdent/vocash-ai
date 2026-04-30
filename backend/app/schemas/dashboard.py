from decimal import Decimal

from pydantic import BaseModel


class CategoryBreakdownItem(BaseModel):
    category: str
    amount: Decimal
    percent: float


class RecentExpenseItem(BaseModel):
    id: str
    item: str
    amount: Decimal
    expense_date: str


class DashboardSummaryResponse(BaseModel):
    month: str
    total_spend: Decimal
    currency: str = "INR"
    category_breakdown: list[CategoryBreakdownItem]
    recent: list[RecentExpenseItem]
