import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.database import engine, get_db
from app.main import app
from app.permissions import roles
from app.users import service as user_service

# 테스트는 실제 PostgreSQL(테스트용 DB)에서 돌고, 테스트마다 트랜잭션을 롤백해 흔적을 남기지 않습니다.
# 먼저 `uv run alembic upgrade head` 로 테이블과 기본 역할이 만들어져 있어야 합니다.


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
