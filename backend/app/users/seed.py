"""로컬 테스트용 관리자(MASTER) 계정 만들기. 여러 번 실행해도 안전합니다.

    uv run python -m app.users.seed

.env 의 SEED_ADMIN_USER_ID, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD 를 사용합니다 (로컬 전용 값).
"""

import sys
from datetime import UTC, datetime

from app.core.config import settings
from app.core.database import SessionLocal
from app.users import repository, roles, service


def main() -> int:
    if not settings.seed_admin_password:
        print("SEED_ADMIN_PASSWORD 가 비어 있습니다. backend/.env 에 로컬용 비밀번호를 넣어 주세요.")
        return 1
    with SessionLocal() as db:
        if repository.get_by_login_id(db, settings.seed_admin_user_id) or repository.get_by_email(
            db, settings.seed_admin_email
        ):
            print(f"이미 있습니다: {settings.seed_admin_user_id} (건너뜀)")
            return 0
        user = service.create_user(
            db,
            login_id=settings.seed_admin_user_id,
            email=settings.seed_admin_email,
            password=settings.seed_admin_password,
            name=settings.seed_admin_name,
            roles=[roles.MASTER],  # 관리자 역할 (permissions.roles.ADMIN_ROLE 과 같은 값)
        )
        user.email_verified_at = datetime.now(UTC)
        db.commit()
    print(f"관리자 계정을 만들었습니다: {settings.seed_admin_user_id}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
