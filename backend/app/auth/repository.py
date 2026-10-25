"""이메일 인증·비밀번호 재설정 토큰 테이블 접근. SQL(쿼리)은 이 파일에만 둡니다."""

from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth.models import EmailVerification


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
