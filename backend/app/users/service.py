"""회원 관리 업무 규칙. HTTP는 모르고, DB 접근은 repository에 맡깁니다."""

from datetime import UTC, datetime
from typing import Any

from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.permissions.roles import DEFAULT_ROLE
from app.users import repository
from app.users.models import Role, Term, User

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


def search_users(
    db: Session, *, q: str | None, role_id: int | None, status: str | None, page: int, size: int
) -> tuple[list[User], int]:
    return repository.search(
        db, q=(q or "").strip() or None, role_id=role_id, status=status, offset=(page - 1) * size, limit=size
    )


def list_roles(db: Session) -> list[Role]:
    return repository.list_roles(db)


# ---- 내 정보 ----


def update_profile(
    db: Session, user: User, changes: dict[str, Any], *, email_verified: bool = False
) -> User:
    """바꿀 항목만 받습니다. 선택 항목은 None 으로 보내면 지워집니다. 이메일을 바꾸면 인증 상태를 다시 정합니다."""
    if "email" in changes:
        email = changes["email"].strip().lower()
        if email != user.email:
            other = repository.get_by_email(db, email)
            if other is not None and other.id != user.id:
                raise UserError("EMAIL_TAKEN", "이미 가입된 이메일입니다.")
            user.email = email
            user.email_verified_at = datetime.now(UTC) if email_verified else None
        changes = {k: v for k, v in changes.items() if k != "email"}
    nickname = changes.get("nickname")
    if nickname and nickname != user.nickname:
        other = repository.get_by_nickname(db, nickname)
        if other is not None and other.id != user.id:
            raise UserError("NICKNAME_TAKEN", "이미 사용 중인 닉네임입니다.")
    for field, value in changes.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def _deactivate(user: User) -> None:
    """탈퇴 처리: 계정을 막고 탈퇴 시각을 남깁니다. 개인정보는 보관 기간 뒤 purge 명령이 지웁니다."""
    user.is_active = False
    if user.deactivated_at is None:
        user.deactivated_at = datetime.now(UTC)


def withdraw(db: Session, user: User, password: str) -> None:
    if not verify_password(password, user.hashed_password):
        raise UserError("INVALID_PASSWORD", "비밀번호가 올바르지 않습니다.")
    _deactivate(user)
    db.commit()


# ---- 관리자 ----


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
    """활성/비활성 전환. 로그인 잠금도 함께 풉니다. 탈퇴한 계정을 활성화하면 탈퇴가 취소됩니다."""
    user = _get_other_user(db, actor, user_id)
    if user.deleted_at is not None:
        raise UserError("USER_DELETED", "개인정보가 삭제된 계정은 바꿀 수 없습니다.")
    user.is_active = is_active
    if is_active:
        user.deactivated_at = None
    user.failed_login_count = 0
    user.locked_until = None
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, actor: User, user_id: int) -> None:
    """관리자 삭제 = 탈퇴 처리 (바로 지우지 않고 보관 기간 뒤 개인정보 삭제)"""
    user = _get_other_user(db, actor, user_id)
    _deactivate(user)
    db.commit()
