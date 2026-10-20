from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.permissions.deps import require_admin
from app.users import service
from app.users.models import User
from app.users.schemas import ActiveUpdate, RolesUpdate, UserRead

# 관리자 전용: 멤버 목록, 역할 부여, 활성/비활성
router = APIRouter(prefix="/users", tags=["users (admin)"])

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
