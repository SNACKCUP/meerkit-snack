"""회원 관리 업무 규칙. HTTP는 모르고, DB 접근은 repository에 맡깁니다."""

from datetime import UTC, datetime
from typing import Any

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.permissions.roles import DEFAULT_ROLE
from app.users import repository
from app.users.models import Term, User

RESERVED_LOGIN_ID_PREFIX = "deleted_"  # 개인정보를 지운 계정의 아이디에 씁니다


class UserError(Exception):
    """서비스 규칙 위반. router에서 HTTP 오류로 바꿉니다."""

    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code


def is_login_id_available(db: Session, login_id: str) -> bool:
    login_id = login_id.strip().lower()
    if login_id.startswith(RESERVED_LOGIN_ID_PREFIX):
        return False
    return repository.get_by_login_id(db, login_id) is None


def create_user(
    db: Session,
    *,
    login_id: str,
    email: str,
    password: str,
    name: str,
    profile: dict[str, Any] | None = None,
    roles: list[str] | None = None,
    agreed_terms: list[str] | None = None,
    email_verified: bool = False,
) -> User:
    """가입 규칙(중복 검사, 약관, 기본 역할). commit까지 합니다.

    agreed_terms 가 None 이면 약관 검사를 하지 않습니다 (시드·테스트처럼 서버가 직접 만드는 계정).
    """
    login_id = login_id.strip().lower()
    email = email.strip().lower()
    profile = {k: v for k, v in (profile or {}).items() if v is not None}
    if not is_login_id_available(db, login_id):
        raise UserError("LOGIN_ID_TAKEN", "이미 사용 중인 아이디입니다.")
    if repository.get_by_email(db, email):
        raise UserError("EMAIL_TAKEN", "이미 가입된 이메일입니다.")
    if profile.get("nickname") and repository.get_by_nickname(db, profile["nickname"]):
        raise UserError("NICKNAME_TAKEN", "이미 사용 중인 닉네임입니다.")
    terms = _check_terms(db, agreed_terms) if agreed_terms is not None else []
    user = User(
        login_id=login_id, email=email, hashed_password=hash_password(password), name=name, **profile
    )
    if email_verified:
        user.email_verified_at = datetime.now(UTC)
    user.roles = repository.get_roles_by_codes(db, roles or [DEFAULT_ROLE])
    repository.add(db, user)
    repository.add_term_agreements(db, user.id, [term.id for term in terms])
    db.commit()
    db.refresh(user)
    return user


def list_terms(db: Session) -> list[Term]:
    return repository.list_current_terms(db)


def _check_terms(db: Session, agreed_codes: list[str]) -> list[Term]:
    """동의한 약관 code 목록을 확인하고, 동의 기록을 남길 약관(현재 버전)을 돌려줍니다."""
    current = {term.code: term for term in repository.list_current_terms(db)}
    agreed = set(agreed_codes)
    if agreed - current.keys():
        raise UserError("UNKNOWN_TERM", "존재하지 않는 약관이 있습니다.")
    if any(term.is_required and code not in agreed for code, term in current.items()):
        raise UserError("TERMS_REQUIRED", "필수 약관에 모두 동의해 주세요.")
    return [current[code] for code in sorted(agreed)]


def list_users(db: Session) -> list[User]:
    return repository.list_all(db)


def _get_other_user(db: Session, actor: User, user_id: int) -> User:
    user = repository.get_by_id(db, user_id)
    if user is None:
        raise UserError("USER_NOT_FOUND", "사용자를 찾을 수 없습니다.")
    if user.id == actor.id:
        # 관리자가 자기 권한을 빼거나 자기 계정을 막아 아무도 관리자가 없어지는 상황을 막습니다.
        raise UserError("SELF_CHANGE_FORBIDDEN", "자기 자신의 역할·상태는 바꿀 수 없습니다.")
    return user


def update_roles(db: Session, actor: User, user_id: int, codes: list[str]) -> User:
    user = _get_other_user(db, actor, user_id)
    codes = sorted(set(codes))
    roles = repository.get_roles_by_codes(db, codes)
    if len(roles) != len(codes):
        raise UserError("UNKNOWN_ROLE", "존재하지 않는 역할이 있습니다.")
    user.roles = roles
    db.commit()
    db.refresh(user)
    return user


def update_active(db: Session, actor: User, user_id: int, is_active: bool) -> User:
    user = _get_other_user(db, actor, user_id)
    user.is_active = is_active
    db.commit()
    db.refresh(user)
    return user
