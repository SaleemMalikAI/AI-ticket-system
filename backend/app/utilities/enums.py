from enum import Enum


def enum_values(enum_cls: type[Enum]) -> list[str]:
    """[Category.BILLING, ...] -> ["billing", ...]"""
    return [member.value for member in enum_cls]
