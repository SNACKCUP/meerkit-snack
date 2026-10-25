from fastapi import APIRouter

from app.account.admin_router import router as users_admin_router
from app.account.me_router import router as users_me_router
from app.auth.router import router as auth_router
from app.features.requirements.router import router as requirements_router

# 모든 라우터를 여기서 한 번에 등록합니다. main.py 에서 "/api" 아래에 붙습니다.
api_router = APIRouter()

# 킷 (공통 기반)
api_router.include_router(auth_router)
api_router.include_router(users_me_router)  # /users/{user_id} 보다 먼저
api_router.include_router(users_admin_router)

# 서비스 기능
api_router.include_router(requirements_router)
