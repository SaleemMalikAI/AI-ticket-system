import logging


def setup_logging(level: str = "INFO") -> None:
    logging.basicConfig(
        level=level.upper(),
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )
    # uvicorn's access log duplicates RequestLoggingMiddleware
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
