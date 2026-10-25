from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.auth import router as auth_router
from app.auth import service as auth_service
from app.auth.deps import get_current_user
from app.auth.schemas import ChangePasswordRequest
from app.core.config import settings
from app.core.database import get_db
from app.permissions.deps import require_admin
from app.users import service
from app.users.models import User
from app.users.schemas import (
    ActiveUpdate,
    MemberStatus,
    ProfileUpdate,
    RoleRead,
    RolesUpdate,
    UserPage,
    UserRead,
    WithdrawRequest,
)

# 로그인한 본인: 내 정보, 비밀번호 변경, 탈퇴. /users/{user_id} 보다 먼저 등록해야 "me"가 id로 해석되지 않습니다.
me_router = APIRouter(prefix="/users/me", tags=["users (me)"])

# 관리자 전용: 멤버 목록, 역할 부여, 활성/비활성
router = APIRouter(prefix="/users", tags=["users (admin)"])


_ERROR_STATUS = {
    "USER_NOT_FOUND": status.HTTP_404_NOT_FOUND,
    "SELF_CHANGE_FORBIDDEN": status.HTTP_400_BAD_REQUEST,
    "UNKNOWN_ROLE": status.HTTP_422_UNPROCESSABLE_CONTENT,
    "EMAIL_TAKEN": status.HTTP_409_CONFLICT,
    "NICKNAME_TAKEN": status.HTTP_409_CONFLICT,
    "INVALID_PASSWORD": status.HTTP_400_BAD_REQUEST,
    "USER_DELETED": status.HTTP_409_CONFLICT,
}


def _http_error(e: service.UserError) -> HTTPException:
    return HTTPException(status_code=_ERROR_STATUS.get(e.code, 400), detail=str(e))


@me_router.get("", response_model=UserRead, summary="내 정보")
def get_me(user: User = Depends(get_current_user)):
    return user


@me_router.patch("", response_model=UserRead, summary="내 정보 수정 (보낸 항목만)")
def update_me(
    body: ProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    changes = body.model_dump(exclude_unset=True, exclude={"email_verification_token"})
    for required in ("name", "email"):
        if required in changes and changes[required] is None:
            del changes[required]  # 이름·이메일은 지울 수 없음
    email_verified = False
    try:
        new_email = changes.get("email")
        email_changed = bool(new_email) and new_email.strip().lower() != user.email
        if email_changed and (
            settings.signup_email_verification_required or body.email_verification_token
        ):
            auth_service.consume_email_verification(db, body.email_verification_token, new_email)
            email_verified = True
        return service.update_profile(db, user, changes, email_verified=email_verified)
    except auth_service.AuthError as e:
        raise auth_router.http_error(e) from e
    except service.UserError as e:
        raise _http_error(e) from e


@me_router.delete(
    "",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="탈퇴 (계정을 막고, 보관 기간이 지나면 개인정보 삭제)",
)
def withdraw_me(
    body: WithdrawRequest,
    response: Response,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        service.withdraw(db, user, body.password)
    except service.UserError as e:
        raise _http_error(e) from e
    response.delete_cookie(auth_router.REFRESH_COOKIE, path=auth_router.REFRESH_COOKIE_PATH)


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

@router.get("", response_model=UserPage, summary="멤버 검색 (아이디·이름·이메일·닉네임, 역할·상태 필터, 페이지)")
def list_users(
    q: Annotated[str | None, Query(max_length=100)] = None,
    role_id: int | None = None,
    status: MemberStatus | None = None,
    page: Annotated[int, Query(ge=1)] = 1,
    size: Annotated[int, Query(ge=1, le=100)] = 20,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    items, total = service.search_users(
        db, q=q, role_id=role_id, status=status, page=page, size=size
    )
    return UserPage(items=items, total=total, page=page, size=size)


@router.get("/roles", response_model=list[RoleRead], summary="역할 목록")
def list_roles(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return service.list_roles(db)


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


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="멤버 삭제 (탈퇴 처리, 보관 기간 뒤 개인정보 삭제)",
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    try:
        service.delete_user(db, admin, user_id)
    except service.UserError as e:
        raise _http_error(e) from e
