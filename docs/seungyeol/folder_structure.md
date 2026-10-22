# MeerKit 현재 폴더 구조

> 기준: 브랜치 `feat/frontend-meerkit-structure` (2026-10-21)
> 이 문서는 **지금 저장소에 실제로 있는 것**만 적는다. 앞으로 만들 계획은 `Meerkit_structure_v3.md`를 본다.

## 1. 최상위

```text
meerkit/
├── backend/               FastAPI 백엔드
├── frontend/              Next.js 프론트엔드
├── docs/                  설계·가이드 문서
│   ├── architecture.md, how-to-add-feature.md, future-extensions.md   팀 공용
│   └── seungyeol/         승열 작업 문서 (이 문서 포함)
├── .github/workflows/     CI (backend-ci.yml, frontend-ci.yml)
├── docker-compose.yml     로컬 DB
├── CONTRIBUTING.md
└── README.md
```

## 2. 프론트엔드 (`frontend/`)

```text
frontend/
├── meerkit.config.ts      사용자가 고치는 Meerkit 설정 (theme, motion, signup 옵션)
├── components.json        shadcn 설정 (별칭, 스타일)
├── postcss.config.mjs     Tailwind v4 (@tailwindcss/postcss)
├── next.config.ts         /api → 백엔드(8000) 프록시
├── .env.example           API 주소, 설명서 URL, docs 페이지 노출 여부
├── public/
│   └── meerkit-logo.png   로고
└── src/
    ├── app/               라우트. 한 줄짜리 연결 파일만 둔다
    ├── components/ui/     shadcn 컴포넌트
    ├── lib/utils.ts       cn()
    └── meerkit/           킷 본체
```

### 2-1. `src/app/` (라우트)

| 경로                                   | URL              | 하는 일                                  |
| -------------------------------------- | ---------------- | ---------------------------------------- |
| `layout.tsx`                           | 전체             | `<MeerkitProvider>`로 감싼다             |
| `page.tsx`                             | `/`              | `<WelcomePage />` 렌더링                 |
| `globals.css`                          | 전체             | Tailwind + `tokens.css` import           |
| `(meerkit)/docs/page.tsx`, `docs/[slug]/page.tsx` | `/docs`, `/docs/<slug>` | 문서 사이트 37페이지 (`/docs/search`는 검색) (`NEXT_PUBLIC_SHOW_DOCS_PAGE`) |
| `(meerkit)/me/page.tsx`                | `/me`            | 내 정보 (로그인 필요)                    |
| `(meerkit)/admin/members/page.tsx`     | `/admin/members` | 유저 관리 (MASTER만)                     |
| `(service)/`                           | -                | 서비스 화면 자리 (지금은 비어 있음)      |

`(meerkit)`, `(service)`는 URL에 나타나지 않는 그룹 폴더다. 킷 화면으로 가는 연결과 서비스 화면을 한눈에 구분하려는 용도다.

### 2-2. `src/components/ui/` (shadcn)

`accordion`, `avatar`, `chart`, `badge`, `button`, `card`, `checkbox`, `dialog`, `dropdown-menu`, `file-dropzone`, `input`, `label`, `native-select`, `pagination`, `radio-group`, `separator`, `skeleton`, `sonner`, `table`, `tabs`

### 2-3. `src/meerkit/` (킷 본체)

