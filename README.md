# MeerKit (미어킷)

> 더 빨리, 더 많이 시작하는 AI 서비스 스타터킷

FastAPI + PostgreSQL + React + LangChain으로 AI 서비스를 빠르게 시작하기 위한 재사용 가능한 스타터킷입니다.

**이름의 의미**: 미어캣(meerkat)과 발음이 같은 MeerKit은 네덜란드어 *meer*(더 많이)와 *kit*를 합친 이름입니다. 무리 지어 서로를 지켜 주는 미어캣처럼, 공통 기반이 팀의 서비스 개발을 받쳐 준다는 뜻을 담았습니다.
서브 서비스로 **매무새(요구사항 정리 도우미)**(고객 문서 업로드 → AI가 요구사항 분류·정제 → 관리자 확정 → 기능정의서 생성)가 들어 있습니다.

## 주요 구성

| 영역 | 기술 |
|---|---|
| 백엔드 | FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL, PyJWT, pwdlib (회원가입·로그인·역할·멤버 관리 포함) |
| AI | LangChain (모델은 `.env`에서 교체) |
| 프론트엔드 | Next.js (App Router) + React + TypeScript, Tailwind CSS, shadcn/ui, Zustand, TanStack Query, axios |
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
git clone https://github.com/SNACKCUP/meerkit-snack.git
cd meerkit-snack
```

### 2. DB 실행 (루트 폴더)

로컬 DB는 Supabase CLI로 띄웁니다. CLI 버전은 루트 `package.json`에 고정되어 있습니다.

```bash
npm install                # 처음 한 번 (Supabase CLI 설치)
npm run db:start           # 첫 실행은 이미지 다운로드로 몇 분 걸립니다
npm run db:status          # DB URL, Studio 주소 확인
```

- DB: `127.0.0.1:54322` (계정 `postgres`/`postgres`, **로컬 전용**)
- Studio(DB 관리 화면): http://127.0.0.1:54323
- 끄기: `npm run db:stop` (데이터는 유지됩니다). `npx supabase stop --no-backup`은 **데이터를 지우니** 주의하세요.
- 대체용: Supabase를 쓸 수 없으면 `docker compose up -d db`로 PostgreSQL 16을 띄우고, `backend/.env`의 `DATABASE_URL`을 `.env.example`에 주석으로 있는 대체용 주소로 바꿉니다.

### 3. 백엔드 실행 (터미널 1)

```bash
cd backend
cp .env.example .env       # OPENAI_API_KEY 등 필요한 값 채우기
uv sync
uv run alembic upgrade head
uv run python -m app.users.seed   # 로컬 테스트용 관리자 계정 (admin@example.com)
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

- 화면: http://localhost:3000 → 회원가입·로그인, `/me`(내 정보), `/admin/members`(관리자 전용 멤버 관리)
- 관리자(MASTER) 계정: `backend/.env`의 `SEED_ADMIN_USER_ID`(로그인 아이디) / `SEED_ADMIN_PASSWORD` (**로컬 전용** 값)
- 가입 이메일 인증번호·비밀번호 재설정 메일: 기본(`MAIL_BACKEND=console`)은 백엔드 터미널 로그에 출력됩니다. 메일함처럼 보려면 `docker compose up -d mailpit` 후 `MAIL_BACKEND=smtp` → http://localhost:8025
- 개발 중 `/api` 요청은 Next.js 프록시(`next.config.ts`의 rewrites)가 백엔드(8000)로 전달하므로 CORS 설정 없이 동작합니다.

## 폴더 구조

```text
meerkit/
├── backend/
│   ├── app/
│   │   ├── core/        # 공통 기반: 설정, DB, 보안(해시·JWT)
│   │   ├── users/       # 공통 기반: 회원, 역할, 멤버 관리
│   │   ├── auth/        # 공통 기반: 가입, 로그인, 토큰 갱신
│   │   ├── permissions/ # 공통 기반: 역할 코드 다시 내보내기 (권한 검사는 core/principal.py)
│   │   ├── codes/       # 공통 기반: 공통코드 (킷·서브 서비스 공용, owner 로 구분)
│   │   ├── llm/         # 공통 기반: LangChain 클라이언트, 프롬프트
│   │   └── features/    # 서브 서비스 (교체 영역)
│   │       ├── maemusae/      # 매무새 (/api/mms): 프로젝트·멤버·초대, 문서·파일(쪽 단위 본문), 접근 검사
│   │       └── requirements/  # 매무새 예전 계약 스텁 (새 API로 바뀌면 삭제)
│   ├── alembic/         # DB 마이그레이션
│   └── tests/
├── frontend/
│   └── src/
│       ├── meerkit/     # 공통 기반(킷 본체): API 클라이언트, 인증, 관리자, 초기 화면
│       ├── app/         # Next.js 라우트(폴더 = URL)
│       │   ├── (meerkit)/   # 킷 화면 연결 (/me, /admin/members)
│       │   └── (service)/   # 서비스 화면 (교체 영역)
│       └── components/ui/   # shadcn 컴포넌트
├── docs/                # 설계 문서
├── docker-compose.yml   # 로컬 PostgreSQL
├── CLAUDE.md            # AI 작업 규칙
└── .github/workflows/   # CI
```

