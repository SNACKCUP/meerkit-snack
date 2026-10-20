"""로그인 규칙. 토큰 발급은 core.security, 사용자 조회는 users.repository에 맡깁니다."""

from sqlalchemy.orm import Session

from app.core.security import create_token, decode_token, verify_password
from app.users import repository
from app.users.models import User


class AuthError(Exception):
    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code


def authenticate(db: Session, email: str, password: str) -> User:
    user = repository.get_by_email(db, email.strip().lower())
    if user is None or not verify_password(password, user.hashed_password):
        raise AuthError("INVALID_CREDENTIALS", "이메일 또는 비밀번호가 올바르지 않습니다.")
    if not user.is_active:
        raise AuthError("INACTIVE_USER", "비활성화된 계정입니다. 관리자에게 문의하세요.")
    return user


def issue_tokens(user: User) -> tuple[str, str]:
    """(액세스 토큰, 리프레시 토큰)"""
    return create_token(user.id, "access"), create_token(user.id, "refresh")


def user_from_token(db: Session, token: str, token_type: str) -> User | None:
    user_id = decode_token(token, token_type)  # type: ignore[arg-type]
    if user_id is None:
        return None
    user = repository.get_by_id(db, user_id)
    if user is None or not user.is_active:
        return None
    return user
