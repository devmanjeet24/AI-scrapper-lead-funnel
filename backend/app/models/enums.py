import enum


class ScrapeSourceType(str, enum.Enum):
    web = "web"
    social = "social"
    competitor = "competitor"
    review = "review"
    other = "other"


class ScrapeJobStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    paused = "paused"
    archived = "archived"


class ScrapeResultStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    success = "success"
    failed = "failed"
    cancelled = "cancelled"


class SignalType(str, enum.Enum):
    lead = "lead"
    competitor_intel = "competitor_intel"
    review = "review"
    mention = "mention"
    hiring = "hiring"
    pricing_change = "pricing_change"
    news = "news"
    other = "other"


class SignalStatus(str, enum.Enum):
    new = "new"
    reviewed = "reviewed"
    qualified = "qualified"
    dismissed = "dismissed"
    converted = "converted"
    duplicate = "duplicate"


class SignalPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
