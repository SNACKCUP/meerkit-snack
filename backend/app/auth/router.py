from typing import Annotated

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Cookie,
    Depends,
    HTTPException,
    Query,
    Response,
    status,
)
from sqlalchemy.orm import Session

from app.auth import service
from app.auth.deps import get_current_user
from app.auth.schemas import (
    EmailCodeRequest,
    ForgotPasswordRequest,
    LoginIdCheck,
    LoginRequest,
    ProfileFields,
    ResetPasswordRequest,
    SignupRequest,
    TermRead,
    TokenResponse,
    VerifyEmailCodeRequest,
    VerifyEmailCodeResponse,
)
from app.core.config import settings
from app.core.database import get_db
from app.users import service as user_service
from app.users.models import User
from app.users.schemas import UserRead

router = APIRouter(prefix="/auth", tags=["auth"])

REFRESH_COOKIE = "meerkit_refresh"
REFRESH_COOKIE_PATH = "/api/auth"  # 갱신·로그아웃 요청에만 쿠키가 실립니다

# 서비스 오류 코드 → HTTP 상태. 429는 Retry-After(초) 헤더를 함께 보냅니다.
_ERROR_STATUS = {
    "INVALID_CREDENTIALS": status.HTTP_401_UNAUTHORIZED,
    "INACTIVE_USER": status.HTTP_401_UNAUTHORIZED,
    "WITHDRAWN_USER": status.HTTP_401_UNAUTHORIZED,
    "ACCOUNT_LOCKED": status.HTTP_429_TOO_MANY_REQUESTS,
    "RATE_LIMITED": status.HTTP_429_TOO_MANY_REQUESTS,
    "EMAIL_TAKEN": status.HTTP_409_CONFLICT,
    "LOGIN_ID_TAKEN": status.HTTP_409_CONFLICT,
    "NICKNAME_TAKEN": status.HTTP_409_CONFLICT,
    "INVALID_CODE": status.HTTP_400_BAD_REQUEST,
    "INVALID_RESET_TOKEN": status.HTTP_400_BAD_REQUEST,
    "INVALID_PASSWORD": status.HTTP_400_BAD_REQUEST,
    "SAME_PASSWORD": status.HTTP_400_BAD_REQUEST,
    "EMAIL_VERIFICATION_REQUIRED": status.HTTP_400_BAD_REQUEST,
    "UNKNOWN_TERM": status.HTTP_422_UNPROCESSABLE_CONTENT,
    "TERMS_REQUIRED": status.HTTP_422_UNPROCESSABLE_CONTENT,
}


def http_error(e: service.AuthError | user_service.UserError) -> HTTPException:
    headers = None
    if getattr(e, "retry_after", None):
        headers = {"Retry-After": str(e.retry_after)}
    return HTTPException(
        status_code=_ERROR_STATUS.get(e.code, status.HTTP_400_BAD_REQUEST),
        detail=str(e),
        headers=headers,
    )


def set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        REFRESH_COOKIE,
        token,
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        httponly=True,  # 자바스크립트에서 읽을 수 없음 (XSS로 탈취 방지)
        secure=settings.cookie_secure,
        samesite="lax",
        path=REFRESH_COOKIE_PATH,
    )


def login_response(response: Response, user: User) -> TokenResponse:
    access_token, refresh_token = service.issue_tokens(user)
    set_refresh_cookie(response, refresh_token)
    return TokenResponse(access_token=access_token)


@router.get("/terms", response_model=list[TermRead], summary="가입 때 동의받을 약관 (현재 버전)")
def list_terms(db: Session = Depends(get_db)):
    return user_service.list_terms(db)


@router.get("/check-user-id", response_model=LoginIdCheck, summary="아이디 사용 가능 여부")
def check_user_id(
    user_id: Annotated[str, Query(pattern=r"^[A-Za-z0-9_]{4,30}$")],
    db: Session = Depends(get_db),
):
    return LoginIdCheck(available=user_service.is_login_id_available(db, user_id))


@router.post(
    "/email/send-code",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="가입용 이메일 인증번호 발송 (같은 이메일 60초 간격, 하루 10회)",
)
def send_email_code(
    body: EmailCodeRequest, tasks: BackgroundTasks, db: Session = Depends(get_db)
):
    try:
        service.send_email_code(db, tasks, body.email)
    except service.AuthError as e:
        raise http_error(e) from e


@router.post(
    "/email/verify-code",
    response_model=VerifyEmailCodeResponse,
    summary="인증번호 확인 → 가입에 붙일 증표 발급",
)
def verify_email_code(body: VerifyEmailCodeRequest, db: Session = Depends(get_db)):
    try:
        return VerifyEmailCodeResponse(token=service.verify_email_code(db, body.email, body.code))
    except service.AuthError as e:
        raise http_error(e) from e


@router.post(
    "/signup",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="회원가입 (기본 역할 VIEWER, 필수 약관·이메일 인증 필요)",
)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    data = {
        "login_id": body.user_id,
        "email": body.email,
        "password": body.password,
        "name": body.name,
        "profile": body.model_dump(include=set(ProfileFields.model_fields)),
        "agreed_terms": body.agreed_terms,
    }
    try:
        return service.signup(db, data, verification_token=body.email_verification_token)
    except (service.AuthError, user_service.UserError) as e:
        raise http_error(e) from e


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="로그인 (연속 실패 시 잠금: 429 + Retry-After)",
)
def login(body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    try:
        user = service.authenticate(db, body.user_id, body.password)
    except service.AuthError as e:
        raise http_error(e) from e
    return login_response(response, user)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="리프레시 쿠키로 액세스 토큰 재발급",
)
def refresh(
    response: Response,
    db: Session = Depends(get_db),
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE),
):
    user = service.user_from_token(db, refresh_token, "refresh") if refresh_token else None
    if user is None:
        response.delete_cookie(REFRESH_COOKIE, path=REFRESH_COOKIE_PATH)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="다시 로그인해 주세요."
        )
    return login_response(response, user)


@router.post(
    "/password/forgot",
    status_code=status.HTTP_202_ACCEPTED,
    summary="비밀번호 재설정 메일 요청 (가입 여부와 관계없이 항상 같은 응답)",
)
def forgot_password(
    body: ForgotPasswordRequest, tasks: BackgroundTasks, db: Session = Depends(get_db)
):
    service.request_password_reset(db, tasks, body.email)
    return {"detail": "가입된 이메일이면 비밀번호 재설정 메일을 보냈습니다."}


@router.post(
    "/password/reset",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="메일 링크의 토큰으로 새 비밀번호 설정 (30분, 한 번만)",
)
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        service.reset_password(db, body.token, body.password)
    except service.AuthError as e:
        raise http_error(e) from e


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, summary="로그아웃")
def logout(response: Response):
    response.delete_cookie(REFRESH_COOKIE, path=REFRESH_COOKIE_PATH)


@router.get(
    "/me",
    response_model=UserRead,
    summary="내 정보 (임시 유지, 새 코드는 GET /users/me 사용)",
    deprecated=True,
)
def me(user: User = Depends(get_current_user)):
    return user
