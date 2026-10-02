// Mirrors backend/app/models.py enums

export const CATEGORIES = ["billing", "technical", "account", "feature_request", "general"] as const;
export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

/** Query params the ticket list syncs with the URL. */
export const FILTER_KEYS = ["status", "category", "priority", "q"] as const;

export const AI_DECIDE_LABEL = "Let AI decide";
export const ALL_LABEL = "All";

// Field limits (mirror backend/app/constants/ticket.py)
export const TITLE_MIN_LENGTH = 3;
export const TITLE_MAX_LENGTH = 200;
export const DESCRIPTION_MIN_LENGTH = 10;
export const DESCRIPTION_MAX_LENGTH = 5000;
export const SEARCH_MAX_LENGTH = 100;

/** Fields a user can change on the ticket page, with their display names. */
export const EDITABLE_FIELDS = {
  status: "Status",
  category: "Category",
  priority: "Priority",
} as const;
