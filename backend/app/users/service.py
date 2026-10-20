"""회원 관리 업무 규칙. HTTP는 모르고, DB 접근은 repository에 맡깁니다."""

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.users import repository
from app.users.models import User

DEFAULT_ROLE = "USER"


class UserError(Exception):
    """서비스 규칙 위반. router에서 HTTP 오류로 바꿉니다."""

    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code


def create_user(
    db: Session, *, email: str, password: str, name: str, roles: list[str] | None = None
) -> User:
    email = email.strip().lower()
    if repository.get_by_email(db, email):
        raise UserError("EMAIL_TAKEN", "이미 가입된 이메일입니다.")
    user = User(email=email, hashed_password=hash_password(password), name=name)
    user.roles = repository.get_roles_by_codes(db, roles or [DEFAULT_ROLE])
    repository.add(db, user)
    db.commit()
    db.refresh(user)
    return user


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
    codes = sorted(set(codes) | {DEFAULT_ROLE})  # 모든 사용자는 기본 역할을 가집니다
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
