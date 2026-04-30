from pydantic import BaseModel, Field


class BudgetSetRequest(BaseModel):
    month: str = Field(min_length=7, max_length=7)
    category: str = Field(min_length=1, max_length=100)
    limit_amount: float = Field(gt=0)


class BudgetSetResponse(BaseModel):
    saved: bool


class BudgetStatusItem(BaseModel):
    category: str
    limit_amount: float
    spent_amount: float
    remaining: float


class BudgetStatusResponse(BaseModel):
    month: str
    items: list[BudgetStatusItem]
