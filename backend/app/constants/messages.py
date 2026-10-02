"""User-facing error messages. Placeholders are filled with str.format()."""

from enum import StrEnum


class ErrorMessages(StrEnum):
    TICKET_NOT_FOUND = "Ticket {ticket_id} not found"
    DATABASE_UNAVAILABLE = "Database error, please try again later"
    INTERNAL_ERROR = "Internal server error"
    BLANK_FIELD = "must not be blank"
    EMPTY_UPDATE = "provide at least one of: status, category, priority"
    AI_UNAVAILABLE = "The AI assistant is unavailable right now. Please try again in a moment."
