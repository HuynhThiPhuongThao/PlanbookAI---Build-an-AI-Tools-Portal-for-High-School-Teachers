import logging
import logging.config


def configure_logging(log_level: str = "INFO") -> None:
    normalized_level = (log_level or "INFO").upper()
    logging.config.dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "standard": {
                    "format": "%(asctime)s %(levelname)s %(name)s %(message)s",
                },
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "standard",
                },
            },
            "root": {
                "handlers": ["console"],
                "level": normalized_level,
            },
            "loggers": {
                "uvicorn": {"level": normalized_level},
                "uvicorn.access": {"level": normalized_level},
                "uvicorn.error": {"level": normalized_level},
            },
        }
    )
