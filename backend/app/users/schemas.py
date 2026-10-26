from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

OPTIONAL_PROFILE_FIELDS = (
    "nickname",
    "phone",
    "postcode",
    "address",
    "address_detail",
    "birth_date",
    "gender",
)


def blank_to_none(value):
    """프론트는 비운 칸을 ""로 보냅니다. 선택 항목의 ""(공백만 있는 값 포함)는 "지움"(NULL)으로 받습니다."""
    if isinstance(value, str) and not value.strip():
        return None
    return value


class RoleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str = Field(validation_alias="code", examples=["VIEWER"])  # 역할 코드 (MASTER 등)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str = Field(validation_alias="login_id", examples=["writer01"])
    email: str
    name: str
    nickname: str | None = None
    phone: str | None = None
    postcode: str | None = None
    address: str | None = None
    address_detail: str | None = None
    birth_date: date | None = None
    gender: str | None = None
    avatar_url: str | None = None
    email_verified: bool
    roles: list[RoleRead]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    locked_until: datetime | None = None  # 로그인 잠금이 풀리는 시각 (연속 실패로 잠겼을 때)
    deactivated_at: datetime | None = None  # 탈퇴(또는 관리자 삭제) 시각
    deleted_at: datetime | None = None  # 보관 기간이 지나 개인정보를 지운 시각


class RolesUpdate(BaseModel):
    roles: list[str] = Field(min_length=1, examples=[["VIEWER", "WRITER"]])


class ActiveUpdate(BaseModel):
    is_active: bool


class UserPage(BaseModel):
    items: list[UserRead]
    total: int
    page: int
    size: int


MemberStatus = Literal["active", "inactive", "deleted"]


class ProfileUpdate(BaseModel):
    """내 정보 수정. 보낸 항목만 바꿉니다. 선택 항목은 null 로 보내면 지워집니다."""

    name: str | None = Field(default=None, min_length=1, max_length=50)
    email: EmailStr | None = None
    # 이메일을 바꿀 때: 새 이메일로 /auth/email/send-code → verify-code 를 거쳐 받은 증표
    email_verification_token: str | None = None
    nickname: str | None = Field(default=None, min_length=1, max_length=30)
    phone: str | None = Field(default=None, max_length=20)
    postcode: str | None = Field(default=None, max_length=10)
    address: str | None = Field(default=None, max_length=255)
    address_detail: str | None = Field(default=None, max_length=255)
    birth_date: date | None = None
    gender: str | None = Field(default=None, max_length=10)

    _blank_to_none = field_validator(*OPTIONAL_PROFILE_FIELDS, mode="before")(blank_to_none)


class WithdrawRequest(BaseModel):
    password: str  # 본인 확인
