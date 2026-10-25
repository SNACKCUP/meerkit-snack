"""로그인·이메일 인증 규칙. 토큰 발급은 core.security, 사용자 조회는 users.repository에 맡깁니다.

메일은 응답을 늦추지 않도록 BackgroundTasks 에 넣어 응답 뒤에 보냅니다.
"""

import math
from datetime import UTC, datetime, timedelta

from fastapi import BackgroundTasks
from sqlalchemy.orm import Session

from app.auth import repository as auth_repository
from app.auth.models import EmailVerification
from app.core.config import settings
from app.core.security import (
    create_email_verification_token,
    create_token,
    decode_email_verification_token,
    decode_token,
    generate_code,
    hash_secret,
    secrets_match,
    verify_dummy_password,
    verify_password,
)
from app.mail import send_mail
from app.users import repository
from app.users import service as user_service
from app.users.models import User


class AuthError(Exception):
    def __init__(self, code: str, message: str, *, retry_after: int | None = None):
        super().__init__(message)
        self.code = code
        self.retry_after = retry_after  # 429 응답의 Retry-After(초)


def _now() -> datetime:
    return datetime.now(UTC)


def _seconds_until(moment: datetime) -> int:
    return max(1, math.ceil((moment - _now()).total_seconds()))


def _locked_error(locked_until: datetime) -> AuthError:
    seconds = _seconds_until(locked_until)
    return AuthError(
        "ACCOUNT_LOCKED",
        f"로그인 시도가 너무 많습니다. {math.ceil(seconds / 60)}분 후 다시 시도해 주세요.",
        retry_after=seconds,
    )


def _record_login_failure(db: Session, user: User) -> None:
    user.failed_login_count = (user.failed_login_count or 0) + 1
    max_attempts = settings.login_lock_max_attempts
    if max_attempts > 0 and user.failed_login_count >= max_attempts:
        user.locked_until = _now() + timedelta(minutes=settings.login_lock_minutes)
        user.failed_login_count = 0
    db.commit()


def authenticate(db: Session, login_id: str, password: str) -> User:
    user = repository.get_by_login_id(db, login_id.strip().lower())
    if user is None or user.deleted_at is not None:
        verify_dummy_password(password)
        raise AuthError("INVALID_CREDENTIALS", "아이디 또는 비밀번호가 올바르지 않습니다.")
    if user.locked_until is not None and user.locked_until > _now():
        raise _locked_error(user.locked_until)
    if not verify_password(password, user.hashed_password):
        _record_login_failure(db, user)
        if user.locked_until is not None and user.locked_until > _now():
            raise _locked_error(user.locked_until)
        raise AuthError("INVALID_CREDENTIALS", "아이디 또는 비밀번호가 올바르지 않습니다.")
    if user.deactivated_at is not None:
        raise AuthError("WITHDRAWN_USER", "탈퇴한 계정입니다.")
    if not user.is_active:
        raise AuthError("INACTIVE_USER", "비활성화된 계정입니다. 관리자에게 문의하세요.")

    user.failed_login_count = 0
    user.locked_until = None
    user.last_login_at = _now()
    db.commit()
    return user


def issue_tokens(user: User) -> tuple[str, str]:
    """(액세스 토큰, 리프레시 토큰)"""
    return create_token(user.id, "access"), create_token(user.id, "refresh")


def user_from_token(db: Session, token: str, token_type: str) -> User | None:
    claims = decode_token(token, token_type)  # type: ignore[arg-type]
    if claims is None:
        return None
    user = repository.get_by_id(db, claims.user_id)
    if user is None or not user.is_active or user.deactivated_at is not None:
        return None
    # 비밀번호를 바꾸기 전에 발급된 토큰은 거부합니다 (iat가 초 단위라 같은 초에 발급된 토큰은 허용)
    if user.password_changed_at is not None and claims.issued_at < int(
        user.password_changed_at.timestamp()
    ):
        return None
    return user


# ---- 메일 발송 횟수 제한 (인증번호·비밀번호 재설정 공통) ----


def mail_retry_after(count_today: int, first_today: datetime | None, last: datetime | None) -> int | None:
    """보내면 안 되는 상황이면 기다려야 할 초, 보내도 되면 None"""
    now = _now()
    if last is not None and settings.mail_cooldown_seconds > 0:
        next_allowed = last + timedelta(seconds=settings.mail_cooldown_seconds)
        if next_allowed > now:
            return _seconds_until(next_allowed)
    if count_today >= settings.mail_daily_limit and first_today is not None:
        return _seconds_until(first_today + timedelta(days=1))
    return None


# ---- 가입 전 이메일 인증 ----

INVALID_CODE_MESSAGE = "인증번호가 올바르지 않거나 만료되었습니다."


def send_email_code(db: Session, tasks: BackgroundTasks, email: str) -> None:
    email = email.strip().lower()
    if repository.get_by_email(db, email):
        raise AuthError("EMAIL_TAKEN", "이미 가입된 이메일입니다.")
    count, first, last = auth_repository.email_codes_since(db, email, _now() - timedelta(days=1))
    retry_after = mail_retry_after(count, first, last)
    if retry_after is not None:
        raise AuthError("RATE_LIMITED", "잠시 후 다시 시도해 주세요.", retry_after=retry_after)

    code = generate_code()
    now = _now()
    auth_repository.add(
        db,
        EmailVerification(
            email=email,
            code_hash=hash_secret(code),
            expires_at=now + timedelta(minutes=settings.email_code_expire_minutes),
            created_at=now,
        ),
    )
    db.commit()
    tasks.add_task(
        send_mail,
        email,
        "email_code",
        {"code": code, "expire_minutes": settings.email_code_expire_minutes},
    )


def verify_email_code(db: Session, email: str, code: str) -> str:
    """인증번호가 맞으면 가입에 붙일 증표(token)를 돌려줍니다."""
    email = email.strip().lower()
    row = auth_repository.latest_pending_email_code(db, email)
    if (
        row is None
        or row.expires_at <= _now()
        or row.attempts >= settings.email_code_max_attempts
    ):
        raise AuthError("INVALID_CODE", INVALID_CODE_MESSAGE)
    if not secrets_match(code.strip(), row.code_hash):
        row.attempts += 1
        db.commit()
        raise AuthError("INVALID_CODE", INVALID_CODE_MESSAGE)
    row.verified_at = _now()
    db.commit()
    return create_email_verification_token(row.id, email)


def consume_email_verification(db: Session, token: str | None, email: str) -> None:
    """가입할 때 증표를 확인하고 사용 처리합니다. commit은 가입과 함께 합니다."""
    decoded = decode_email_verification_token(token) if token else None
    row = None
    if decoded is not None and decoded[1] == email.strip().lower():
        row = auth_repository.get_email_verification(db, decoded[0])
    if row is None or row.verified_at is None or row.used_at is not None:
        raise AuthError(
            "EMAIL_VERIFICATION_REQUIRED", "이메일 인증을 완료해 주세요. (인증이 만료되었으면 다시 받아 주세요)"
        )
    row.used_at = _now()


def signup(db: Session, data: dict, *, verification_token: str | None) -> User:
    """가입. 이메일 인증 증표 확인 → 계정·약관 동의 저장을 한 트랜잭션으로 처리합니다."""
    verified = False
    if settings.signup_email_verification_required or verification_token:
        consume_email_verification(db, verification_token, data["email"])
        verified = True
    return user_service.create_user(db, **data, email_verified=verified)
