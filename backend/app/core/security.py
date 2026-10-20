"""비밀번호 해시와 JWT 발급·검증. 기능 코드는 이 모듈만 통해서 토큰을 다룹니다."""

from datetime import UTC, datetime, timedelta
from typing import Literal

import jwt
from pwdlib import PasswordHash

from app.core.config import settings

ALGORITHM = "HS256"
TokenType = Literal["access", "refresh"]

_password_hash = PasswordHash.recommended()  # argon2


def hash_password(password: str) -> str:
    return _password_hash.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return _password_hash.verify(password, hashed)


def create_token(user_id: int, token_type: TokenType) -> str:
    if token_type == "access":
        expires = timedelta(minutes=settings.jwt_expire_minutes)
    else:
        expires = timedelta(days=settings.refresh_token_expire_days)
    payload = {
        "sub": str(user_id),
        "type": token_type,
        "exp": datetime.now(UTC) + expires,
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=ALGORITHM)


def decode_token(token: str, token_type: TokenType) -> int | None:
    """토큰이 유효하고 종류가 맞으면 사용자 id, 아니면 None."""
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None
    if payload.get("type") != token_type:
        return None
    try:
        return int(payload["sub"])
    except (KeyError, ValueError):
        return None
