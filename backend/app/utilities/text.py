from app.constants.messages import ErrorMessages


def strip_not_blank(value: str) -> str:
    """Trim whitespace; reject values that are only whitespace."""
    value = value.strip()
    if not value:
        raise ValueError(ErrorMessages.BLANK_FIELD)
    return value


def normalize_choice(value: str) -> str:
    """Lenient matching of LLM output: "Feature Request" -> "feature_request"."""
    return value.strip().lower().replace(" ", "_")
