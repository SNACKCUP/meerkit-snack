from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.auth import service
from app.auth.deps import get_current_user
from app.auth.schemas import LoginRequest, ProfileFields, SignupRequest, TokenResponse
from app.core.config import settings
from app.core.database import get_db
from app.users import service as user_service
from app.users.models import User
from app.users.schemas import UserRead

router = APIRouter(prefix="/auth", tags=["auth"])

REFRESH_COOKIE = "meerkit_refresh"
REFRESH_COOKIE_PATH = "/api/auth"  # 갱신·로그아웃 요청에만 쿠키가 실립니다


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        REFRESH_COOKIE,
        token,
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        httponly=True,  # 자바스크립트에서 읽을 수 없음 (XSS로 탈취 방지)
        secure=settings.cookie_secure,
        samesite="lax",
        path=REFRESH_COOKIE_PATH,
    )


def _login_response(response: Response, user: User) -> TokenResponse:
    access_token, refresh_token = service.issue_tokens(user)
    _set_refresh_cookie(response, refresh_token)
    return TokenResponse(access_token=access_token)


@router.post(
    "/signup",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="회원가입 (기본 역할 VIEWER)",
)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    try:
        return user_service.create_user(
            db,
            login_id=body.user_id,
            email=body.email,
            password=body.password,
            name=body.name,
            profile=body.model_dump(include=set(ProfileFields.model_fields)),
        )
    except user_service.UserError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e)) from e


@router.post("/login", response_model=TokenResponse, summary="로그인")
def login(body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    try:
        user = service.authenticate(db, body.user_id, body.password)
    except service.AuthError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e)) from e
    return _login_response(response, user)


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
    return _login_response(response, user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, summary="로그아웃")
def logout(response: Response):
    response.delete_cookie(REFRESH_COOKIE, path=REFRESH_COOKIE_PATH)


@router.get("/me", response_model=UserRead, summary="내 정보")
def me(user: User = Depends(get_current_user)):
    return user
