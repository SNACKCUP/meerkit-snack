from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(min_length=1, max_length=50)


class LoginRequest(BaseModel):
    email: str  # 로그인은 형식 검사 없이 DB와 비교만 합니다
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
