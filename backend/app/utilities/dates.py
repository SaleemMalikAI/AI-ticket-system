from datetime import UTC, datetime, timedelta

from app.constants.assistant import DateRange

_DAYS = {DateRange.LAST_7_DAYS: 7, DateRange.LAST_30_DAYS: 30}


def date_range_start(date_range: DateRange | None, now: datetime | None = None) -> datetime | None:
    """Earliest created_at for a date range (UTC); None means no date filter."""
    if date_range is None:
        return None
    now = now or datetime.now(UTC)
    if date_range is DateRange.TODAY:
        return now.replace(hour=0, minute=0, second=0, microsecond=0)
    return now - timedelta(days=_DAYS[date_range])
