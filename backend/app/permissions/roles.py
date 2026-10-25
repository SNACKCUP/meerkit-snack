# 역할 코드. roles 테이블의 code 값과 같습니다 (초기 데이터는 마이그레이션에서 넣음).
# 역할별 세부 권한은 아직 정하지 않았습니다. 지금은 이름만 있고, 관리자 검사만 ADMIN_ROLE로 합니다.
MASTER = "MASTER"
OWNER = "OWNER"
VIEWER = "VIEWER"
WRITER = "WRITER"

ALL = (MASTER, OWNER, VIEWER, WRITER)

ADMIN_ROLE = MASTER  # 관리자 API(멤버 관리)를 쓸 수 있는 역할
DEFAULT_ROLE = VIEWER  # 가입하면 받는 역할
