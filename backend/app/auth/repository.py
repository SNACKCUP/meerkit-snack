"""이메일 인증·비밀번호 재설정 토큰 테이블 접근. SQL(쿼리)은 이 파일에만 둡니다."""

from datetime import datetime

from sqlalchemy import delete, func, or_, select, update
from sqlalchemy.orm import Session

from app.auth.models import EmailVerification, PasswordResetToken
from app.users.models import User


def add(db: Session, row: object) -> None:
    db.add(row)
    db.flush()


def email_codes_since(db: Session, email: str, since: datetime) -> tuple[int, datetime | None, datetime | None]:
    """since 이후 이 이메일로 보낸 인증번호 (개수, 가장 이른 시각, 가장 늦은 시각)"""
    row = db.execute(
        select(
            func.count(EmailVerification.id),
            func.min(EmailVerification.created_at),
            func.max(EmailVerification.created_at),
        ).where(EmailVerification.email == email, EmailVerification.created_at >= since)
    ).one()
    return row[0], row[1], row[2]


def latest_pending_email_code(db: Session, email: str) -> EmailVerification | None:
    return db.scalar(
        select(EmailVerification)
        .where(
            EmailVerification.email == email,
            EmailVerification.verified_at.is_(None),
            EmailVerification.used_at.is_(None),
        )
        .order_by(EmailVerification.id.desc())
        .limit(1)
    )


def get_email_verification(db: Session, verification_id: int) -> EmailVerification | None:
    return db.get(EmailVerification, verification_id)


def reset_tokens_since(db: Session, user_id: int, since: datetime) -> tuple[int, datetime | None, datetime | None]:
    """since 이후 이 사용자에게 보낸 재설정 링크 (개수, 가장 이른 시각, 가장 늦은 시각)"""
    row = db.execute(
        select(
            func.count(PasswordResetToken.id),
            func.min(PasswordResetToken.created_at),
            func.max(PasswordResetToken.created_at),
        ).where(PasswordResetToken.user_id == user_id, PasswordResetToken.created_at >= since)
    ).one()
    return row[0], row[1], row[2]


def expire_reset_tokens(db: Session, user_id: int, now: datetime) -> None:
    """아직 안 쓴 재설정 링크를 모두 못 쓰게 합니다 (새 링크를 보내거나 비밀번호가 바뀌었을 때)"""
    db.execute(
        update(PasswordResetToken)
        .where(PasswordResetToken.user_id == user_id, PasswordResetToken.used_at.is_(None))
        .values(used_at=now)
    )


def get_reset_token_by_hash(db: Session, token_hash: str) -> PasswordResetToken | None:
    return db.scalar(select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash))


def delete_email_verifications_before(db: Session, cutoff: datetime) -> int:
    result = db.execute(delete(EmailVerification).where(EmailVerification.created_at < cutoff))
    return result.rowcount or 0


def _withdrawn_user_ids():
    # 탈퇴(deactivated_at)했거나 개인정보를 지운(deleted_at) 회원
    return select(User.id).where(or_(User.deactivated_at.is_not(None), User.deleted_at.is_not(None)))


def count_reset_tokens_of_withdrawn(db: Session) -> int:
    return db.scalar(
        select(func.count(PasswordResetToken.id)).where(PasswordResetToken.user_id.in_(_withdrawn_user_ids()))
    ) or 0


def delete_reset_tokens_of_withdrawn(db: Session) -> int:
    result = db.execute(
        delete(PasswordResetToken).where(PasswordResetToken.user_id.in_(_withdrawn_user_ids()))
    )
    return result.rowcount or 0


def count_email_verifications_before(db: Session, cutoff: datetime) -> int:
    return db.scalar(
        select(func.count(EmailVerification.id)).where(EmailVerification.created_at < cutoff)
    ) or 0
