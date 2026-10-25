# 권한 검사에 쓰는 역할 기준. 역할 코드 자체는 users/roles.py 에 있고, 여기서는 다시 내보내기만 합니다
# (예전 import 경로 `from app.permissions import roles` 호환).
from app.users.roles import ALL, DEFAULT_ROLE, MASTER, OWNER, VIEWER, WRITER

ADMIN_ROLE = MASTER  # 관리자 API(멤버 관리)를 쓸 수 있는 역할. 관리자 검사는 이 값 하나로만 합니다.

__all__ = ["ADMIN_ROLE", "ALL", "DEFAULT_ROLE", "MASTER", "OWNER", "VIEWER", "WRITER"]
