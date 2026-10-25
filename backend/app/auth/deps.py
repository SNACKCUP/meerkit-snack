from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.auth import service
from app.core.database import get_db
from app.users.models import User

_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    """Authorization: Bearer <액세스 토큰> 으로 로그인한 사용자를 꺼냅니다. (Spring Security 필터 역할)"""
    user = None
    if credentials is not None:
        user = service.user_from_token(db, credentials.credentials, "access")
    if user is None:
        # 표준(RFC 6750)대로 WWW-Authenticate 헤더를 함께 보냅니다. 전역 핸들러가 {"detail","code","request_id"}로 감쌉니다.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="로그인이 필요합니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
