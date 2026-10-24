from pathlib import Path

import pytest
from alembic.config import Config
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url

from alembic import command
from app.core.config import settings

# 테스트는 실제 PostgreSQL(테스트용 DB)에서 돌고, 테스트마다 트랜잭션을 롤백해 흔적을 남기지 않습니다.
# TEST_DATABASE_URL이 있으면 그 DB를 씁니다. app.core.database가 엔진을 만들기 전에 바꿔야 해서 맨 위에 둡니다.
if settings.test_database_url:
    settings.database_url = settings.test_database_url

# 개발·운영 DB에서 테스트가 돌지 않도록 이름이 _test로 끝나는 DB만 허용합니다.
_test_url = make_url(settings.database_url)
if not (_test_url.database or "").endswith("_test"):
    pytest.exit(
        f"테스트 DB 이름은 _test로 끝나야 합니다 (현재: {_test_url.database}). "
        "backend/.env의 TEST_DATABASE_URL을 확인하세요.",
        returncode=2,
    )


# 테스트 DB가 없으면 만들고, 마이그레이션을 최신으로 맞춥니다.
def _prepare_test_db() -> None:
    admin_engine = create_engine(_test_url.set(database="postgres"), isolation_level="AUTOCOMMIT")
    with admin_engine.connect() as conn:
        exists = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :name"), {"name": _test_url.database}
        ).scalar()
        if not exists:
            conn.execute(text(f'CREATE DATABASE "{_test_url.database}"'))
    admin_engine.dispose()

    # alembic/env.py가 settings.database_url을 읽으므로 위에서 바꾼 주소로 적용됩니다.
    command.upgrade(Config(str(Path(__file__).resolve().parents[1] / "alembic.ini")), "head")


_prepare_test_db()

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.database import engine, get_db
from app.main import app
from app.permissions import roles
from app.users import service as user_service


@pytest.fixture
def db():
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture
def client(db):
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


PASSWORD = "password123"


@pytest.fixture
def make_user(db):
    def _make(email: str, *, admin: bool = False, password: str = PASSWORD):
        codes = [roles.USER, roles.ADMIN] if admin else [roles.USER]
        return user_service.create_user(db, email=email, password=password, name="테스트", roles=codes)

    return _make


@pytest.fixture
def login(client):
    def _login(email: str, password: str = PASSWORD) -> dict[str, str]:
        response = client.post("/api/auth/login", json={"email": email, "password": password})
        assert response.status_code == 200, response.text
        return {"Authorization": f"Bearer {response.json()['access_token']}"}

    return _login
