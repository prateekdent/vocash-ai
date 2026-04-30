from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, Field


class ExtractRequest(BaseModel):
    transcript: str = Field(min_length=2, max_length=500)


class ExtractResponse(BaseModel):
    amount: Decimal = Field(gt=0)
    currency: str = "INR"
    category: str = Field(min_length=1, max_length=100)
    item: str = Field(min_length=1, max_length=120)
    expense_date: str = Field(min_length=10, max_length=10)
    notes: Optional[str] = None
    raw_transcript: str


class ExpenseSaveRequest(BaseModel):
    amount: Decimal = Field(gt=0)
    currency: str = "INR"
    category: str = Field(min_length=1, max_length=100)
    item: str = Field(min_length=1, max_length=120)
    expense_date: str = Field(min_length=10, max_length=10)
    notes: Optional[str] = None
    source: Literal["voice", "manual"]
    raw_transcript: Optional[str] = None


class ExpenseSaveResponse(BaseModel):
    id: str
    user_id: str
    created_at: datetime


class ExpenseItem(BaseModel):
    id: str
    amount: Decimal
    category: str
    item: str
    expense_date: str
    source: Literal["voice", "manual"]


class ExpenseListResponse(BaseModel):
    items: list[ExpenseItem]
    pagination: dict


class ExpenseUpdateRequest(BaseModel):
    amount: Decimal = Field(gt=0)
    currency: str = "INR"
    category: str = Field(min_length=1, max_length=100)
    item: str = Field(min_length=1, max_length=120)
    expense_date: str = Field(min_length=10, max_length=10)
    notes: Optional[str] = None
    source: Literal["voice", "manual"]
    raw_transcript: Optional[str] = None


class ExpenseUpdateResponse(BaseModel):
    id: str
    updated: bool


class ExpenseDeleteResponse(BaseModel):
    id: str
    deleted: bool
