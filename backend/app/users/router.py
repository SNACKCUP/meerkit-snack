from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.auth import router as auth_router
from app.auth import service as auth_service
from app.auth.deps import get_current_user
from app.auth.schemas import ChangePasswordRequest
from app.core.database import get_db
from app.permissions.deps import require_admin
from app.users import service
from app.users.models import User
from app.users.schemas import ActiveUpdate, RolesUpdate, UserRead

# 로그인한 본인: 내 정보, 비밀번호 변경, 탈퇴. /users/{user_id} 보다 먼저 등록해야 "me"가 id로 해석되지 않습니다.
me_router = APIRouter(prefix="/users/me", tags=["users (me)"])

# 관리자 전용: 멤버 목록, 역할 부여, 활성/비활성
router = APIRouter(prefix="/users", tags=["users (admin)"])


@me_router.patch(
    "/password",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="비밀번호 변경 (다른 기기의 로그인은 풀리고, 이 기기는 새 리프레시 쿠키를 받음)",
)
def change_password(
    body: ChangePasswordRequest,
    response: Response,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        auth_service.change_password(db, user, body.current_password, body.new_password)
    except auth_service.AuthError as e:
        raise auth_router.http_error(e) from e
    # 지금 쓰던 액세스 토큰도 무효가 되므로, 프론트는 401을 받으면 /auth/refresh 로 새 토큰을 받습니다.
    auth_router.set_refresh_cookie(response, auth_service.issue_tokens(user)[1])

_ERROR_STATUS = {
    "USER_NOT_FOUND": status.HTTP_404_NOT_FOUND,
    "SELF_CHANGE_FORBIDDEN": status.HTTP_400_BAD_REQUEST,
    "UNKNOWN_ROLE": status.HTTP_422_UNPROCESSABLE_CONTENT,
}


def _http_error(e: service.UserError) -> HTTPException:
    return HTTPException(status_code=_ERROR_STATUS.get(e.code, 400), detail=str(e))


@router.get("", response_model=list[UserRead], summary="멤버 목록")
def list_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return service.list_users(db)


@router.put("/{user_id}/roles", response_model=UserRead, summary="역할 변경")
def update_roles(
    user_id: int,
    body: RolesUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    try:
        return service.update_roles(db, admin, user_id, body.roles)
    except service.UserError as e:
        raise _http_error(e) from e


@router.patch("/{user_id}/active", response_model=UserRead, summary="활성/비활성")
def update_active(
    user_id: int,
    body: ActiveUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    try:
        return service.update_active(db, admin, user_id, body.is_active)
    except service.UserError as e:
        raise _http_error(e) from e
