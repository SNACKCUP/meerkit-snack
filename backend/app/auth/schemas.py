from datetime import date
from typing import Annotated

from pydantic import BaseModel, EmailStr, Field, StringConstraints

# 로그인 아이디: 영문 소문자·숫자·밑줄 4~30자 (대문자로 보내도 소문자로 바꿔 저장)
LoginId = Annotated[
    str,
    StringConstraints(strip_whitespace=True, to_lower=True, pattern=r"^[A-Za-z0-9_]{4,30}$"),
]
Password = Annotated[str, Field(min_length=8, max_length=128)]


class ProfileFields(BaseModel):
    """가입·내 정보 수정에서 선택적으로 받는 항목 (프론트 signup.optionalFields)"""

    nickname: str | None = Field(default=None, min_length=1, max_length=30)
    phone: str | None = Field(default=None, max_length=20)
    postcode: str | None = Field(default=None, max_length=10)
    address: str | None = Field(default=None, max_length=255)
    address_detail: str | None = Field(default=None, max_length=255)
    birth_date: date | None = None
    gender: str | None = Field(default=None, max_length=10)


class SignupRequest(ProfileFields):
    user_id: LoginId
    email: EmailStr
    password: Password
    name: str = Field(min_length=1, max_length=50)


class LoginRequest(BaseModel):
    user_id: str  # 로그인은 형식 검사 없이 DB와 비교만 합니다
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
