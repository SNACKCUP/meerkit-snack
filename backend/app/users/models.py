from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    func,
    true,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.models import TimestampMixin


# 사용자 ↔ 역할 연결 테이블 (다대다). 같은 역할을 두 번 넣지 못하도록 두 컬럼을 합쳐 PK로 둡니다.
class UserRole(Base):
    __tablename__ = "user_roles"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    role_id: Mapped[int] = mapped_column(
        ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True
    )


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(30), unique=True)  # MASTER 등: 코드에서 비교하는 값
    name: Mapped[str] = mapped_column(String(50))  # 화면 표시용 이름


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    # 로그인 아이디. API에서는 user_id 라는 이름으로 주고받습니다 (PK id, user_roles.user_id와 구분)
    login_id: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(50))
    is_active: Mapped[bool] = mapped_column(Boolean, server_default=true())

    # 가입 때 선택적으로 받는 항목 (프론트 meerkit.config.ts의 signup.optionalFields)
    nickname: Mapped[str | None] = mapped_column(String(30), unique=True)
    phone: Mapped[str | None] = mapped_column(String(20))
    postcode: Mapped[str | None] = mapped_column(String(10))
    address: Mapped[str | None] = mapped_column(String(255))
    address_detail: Mapped[str | None] = mapped_column(String(255))
    birth_date: Mapped[date | None] = mapped_column(Date)
    gender: Mapped[str | None] = mapped_column(String(10))
    avatar_url: Mapped[str | None] = mapped_column(String(500))

    email_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # 로그인 잠금: 연속 실패 횟수와 잠금이 풀리는 시각
    failed_login_count: Mapped[int] = mapped_column(Integer, server_default="0")
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # 이 시각 이전에 발급된 토큰은 거부합니다 (비밀번호를 바꾸면 다른 기기의 로그인이 풀림)
    password_changed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # 탈퇴: deactivated_at(탈퇴 시각, 계정 막힘) → 보관 기간이 지나면 개인정보를 지우고 deleted_at 기록
    deactivated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # user.roles 로 역할 목록을 바로 꺼낼 수 있습니다 (JPA의 @ManyToMany + @JoinTable)
    roles: Mapped[list[Role]] = relationship(
        secondary="user_roles", lazy="selectin", order_by="Role.id"
    )

    @property
    def role_codes(self) -> list[str]:
        return sorted(role.code for role in self.roles)

    @property
    def email_verified(self) -> bool:
        return self.email_verified_at is not None

    def has_role(self, code: str) -> bool:
        return any(role.code == code for role in self.roles)


# 약관. 문구가 바뀌면 같은 code로 version을 올려 새 행을 추가합니다 (동의 기록은 버전별로 남음)
class Term(Base):
    __tablename__ = "terms"
    __table_args__ = (UniqueConstraint("code", "version"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(30))  # 프론트 meerkit.config.ts의 terms[].id 와 같은 값
    version: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(100))
    is_required: Mapped[bool] = mapped_column(Boolean)
    is_active: Mapped[bool] = mapped_column(Boolean, server_default=true())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class UserTermAgreement(Base):
    __tablename__ = "user_term_agreements"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    term_id: Mapped[int] = mapped_column(ForeignKey("terms.id"), primary_key=True)
    agreed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
