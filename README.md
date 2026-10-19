# AI Starter Kit

FastAPI + PostgreSQL + React + LangChain으로 AI 서비스를 빠르게 시작하기 위한 재사용 가능한 스타터킷입니다.
샘플 서비스로 **요구사항 정리 도우미**(고객 문서 업로드 → AI가 요구사항 분류·정제 → 관리자 확정 → 기능정의서 생성)가 들어 있습니다.

## 주요 구성

| 영역 | 기술 |
|---|---|
| 백엔드 | FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL, PyJWT, pwdlib |
| AI | LangChain (모델은 `.env`에서 교체) |
| 프론트엔드 | React + TypeScript (Vite), React Router, TanStack Query, axios |
| 개발 환경 | uv (Python 패키지), npm, Docker Compose (DB) |
| CI | GitHub Actions (백엔드/프론트 각각) |

## 빠른 시작

### 사전 준비

- Git
- [uv](https://docs.astral.sh/uv/) (Python 3.12는 uv가 설치해 줍니다)
- Node.js 20 이상
- Docker Desktop

### 1. 클론

```bash
git clone https://github.com/sensibly00-glitch/ai-starter-kit.git
cd ai-starter-kit
```

### 2. DB 실행 (루트 폴더)

```bash
docker compose up -d db
docker compose ps          # db 가 Up 이면 성공
```

### 3. 백엔드 실행 (터미널 1)

```bash
cd backend
cp .env.example .env       # OPENAI_API_KEY 등 필요한 값 채우기
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000
```

- 상태 확인: http://localhost:8000/health → `{"status":"ok"}`
- API 문서: http://localhost:8000/docs

### 4. 프론트엔드 실행 (터미널 2)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

- 화면: http://localhost:5173
- 개발 중 `/api` 요청은 Vite 프록시가 백엔드(8000)로 전달하므로 CORS 설정 없이 동작합니다.

## 폴더 구조

```text
ai-starter-kit/
├── backend/
│   ├── app/
│   │   ├── core/        # 공통 기반: 설정, DB, 예외, 로깅, 보안
│   │   ├── auth/        # 공통 기반: 회원, 로그인, JWT
│   │   ├── llm/         # 공통 기반: LangChain 클라이언트, 프롬프트
│   │   └── features/    # 샘플 서비스 (교체 영역)
│   │       └── requirements/
│   ├── alembic/         # DB 마이그레이션
│   └── tests/
├── frontend/
│   └── src/
│       ├── app/         # 라우터, Provider 조립
│       ├── shared/      # 공통 기반: API 클라이언트, 인증, 공통 컴포넌트
│       ├── pages/       # 로그인 등 공통 페이지
│       └── features/    # 샘플 서비스 화면 (교체 영역)
├── docs/                # 설계 문서
├── docker-compose.yml   # 로컬 PostgreSQL
└── .github/workflows/   # CI
```

**핵심 규칙: 공통 기반은 `features/`를 import 하지 않습니다.** 그래서 샘플 서비스 폴더를 지워도 스타터킷은 그대로 동작합니다.
자세한 내용은 [docs/architecture.md](docs/architecture.md)를 보세요.

## 자주 쓰는 명령

| 하고 싶은 일 | 명령 (실행 위치) |
|---|---|
| DB 켜기 / 끄기 | `docker compose up -d db` / `docker compose stop` (루트) |
| 백엔드 테스트 | `uv run pytest` (backend) |
| 백엔드 린트 | `uv run ruff check .` (backend) |
| 마이그레이션 생성 | `uv run alembic revision --autogenerate -m "설명"` (backend) |
| 마이그레이션 적용 | `uv run alembic upgrade head` (backend) |
| 프론트 린트 / 빌드 | `npm run lint` / `npm run build` (frontend) |

## 환경 변수

`.env` 파일은 커밋하지 않습니다. 필요한 항목은 각 폴더의 `.env.example`에 있습니다.

| 변수 | 위치 | 설명 |
|---|---|---|
| `DATABASE_URL` | backend | PostgreSQL 접속 주소 |
| `JWT_SECRET_KEY` | backend | JWT 서명 키 (운영에서는 반드시 변경) |
| `JWT_EXPIRE_MINUTES` | backend | 토큰 만료 시간(분) |
| `CORS_ORIGINS` | backend | 허용할 프론트 주소, 여러 개면 쉼표로 구분 |
| `LLM_PROVIDER`, `LLM_MODEL` | backend | 사용할 LLM 공급자와 모델 |
| `OPENAI_API_KEY` | backend | OpenAI 키 |
| `VITE_API_BASE_URL` | frontend | API 기본 경로 (개발 기본값 `/api`) |

## 문서

- [아키텍처](docs/architecture.md): 공통 기반과 샘플 서비스를 나누는 규칙
- [새 기능 추가하기](docs/how-to-add-feature.md): 이 킷을 Fork 해서 내 서비스를 만드는 순서
- [향후 확장](docs/future-extensions.md): 이번 범위에서 제외한 항목
- [협업 규칙](CONTRIBUTING.md): 브랜치, 커밋, PR 규칙

## 문제 해결

| 증상 | 해결 |
|---|---|
| `command not found: docker` | Docker Desktop 설치 후 앱을 한 번 실행하고 터미널을 새로 엽니다. |
| `no configuration file provided` | `docker-compose.yml`이 있는 루트 폴더에서 실행합니다. |
| `ModuleNotFoundError: No module named 'app'` | `backend/` 폴더에서 실행합니다 (`pwd`로 확인). |
| `database_url Field required` | `backend/.env`가 있는지 확인합니다 (`ls -a`). |
| `connection refused` (DB) | `docker compose ps`로 DB가 켜져 있는지 확인합니다. |
| `.env`를 고쳤는데 반영이 안 됨 | 서버를 Ctrl+C로 끄고 다시 실행합니다. |
