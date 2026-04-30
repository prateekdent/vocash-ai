from datetime import datetime
from zoneinfo import ZoneInfo


def local_today_str(timezone_name: str) -> str:
    return datetime.now(ZoneInfo(timezone_name)).date().isoformat()
