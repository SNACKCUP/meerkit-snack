"""users 테이블 접근. SQL(쿼리)은 이 파일에만 둡니다."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.users.models import Role, Term, User, UserTermAgreement


def get_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_by_login_id(db: Session, login_id: str) -> User | None:
    return db.scalar(select(User).where(User.login_id == login_id))


def get_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def get_by_nickname(db: Session, nickname: str) -> User | None:
    return db.scalar(select(User).where(User.nickname == nickname))


def list_all(db: Session) -> list[User]:
    return list(db.scalars(select(User).order_by(User.id)))


def list_roles(db: Session) -> list[Role]:
    return list(db.scalars(select(Role).order_by(Role.id)))


def get_roles_by_codes(db: Session, codes: list[str]) -> list[Role]:
    return list(db.scalars(select(Role).where(Role.code.in_(codes)).order_by(Role.id)))


def add(db: Session, user: User) -> User:
    db.add(user)
    db.flush()
    return user


def list_current_terms(db: Session) -> list[Term]:
    return list(db.scalars(select(Term).where(Term.is_active.is_(True)).order_by(Term.id)))


def add_term_agreements(db: Session, user_id: int, term_ids: list[int]) -> None:
    db.add_all(UserTermAgreement(user_id=user_id, term_id=term_id) for term_id in term_ids)
    db.flush()
