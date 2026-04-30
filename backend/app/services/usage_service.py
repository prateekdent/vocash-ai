from dataclasses import dataclass

from app.core.config import Settings
from app.core.datetime_utils import local_today_str


@dataclass
class UsageStatus:
    date: str
    used: int
    limit: int
    is_pro: bool

    @property
    def remaining(self) -> int:
        if self.is_pro:
            return 999999
        return max(0, self.limit - self.used)


class UsageService:
    def __init__(self, settings: Settings):
        self.settings = settings

    async def get_today(self, usage_repo, user_id: str, is_pro: bool) -> UsageStatus:
        day = local_today_str(self.settings.default_timezone)
        used = await usage_repo.get_count(user_id=user_id, day=day)
        return UsageStatus(day, used, self.settings.free_daily_extraction_limit, is_pro)

    async def enforce_limit_then_increment(self, usage_repo, user_id: str, is_pro: bool) -> UsageStatus:
        status = await self.get_today(usage_repo=usage_repo, user_id=user_id, is_pro=is_pro)
        if not is_pro and status.used >= status.limit:
            raise ValueError("LIMIT_REACHED")
        if not is_pro:
            status.used = await usage_repo.increment(user_id=user_id, day=status.date)
        return status
