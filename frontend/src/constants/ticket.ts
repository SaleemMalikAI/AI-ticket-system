// Mirrors backend/app/models.py enums

export const CATEGORIES = ["billing", "technical", "account", "feature_request", "general"] as const;
export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

/** Query params the ticket list syncs with the URL. */
export const FILTER_KEYS = ["status", "category", "priority"] as const;

export const AI_DECIDE_LABEL = "✨ Let AI decide";
export const ALL_LABEL = "All";
