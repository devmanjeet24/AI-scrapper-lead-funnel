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


class LeadStatus(str, enum.Enum):
    new = "new"
    contacted = "contacted"
    won = "won"
    lost = "lost"
    archived = "archived"


class CreativeSetStatus(str, enum.Enum):
    pending = "pending"
    generating = "generating"
    completed = "completed"
    failed = "failed"


class CreativeAssetType(str, enum.Enum):
    headline = "headline"
    ad_copy = "ad_copy"
    campaign_idea = "campaign_idea"
    targeting_suggestion = "targeting_suggestion"


class CreativeAssetStatus(str, enum.Enum):
    draft = "draft"
    approved = "approved"
    rejected = "rejected"


class DeploymentPackageStatus(str, enum.Enum):
    ready = "ready"
    deployed = "deployed"
    failed = "failed"
