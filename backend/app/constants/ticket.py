"""Ticket enums, defaults and field limits shared by models, schemas and services."""

from enum import StrEnum


class Category(StrEnum):
    BILLING = "billing"
    TECHNICAL = "technical"
    ACCOUNT = "account"
    FEATURE_REQUEST = "feature_request"
    GENERAL = "general"


class Priority(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Status(StrEnum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


# Used when the user picks nothing and the AI is unavailable
DEFAULT_CATEGORY = Category.GENERAL
DEFAULT_PRIORITY = Priority.MEDIUM
DEFAULT_STATUS = Status.OPEN

TITLE_MIN_LENGTH = 3
TITLE_MAX_LENGTH = 200
DESCRIPTION_MIN_LENGTH = 10
DESCRIPTION_MAX_LENGTH = 5000
ENUM_COLUMN_LENGTH = 32

LIST_DEFAULT_LIMIT = 50
LIST_MAX_LIMIT = 100
