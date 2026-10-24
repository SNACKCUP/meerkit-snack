# DB 마이그레이션 작업 순서 (Alembic)

> 대상: `backend/` (PostgreSQL 17, SQLAlchemy, Alembic). 로컬 DB는 Supabase CLI로 띄운다: 루트에서 `npm run db:start` (계정 `postgres`, 포트 `54322`). `docker compose up -d db`(PostgreSQL 16, 계정 `starter`)는 대체용이다.

## 스키마를 바꿀 때

1. `models.py`를 수정한다.
2. 새 모델 파일이면 `backend/alembic/env.py`에 `import app.<모듈>.models  # noqa: F401`을 추가한다. 빠지면 autogenerate가 그 테이블을 인식하지 못한다.
3. `uv run alembic revision --autogenerate -m "설명"`
4. `uv run ruff check --fix .`로 생성 파일의 형식을 맞춘다.
5. 생성된 파일을 읽고 확인한다. 초기 데이터(예: 역할 값)가 필요하면 `op.bulk_insert`로 넣는다. autogenerate는 데이터를 만들지 않는다.
6. `uv run alembic upgrade head` → `uv run pytest`
7. 마이그레이션 파일을 모델 변경과 같이 커밋한다.

## 규칙

- Never: 이미 `main`에 머지된 마이그레이션 파일을 고치지 않는다. 새 리비전을 추가한다. (이유: 팀원의 DB는 이미 그 버전에 있다)
- Always: 리비전이 두 갈래(`alembic heads`가 둘 이상)가 되면 `uv run alembic merge heads -m "merge"`로 합친다. 브랜치를 병합할 때 자주 생긴다.
- CI(`.github/workflows/backend-ci.yml`)는 `ruff check`, `alembic upgrade head`, `pytest`를 PostgreSQL 위에서 돌린다. 마이그레이션이 깨지면 CI가 실패한다.

## 롤백과 무중단 (운영 데이터가 생긴 뒤)

- 롤백은 `uv run alembic downgrade -1`. 적용 전에 `downgrade()`가 실제로 되돌려지는지 확인한다.
- 컬럼 추가는 NULL 허용으로 먼저 → 값 채우기 → `NOT NULL` 순서로 나눠 배포한다.
- 컬럼·테이블 삭제는 코드가 더 이상 쓰지 않는 것을 배포한 다음 릴리스에서 한다.
- 큰 테이블의 인덱스는 `CREATE INDEX CONCURRENTLY`를 쓰고(트랜잭션 밖에서 실행), 적용 전에 백업을 받는다.
