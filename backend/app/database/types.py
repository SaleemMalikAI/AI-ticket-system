from enum import Enum

from sqlalchemy import Enum as SAEnum

from app.constants.ticket import ENUM_COLUMN_LENGTH
from app.utilities.enums import enum_values


def string_enum(enum_cls: type[Enum], name: str) -> SAEnum:
    """Enum column stored as VARCHAR + CHECK constraint (not a native PG enum),
    so adding new values later is a simple migration."""
    return SAEnum(
        enum_cls,
        name=name,
        native_enum=False,
        create_constraint=True,
        length=ENUM_COLUMN_LENGTH,
        values_callable=enum_values,
    )
