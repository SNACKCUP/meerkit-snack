from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.config import settings
from app.core.logging import setup_logging


def create_app() -> FastAPI:
    setup_logging()
    settings.check_production()  # 운영(APP_ENV=production)에서 위험한 설정이면 시작하지 않음
    app = FastAPI(title="MeerKit")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health():
        return {"status": "ok"}

    app.include_router(api_router, prefix="/api")
    return app


app = create_app()