```text
meerkit/
├── index.ts               공개 API (app/에서는 여기서만 import)
├── config.ts              meerkit.config.ts + 환경 변수를 합친 meerkitConfig
├── define-config.ts       meerkit.config.ts의 타입(defineMeerkitConfig)
├── types.ts               User, Role, 로그인·가입 입력 타입
├── roles.ts               역할 4종(MASTER/OWNER/VIEWER/WRITER)과 CRUD 표
├── styles/tokens.css      디자인 토큰 (쿨 그레이 기본 + 포인트 블루, 반경, 폰트)
├── providers/             MeerkitProvider (QueryClient, AuthDialog, Toaster, 세션 복원)
├── api/                   client.ts(토큰 부착, 401 단일 갱신 후 재시도), auth.ts, users.ts
├── welcome/               WelcomePage (로고 + 로그인/회원가입/사용 설명서 버튼)
├── docs/                  DocsView(셸), DocsFooter(문서 전용 푸터), nav.ts(페이지 목록), ui.tsx(문서 부품), content/(페이지 본문, 목 데이터)
├── ai/                    AiPromptInput(AI 입력 폼), ThinkingIndicator + ThinkingOrb(점 구슬, 상태 9종)
├── loading/               Loader(9종), LoadingState, LoadingOverlay, useDelayedLoading
├── auth/
│   ├── nickname.ts        닉네임 자동 생성
│   ├── session-hint.ts    "로그인한 적 있음" 표시 (불필요한 세션 복원 요청 방지)
│   ├── lockout.ts         로그인 실패 잠금 (sessionStorage에 저장)
│   ├── ResetPasswordPage.tsx  /reset-password 화면
│   ├── store.ts           Zustand: 액세스 토큰 (메모리, persist 안 함)
│   ├── dialog-store.ts    Zustand: 모달 열림, 로그인/가입 모드
│   ├── queries.ts         useMe
│   ├── mutations.ts       useLogin, useSignup, useLogout
│   ├── hooks.ts           useAuth
│   ├── MePage.tsx         내 정보 화면
│   ├── guards/            RequireAuth, RequireRole
│   └── components/        AuthDialog, LoginForm, SignupForm, TermsAgreement, ForgotPasswordForm, ResetPasswordForm,
│   │                      ProfileForm, ChangePasswordForm, UserAvatar, UserMenu(아바타 드롭다운),
│   │                      AddressField(주소 2종) + AddressSearchDialog(검색 창), EmailVerificationField(이메일 인증),
│   │                      NicknameInput(자동 생성) + NicknameForm(마이페이지), OptionalFields
└── admin/
    ├── AdminMembersPage.tsx
    ├── members-filter.ts  조건 기본값, 필터 선택지, 목 데이터용 filterMembers
    ├── queries.ts         useMembers, useUpdateRole, useRemoveMember
    └── components/        MemberDirectory(검색·필터·페이지네이션), MemberFilters, MemberTable,
    │                      RoleAssignDialog(권한 부여·변경 확인 창), RoleSelect,
    │                      MemberAiUsage(Radial) · MemberAiUsageHistory(Bar) — UI만, 사용량 집계는 추후 적용
```

| 위치                | 규칙                                                                      |
| ------------------- | ------------------------------------------------------------------------- |
| `meerkit/`          | 킷 코드. 킷을 받아 쓰는 사람은 수정하지 않는다                            |
| `app/`              | 연결 파일만. 킷 기능은 `@/meerkit`에서 가져온다                           |
| `app/(service)/`    | 서비스 화면. 킷은 이 폴더를 import하지 않는다                             |
| 상태                | 서버 데이터는 TanStack Query, 토큰과 모달 상태는 Zustand                  |
| 스타일              | Tailwind utility와 `tokens.css` 토큰만 사용. 인라인 스타일, CSS 모듈 금지 |

### 2-4. 환경 변수 (`frontend/.env.example`)

| 변수                         | 용도                                     |
| ---------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`   | 브라우저가 호출할 API 경로 (기본 `/api`) |
| `API_PROXY_TARGET`           | `/api` 프록시가 전달할 백엔드 주소       |
| `NEXT_PUBLIC_DOCS_URL`       | 웰컴 페이지 Docs 링크(새 창). 문서를 따로 배포하면 그 주소 (기본 `/docs`) |
| `NEXT_PUBLIC_GITHUB_URL`     | 문서 상단 GitHub 버튼                    |
| `NEXT_PUBLIC_DOCS_ONLY`      | 문서 사이트로 배포할 때 true (홈 → /docs, 앱 화면 404) |
| `NEXT_PUBLIC_SHOW_DOCS_PAGE` | 이 앱에서 `/docs`를 열지 (문서를 따로 배포하면 앱은 `false`) |

## 3. 백엔드 (`backend/`)

```text
backend/
├── pyproject.toml, uv.lock, .python-version, alembic.ini, .env.example
├── alembic/               마이그레이션 (env.py, script.py.mako)
├── tests/                 test_health.py
├── src/backend/           패키지 진입점
└── app/
    ├── main.py            앱 생성
    ├── core/              config.py, database.py
    ├── auth/              비어 있음 (구현 전)
    ├── llm/               비어 있음 (구현 전)
    └── features/
        └── requirements/  샘플 기능 (v3에서 examples/로 이동 예정)
```

아직 없는 것: `users/`, `permissions/`, `repository` 계층, 모델(users/roles), 인증 API. 프론트는 이 API가 `/auth/*`, `/users/*` 경로로 생기는 것을 가정하고 만들어져 있다.

## 4. 아직 없는 것 (v3 계획 대비)

| 계획                               | 상태    |
| ---------------------------------- | ------- |
| `examples/` (샘플 서비스 분리)     | 미착수  |
| `scripts/setup/`, `packages/` CLI  | 미착수  |
| `CLAUDE.md`, 설명서 사이트         | 미착수  |
| 백엔드 auth/users/permissions      | 미착수  |
| 프론트 `README`·`docs/*.md` 갱신   | 미착수  |
