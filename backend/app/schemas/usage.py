from pydantic import BaseModel


class UsageTodayResponse(BaseModel):
    date: str
    used: int
    limit: int
    is_pro: bool
    remaining: int
