from sqlalchemy import Boolean, ForeignKey, String, true
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
    code: Mapped[str] = mapped_column(String(30), unique=True)  # USER, ADMIN: 코드에서 비교하는 값
    name: Mapped[str] = mapped_column(String(50))  # 화면 표시용 이름


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(50))
    is_active: Mapped[bool] = mapped_column(Boolean, server_default=true())

    # user.roles 로 역할 목록을 바로 꺼낼 수 있습니다 (JPA의 @ManyToMany + @JoinTable)
    roles: Mapped[list[Role]] = relationship(secondary="user_roles", lazy="selectin")

    @property
    def role_codes(self) -> list[str]:
        return sorted(role.code for role in self.roles)

    def has_role(self, code: str) -> bool:
        return any(role.code == code for role in self.roles)
