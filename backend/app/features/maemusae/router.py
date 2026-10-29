"""매무새 API 묶음: /api/mms 아래에 매무새 기능별 라우터를 붙입니다. app/api.py 는 이것 하나만 등록합니다."""

from fastapi import APIRouter

from app.features.maemusae.projects.router import router as projects_router

router = APIRouter(prefix="/mms")
router.include_router(projects_router)
