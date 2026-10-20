from fastapi import APIRouter

from app.features.requirements.router import router as requirements_router

# 모든 기능 라우터를 여기서 한 번에 등록합니다. main.py 에서 "/api" 아래에 붙습니다.
api_router = APIRouter()
api_router.include_router(requirements_router)
