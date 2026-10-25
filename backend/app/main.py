from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api import api_router
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.exceptions import AppError, register_exception_handlers
from app.core.logging import setup_logging
from app.core.middleware import RequestContextMiddleware


class ServiceUnavailableError(AppError):
    status_code = 503


def create_app() -> FastAPI:
    setup_logging()
    app = FastAPI(title="MeerKit")
    register_exception_handlers(app)
    # 나중에 추가한 미들웨어가 바깥을 감쌉니다. CORS 를 가장 바깥에 두어 500 응답에도 CORS 헤더가 붙게 합니다.
    app.add_middleware(RequestContextMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID"],
    )

    @app.get("/health", summary="살아 있는지 (DB 확인 없음)")
    def health():
        return {"status": "ok"}

    @app.get("/health/ready", summary="요청을 받을 준비가 됐는지 (DB 연결까지 확인)")
    def ready():
        try:
            with SessionLocal() as db:
                db.execute(text("SELECT 1"))
        except Exception as e:
            raise ServiceUnavailableError("DB_UNAVAILABLE", "데이터베이스에 연결할 수 없습니다.") from e
        return {"status": "ok", "database": "ok"}

    app.include_router(api_router, prefix="/api")
    return app


app = create_app()