**핵심 규칙: 공통 기반은 서비스 코드(백엔드 `features/`, 프론트 `app/(service)/`)를 import 하지 않습니다.** 그래서 서브 서비스 폴더를 지워도 스타터킷은 그대로 동작합니다.
자세한 내용은 [docs/architecture.md](docs/architecture.md)를 보세요.

## 자주 쓰는 명령

| 하고 싶은 일 | 명령 (실행 위치) |
|---|---|
| DB 켜기 / 끄기 | `npm run db:start` / `npm run db:stop` (루트) |
| DB 상태 확인 | `npm run db:status` (루트) |
| 백엔드 테스트 | `uv run pytest` (backend). `TEST_DATABASE_URL`의 `meerkit_test` DB를 쓰며, 처음 실행할 때 자동으로 만들고 마이그레이션합니다. 개발 DB는 건드리지 않습니다 |
| 백엔드 린트 | `uv run ruff check .` (backend) |
| 마이그레이션 생성 | `uv run alembic revision --autogenerate -m "설명"` (backend) |
| 마이그레이션 적용 | `uv run alembic upgrade head` (backend) |
| 프론트 린트 / 빌드 | `npm run lint` / `npm run build` (frontend) |

## 환경 변수

`.env` 파일은 커밋하지 않습니다. 필요한 항목은 각 폴더의 `.env.example`에 있습니다.

| 변수 | 위치 | 설명 |
|---|---|---|
| `DATABASE_URL` | backend | PostgreSQL 접속 주소 |
| `LOG_LEVEL`, `LOG_FORMAT` | backend | 로그 수준(기본 INFO)과 형식(`json`/`text`, 비우면 로컬 text·운영 json) |
| `TEST_DATABASE_URL` | backend | pytest 전용 DB 주소 (이름이 `_test`로 끝나야 함, 비우면 `DATABASE_URL` 사용) |
| `JWT_SECRET_KEY` | backend | JWT 서명 키, 32자 이상 (운영에서는 반드시 변경) |
| `JWT_EXPIRE_MINUTES` | backend | 액세스 토큰 유효 시간(분, 기본 30) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | backend | 리프레시 토큰(httpOnly 쿠키) 유효 기간(일, 기본 14) |
| `COOKIE_SECURE` | backend | 배포(https)에서는 `true` |
| `SEED_ADMIN_USER_ID`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME` | backend | 로컬 테스트용 관리자(MASTER) 계정 (**로컬 전용**) |
| `FRONTEND_BASE_URL` | backend | 메일 링크가 여는 프론트 주소 (비밀번호 재설정 화면) |
| `MAIL_BACKEND`, `MAIL_FROM`, `MAIL_SMTP_*` | backend | 메일 발송 방법(`console`/`smtp`)과 SMTP 설정. 업체 비밀번호·키는 `.env`에만 |
| `MAIL_COOLDOWN_SECONDS`, `MAIL_DAILY_LIMIT` | backend | 같은 이메일로 보내는 인증·재설정 메일 간격(기본 60초)과 하루 한도(기본 10) |
| `SIGNUP_EMAIL_VERIFICATION_REQUIRED` | backend | 가입·이메일 변경 때 이메일 인증 필수 여부 (기본 `true`) |
| `LOGIN_LOCK_MAX_ATTEMPTS`, `LOGIN_LOCK_MINUTES` | backend | 연속 실패 N회 → M분 로그인 잠금 (기본 5회, 5분, 0이면 끔) |
| `ACCOUNT_RETENTION_DAYS` | backend | 탈퇴 후 개인정보를 지우기까지 기간(일, 기본 365) |
| `CORS_ORIGINS` | backend | 허용할 프론트 주소, 여러 개면 쉼표로 구분 |
| `LLM_PROVIDER`, `LLM_MODEL` | backend | 사용할 LLM 공급자(`openai`, 로컬·테스트용 `fake`)와 모델 |
| `LLM_TEMPERATURE`, `LLM_TIMEOUT_SECONDS`, `LLM_MAX_RETRIES`, `LLM_OUTPUT_RETRIES`, `LLM_MAX_INPUT_CHARS` | backend | LLM 호출 설정 (`app/llm/config.py`) |
| `OPENAI_API_KEY` | backend | OpenAI 키 |
| `NEXT_PUBLIC_API_BASE_URL` | frontend | 브라우저가 호출할 API 기본 경로 (기본값 `/api`) |
| `NEXT_PUBLIC_DOCS_URL` | frontend | 초기 화면의 "사용 설명서" 링크 |
| `API_PROXY_TARGET` | frontend | `/api` 프록시가 전달할 백엔드 주소 (기본값 `http://localhost:8000`) |

