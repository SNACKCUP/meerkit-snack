from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


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
    deactivated_at: datetime | None = None  # 탈퇴(또는 관리자 삭제) 시각
    deleted_at: datetime | None = None  # 보관 기간이 지나 개인정보를 지운 시각


class RolesUpdate(BaseModel):
    roles: list[str] = Field(min_length=1, examples=[["VIEWER", "WRITER"]])


class ActiveUpdate(BaseModel):
    is_active: bool
