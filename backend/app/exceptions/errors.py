from fastapi import status


class AppError(Exception):
    """Base for expected errors. Services raise these; handlers turn them into JSON."""

    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND


class AIUnavailableError(AppError):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