### 운영 DB(호스팅 Supabase)로 옮길 때

- 백엔드 서버가 IPv4만 쓰는 환경이면 Session pooler 주소를 씁니다. Direct connection 주소는 IPv6 전용입니다.
- `DATABASE_URL` 끝에 `?sslmode=require`를 붙입니다.
- Transaction pooler(포트 6543)는 쓰지 않습니다. psycopg의 prepared statement와 맞지 않습니다.
- 백엔드가 DB에 직접 접속하므로 Data API를 끄거나, `public` 테이블에 RLS를 켭니다. 그대로 두면 anon 키로 테이블이 노출될 수 있습니다.
- 스키마는 Alembic으로만 바꿉니다. Studio에서 직접 고치거나 `supabase db push`를 쓰지 않습니다.
- DB 리전은 백엔드 서버와 같은 리전으로 고릅니다.
- 무료 플랜은 7일 동안 사용이 없으면 일시 정지되고, 일일 백업이 없습니다. 운영 데이터가 생기면 유료 플랜이나 별도 백업을 준비합니다.
- `DATABASE_URL` 등 비밀 값은 배포 플랫폼의 환경 변수나 GitHub Secrets에만 넣습니다. 저장소에 커밋하지 않습니다.

## 문서

- [아키텍처](docs/architecture.md): 공통 기반과 서브 서비스를 나누는 규칙
- [새 기능 추가하기](docs/how-to-add-feature.md): 이 킷을 Fork 해서 내 서비스를 만드는 순서
- [향후 확장](docs/future-extensions.md): 이번 범위에서 제외한 항목
- [메일 발송 설정 가이드](docs/mail-setup.md): 도메인 → Resend → DNS → `.env` 순서로 실제 메일 보내기
- [파일 저장소 설정 가이드](docs/storage-setup.md): 프로필 이미지(공개)·고객 문서 원본(비공개)용 Supabase Storage 버킷·키
- [운영 배포 가이드](docs/deployment.md): Supabase → Render → Vercel → DNS, 승인 후 배포하는 워크플로
- [테이블 명세서](docs/MeerKit_테이블명세서.xlsx): DB 테이블·컬럼·관계 (엑셀, 마이그레이션 d129bc5cc95b 기준)
- [협업 규칙](CONTRIBUTING.md): 브랜치, 커밋, PR 규칙
- [AI 작업 규칙](CLAUDE.md): Claude Code 등 AI 도구가 따르는 위치·의존·범위 규칙

## 문제 해결

| 증상 | 해결 |
|---|---|
| `command not found: docker` | Docker Desktop 설치 후 앱을 한 번 실행하고 터미널을 새로 엽니다. |
| `no configuration file provided` | `docker-compose.yml`이 있는 루트 폴더에서 실행합니다. |
| `ModuleNotFoundError: No module named 'app'` | `backend/` 폴더에서 실행합니다 (`pwd`로 확인). |
| `database_url Field required` | `backend/.env`가 있는지 확인합니다 (`ls -a`). |
| `connection refused` (DB) | 루트에서 `npm run db:status`로 DB가 켜져 있는지 확인하고, 꺼져 있으면 `npm run db:start`를 실행합니다. |
| `.env`를 고쳤는데 반영이 안 됨 | 서버를 Ctrl+C로 끄고 다시 실행합니다. |
