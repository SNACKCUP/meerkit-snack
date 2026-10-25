"""앱 로그 설정. app.* 로거를 표준 출력으로 내보냅니다 (uvicorn 로그와 같은 화면에 보임)."""

import logging

from app.core.config import settings


def setup_logging() -> None:
    logger = logging.getLogger("app")
    logger.setLevel(settings.log_level.upper())
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))
        logger.addHandler(handler)
