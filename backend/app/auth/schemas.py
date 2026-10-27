import re
from datetime import date
from typing import Annotated

from pydantic import (
    AfterValidator,
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    StringConstraints,
    field_validator,
)

from app.users.schemas import OPTIONAL_PROFILE_FIELDS, blank_to_none

# 로그인 아이디 규칙. 프론트 SignupForm.tsx의 userIdProblem과 같은 규칙·문구입니다.
LOGIN_ID_LENGTH = "아이디는 4~30자로 입력해 주세요."
LOGIN_ID_CHARS = "아이디는 영문·숫자·밑줄(_)만 쓸 수 있습니다."
LOGIN_ID_START = "아이디는 영문으로 시작해야 해요. (영문, 영문+숫자, 영문+밑줄, 영문+숫자+밑줄 가능)"


def check_login_id(value: str) -> str:
    """영문·숫자·밑줄 4~30자, 첫 글자는 영문. 어긋난 이유를 메시지로 알려 주고, 소문자로 바꿔 돌려줍니다."""
    if not 4 <= len(value) <= 30:
        raise ValueError(LOGIN_ID_LENGTH)
    if not re.fullmatch(r"[a-z0-9_]+", value):
        raise ValueError(LOGIN_ID_CHARS)
    if not value[0].isascii() or not value[0].isalpha():
        raise ValueError(LOGIN_ID_START)
    return value


# 가입·중복 확인에서 쓰는 아이디 (대문자로 보내도 소문자로 바꿔 저장). 로그인은 이 검사를 하지 않습니다.
LoginId = Annotated[
    str,
    StringConstraints(strip_whitespace=True, to_lower=True),
    AfterValidator(check_login_id),
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

    _blank_to_none = field_validator(*OPTIONAL_PROFILE_FIELDS, mode="before")(blank_to_none)


class SignupRequest(ProfileFields):
    user_id: LoginId
    email: EmailStr
    password: Password
    name: str = Field(min_length=1, max_length=50)
    agreed_terms: list[str] = Field(default_factory=list, examples=[["terms", "privacy"]])
    # /auth/email/verify-code 가 돌려준 증표. 이메일 인증을 켠 경우(기본) 필수
    email_verification_token: str | None = None


class LoginRequest(BaseModel):
    user_id: str  # 로그인은 형식 검사 없이 DB와 비교만 합니다
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginIdCheck(BaseModel):
    available: bool


class EmailCodeRequest(BaseModel):
    email: EmailStr


class VerifyEmailCodeRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=1, max_length=10)


class VerifyEmailCodeResponse(BaseModel):
    token: str


class TermRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(validation_alias="code", examples=["terms"])  # 프론트 terms[].id
    version: int
    title: str
    required: bool = Field(validation_alias="is_required")


class ForgotPasswordRequest(BaseModel):
    email: str = Field(max_length=255)  # 형식이 틀려도 같은 응답을 주려고 검사하지 않습니다


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=1, max_length=200)
    password: Password


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: Password
