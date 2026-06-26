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


class DeploymentMode(str, enum.Enum):
    export = "export"
    facebook_ads = "facebook_ads"
    google_ads = "google_ads"
    linkedin_ads = "linkedin_ads"


class MonitoringRecommendation(str, enum.Enum):
    continue_ = "continue"
    optimize = "optimize"
    pause = "pause"
    scale = "scale"
    investigate = "investigate"


class MonitoringSnapshotSource(str, enum.Enum):
    manual = "manual"
    simulated = "simulated"
    api = "api"


class OutreachChannel(str, enum.Enum):
    internal = "internal"
    email = "email"
    sms = "sms"
    voice = "voice"


class OutreachCampaignStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    paused = "paused"
    completed = "completed"
    failed = "failed"


class OutreachConversationStatus(str, enum.Enum):
    open = "open"
    qualified = "qualified"
    disqualified = "disqualified"
    handoff = "handoff"
    closed = "closed"


class OutreachMessageRole(str, enum.Enum):
    agent = "agent"
    lead = "lead"
    system = "system"


class QualificationVerdict(str, enum.Enum):
    qualified = "qualified"
    needs_more_info = "needs_more_info"
    disqualified = "disqualified"
    handoff = "handoff"


class AppointmentStatus(str, enum.Enum):
    proposed = "proposed"
    pending_confirmation = "pending_confirmation"
    confirmed = "confirmed"
    cancelled = "cancelled"
    failed = "failed"


class HandoffStatus(str, enum.Enum):
    not_required = "not_required"
    pending = "pending"
    sent = "sent"
    acknowledged = "acknowledged"


class GoogleCalendarConnectionStatus(str, enum.Enum):
    active = "active"
    revoked = "revoked"
    expired = "expired"
