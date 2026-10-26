# MeerKit 구조 설계 v3

> 상태: 제안 (팀 검수 전)
> 작성일: 2026-10-20
> 기준: 2026-10-20 main (PR #1~#4 머지 상태) + 소영님의 "수정 범위 정리" 반영
> v2에서 바뀐 것: 명령 `npx meerkit setup` 확정, 서브 프로젝트 `examples/` 분리, UI 모음 페이지(`/ui`) 추가, 현재 저장소 상태 반영, 진행 순서(PR A/B/C) 추가
> 범위: 회원가입·로그인 UI, 관리자 멤버 관리·역할 부여 테스트, 생성/세팅 흐름
> 제외: 사용량 관리 (향후 확장으로만 기록)

---

## 1. 확정된 결정

| 항목               | 결정                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| 프로젝트 생성 명령 | `npx create-meerkit <이름>` (폴더 구조 생성)                           |
| 세팅 명령          | `npx meerkit setup` (docker, frontend, backend 세팅과 서버 실행)       |
| 프론트 스택        | Next.js (App Router) + shadcn/ui + Tailwind + Zustand + TanStack Query |
| 서브 프로젝트        | 별도 `examples/`로 분리. 킷은 샘플을 모른다                            |
| 사용량             | 이번 범위에서 제외 (문서에는 "향후 확장"으로 표기)                     |
| 사용 설명서        | GitHub README에 퀵스타트만. 내용이 많아지면 docs 페이지를 따로 만든다  |
| 브랜딩             | 로고 있음. 문구, 주색은 미정                                           |
| 오늘 우선순위      | 회원가입·로그인 UI                                                     |

## 2. 아직 정해야 할 것

| #   | 항목                                         | 제안                                                               | 비고                                                                                                                    |
| --- | -------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | 토큰 저장 방식                               | 액세스 토큰은 메모리, 리프레시 토큰은 httpOnly 쿠키                | `/api` 프록시로 같은 도메인이라 쿠키 방식이 잘 맞음. **백엔드와 프론트 모두 이 결정에 기대고 있어 가장 먼저 정해야 함** |
| 2   | 시드 관리자 계정                             | setup(또는 마이그레이션)에서 `.env` 값으로 생성                    | 로컬 테스트 전용 표시. 첫 가입자를 관리자로 만드는 방식은 비추천                                                        |
| 3   | 템플릿 전달 방식                             | 개발 중 GitHub 내려받기, 제출 직전 버전 고정                       | npm 패키지에 템플릿을 같이 넣는 방식도 가능                                                                             |
| 4   | `usePermission` / 권한 테이블                | 이번에는 역할(role) 기반만, 권한(permission) 테이블은 향후 확장    | 소영님이 permissions, role_permissions를 향후 확장으로 미룸. 넣는다면 `me` 응답에 permissions 배열 필요                 |
| 5   | 서브 프로젝트의 정확한 위치                    | `examples/<이름>/{backend,frontend}`                               | 아래 4-3 참고                                                                                                           |
| 6   | 주색과 문구                                  | 미어캣 느낌의 모래색 계열 후보를 따로 제안                         | 로고는 이미 있음                                                                                                        |
| 7   | 프론트 `(service)` vs 백엔드 `features` 이름 | `examples/`로 분리하면 백엔드 `features/`가 사라져 자연스럽게 해소 | 남기게 되면 문서에 한 줄 설명                                                                                           |

---

## 3. 이해한 흐름

```text
1) npx create-meerkit my-app     폴더 구조만 생성 (설치·실행 없음)
2) cd my-app
3) npx meerkit setup             docker(DB) + frontend + backend 세팅, 서버 실행
4) 성공하면 로컬 DB · backend · frontend 서버가 켜진다
5) 브라우저에서 frontend 접속     Next 기본 화면이 아닌 MeerKit 초기 화면
6) 가입·로그인·관리자 기능을 직접 테스트, /ui에서 컴포넌트 확인
7) 커스터마이징은 사용 설명서를 보고 진행
```

초기 화면에는 로그인 버튼, 회원가입 버튼, 사용 설명서 링크가 있다. 로그인과 가입은 모달로 열리고 로컬 DB에 실제로 저장된다. 폼 스타일은 Tailwind utility로 MeerKit 스타일을 미리 세팅한다.

주의: `npx meerkit setup`은 프로젝트에 설치되기 전에도 실행되므로 `meerkit`이라는 이름의 npm 패키지가 필요하다. 이름이 비어 있는 동안 선점해야 한다. `create-meerkit`도 마찬가지다.

---

## 4. 저장소 구조

### 4-1. 우리가 관리하는 저장소 (Fork 템플릿)

```text
meerkit/
├── backend/                    킷 백엔드
├── frontend/                   킷 프론트
├── examples/                   서브 프로젝트 (킷은 import하지 않음)
├── docker-compose.yml          로컬 DB
├── scripts/setup/              setup 로직 (CLI가 호출)
├── .github/workflows/          CI/CD
├── docs/                       설계서, 아키텍처, 기능 추가 가이드
├── CLAUDE.md                   AI 작업 규칙 (Claude Code가 자동으로 읽음)
├── CONTRIBUTING.md
├── README.md                   퀵스타트
│
├── packages/
│   ├── create-meerkit/         npx create-meerkit (생성물에서 제외)
│   └── meerkit/                npx meerkit setup CLI (생성물에서 제외)
└── docs-site/                  설명서 사이트 (생성물에서 제외, 향후)
```

### 4-2. 생성되는 프로젝트

`packages/`와 `docs-site/`를 제외한 나머지가 `my-app/`으로 복사된다.

```text
my-app/
├── backend/  frontend/  examples/
├── docker-compose.yml  scripts/setup/
├── .github/workflows/  docs/  CLAUDE.md  README.md
```

### 4-3. examples/ 구조 (제안)

```text
examples/
└── requirements/               기존 features/requirements를 이동
    ├── README.md               킷에 연결하는 방법 (api.py, alembic/env.py, 라우트)
    ├── backend/                router, service, repository, schemas, models
    └── frontend/               화면 컴포넌트 (app/(service)/에 복사해 쓰는 용도)
```

- 킷 코드는 `examples/`를 import하지 않는다. 연결은 문서에 적힌 세 곳(`api.py`, `alembic/env.py`, 라우트)에서만 한다.
- 영향 범위: 백엔드 `features/requirements`, 테스트 경로, `test_import_rules.py`, `how-to-add-feature.md`.
- 열린 질문: 샘플을 "복사해서 쓰는 폴더"로 둘지, 실제로 앱에 연결된 상태로 둘지. 후자라면 import 규칙 예외를 문서에 명시해야 한다.

---

## 5. 백엔드 구조

> 지금 `backend/app/auth/`는 비어 있고, 오늘 `users`, `roles`, `user_roles` 모델이 만들어진 상태다. 아래는 그 위에 얹는 구조다.

```text
backend/
├── pyproject.toml / uv.lock / alembic.ini / .env.example
├── alembic/{env.py, versions/}
├── scripts/seed_admin.py
├── tests/{core, auth, users, test_import_rules.py}
└── app/
    ├── main.py                 create_app()
    ├── api.py                  라우터 등록
    ├── core/                   config, database, security, deps, exceptions, logging
    ├── auth/                   router, service, repository, schemas, models
    ├── users/                  router, service, repository, schemas   (신규, 관리자용)
    ├── permissions/            roles.py, deps.py(require_role)         (신규)
    └── llm/                    client.py, prompts.py                   (LangChain, 사용량 기록과 무관)
```

| 폴더           | 역할                                                                |
| -------------- | ------------------------------------------------------------------- |
| `core/`        | 설정, DB 연결, 비밀번호 해싱, JWT, 공통 예외·로깅. 모든 모듈이 공유 |
| `auth/`        | 가입, 로그인, 로그아웃, 토큰 갱신, 내 정보                          |
| `users/`       | 관리자용 멤버 목록, 역할 변경, 활성/비활성                          |
| `permissions/` | 역할 정의(기본 admin, user)와 `require_role`                        |
| `llm/`         | LangChain 호출 모듈 (공지 필수)                                     |

- 계층은 `router → service → repository` 3계층이다. 현재는 2계층이라 repository 추가가 필요하다.
- `test_import_rules.py`의 `KIT_PACKAGES`에 `users`, `permissions`를 추가한다.
- `features/` 폴더는 `examples/`로 대체되어 사라진다.

### API

| 메서드 | 경로                       | 설명                                 | 권한          |
| ------ | -------------------------- | ------------------------------------ | ------------- |
| POST   | `/auth/signup`             | 회원가입                             | 없음          |
| POST   | `/auth/login`              | 로그인 (액세스 토큰 + 리프레시 쿠키) | 없음          |
| POST   | `/auth/refresh`            | 토큰 갱신                            | 리프레시 쿠키 |
| POST   | `/auth/logout`             | 로그아웃 (리프레시 폐기)             | 로그인        |
| GET    | `/auth/me`                 | 내 정보 (역할 포함)                  | 로그인        |
| GET    | `/admin/users`             | 멤버 목록                            | admin         |
| PATCH  | `/admin/users/{id}/role`   | 역할 변경                            | admin         |
| PATCH  | `/admin/users/{id}/active` | 활성/비활성                          | admin         |
| GET    | `/health`                  | 상태 확인                            | 없음          |

### DB (usage 제외)

| 테이블           | 비고                                               |
| ---------------- | -------------------------------------------------- |
| `users`          | 소영님이 만든 모델 기준. 컬럼은 해당 모델을 따른다 |
| `roles`          | 기본 admin, user                                   |
| `user_roles`     | 사용자-역할 연결                                   |
| `refresh_tokens` | token_hash, expires_at, revoked_at (신규)          |

`permissions`, `role_permissions`는 향후 확장.

---

## 6. 프론트엔드 구조

```text
frontend/
├── components.json              shadcn 설정
├── next.config.ts               /api → backend 프록시 (API_PROXY_TARGET 사용)
├── postcss.config.mjs
├── .env.example                 NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_DOCS_URL, API_PROXY_TARGET
├── public/                      로고
└── src/
    ├── meerkit/                 킷 본체
    │   ├── index.ts             공개 API
    │   ├── config.ts            API 주소, 설명서 URL, 라우트 경로
    │   ├── types.ts             User, Role
    │   ├── api/                 client.ts(토큰 부착, 401 단일 갱신 후 재시도), auth.ts, users.ts
    │   ├── providers/           MeerkitProvider.tsx (QueryClientProvider + AuthProvider)
    │   ├── styles/              tokens.css (색상, 반경, 폰트 토큰)
    │   ├── welcome/             WelcomePage.tsx (초기 화면)
    │   ├── showcase/            UiShowcase.tsx (UI 모음 페이지 본체)
    │   ├── auth/
    │   │   ├── store.ts         Zustand: 액세스 토큰, 인증 상태
    │   │   ├── dialog-store.ts  Zustand: 모달 열림, 로그인/가입 모드
    │   │   ├── queries.ts       useMe
    │   │   ├── mutations.ts     useLogin, useSignup, useLogout
    │   │   ├── hooks.ts         useAuth (usePermission은 향후)
    │   │   ├── guards/          RequireAuth, RequireRole
    │   │   └── components/      AuthDialog, LoginForm, SignupForm, UserMenu
    │   └── admin/
    │       ├── queries.ts       useMembers, useUpdateRole, useUpdateActive
    │       └── components/      MemberTable, RoleSelect
    ├── app/                     라우트 (사용자의 영역)
    │   ├── layout.tsx           <MeerkitProvider>로 감싸기
    │   ├── globals.css          Tailwind + tokens.css import
    │   ├── page.tsx             <WelcomePage />만 렌더링
    │   ├── (meerkit)/           킷 화면 연결 파일 (URL에는 안 나타남)
    │   │   ├── me/page.tsx              /me
    │   │   ├── admin/members/page.tsx   /admin/members
    │   │   └── ui/page.tsx              /ui
    │   └── (service)/           사용자 서비스 화면
    ├── components/ui/           shadcn 컴포넌트
    └── lib/utils.ts             cn()
```

### 현재 코드에서 바뀌는 것

| 지금                                  | 바뀌는 곳                                                     |
| ------------------------------------- | ------------------------------------------------------------- |
| `shared/api/client.ts`                | `meerkit/api/client.ts` (토큰 부착, 401 갱신 추가)            |
| `app/providers.tsx`                   | `meerkit/providers/MeerkitProvider.tsx`                       |
| `shared/{auth,components,hooks,lib}/` | 삭제 (`meerkit/auth`, `components/ui`, `lib/utils.ts`로 분리) |
| `src/features/`                       | 삭제 → `app/(service)/`                                       |
| `app/layout.tsx`                      | `<MeerkitProvider>`로 감싸기                                  |
| `app/page.tsx`                        | `<WelcomePage />`                                             |
| `app/globals.css`                     | Tailwind + tokens.css import                                  |

추가 패키지: tailwindcss, @tailwindcss/postcss, zustand, shadcn 의존성(class-variance-authority, clsx, tailwind-merge, lucide-react, sonner 등).

### 폴더 설명

| 위치                        | 역할                                                                                      |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| `meerkit/`                  | 킷 본체. **킷을 받아 쓰는 사람은 수정하지 않는다.** 킷 개발자(우리 팀)는 수정한다         |
| `meerkit/welcome/`          | 초기 화면. `app/page.tsx`가 렌더링만 하므로 사용자는 `page.tsx`만 바꾸면 자기 화면이 된다 |
| `meerkit/showcase/`         | UI 모음 페이지. 아래 7장                                                                  |
| `meerkit/auth/`             | 상태(Zustand), 서버 상태(TanStack Query), 폼, 가드                                        |
| `meerkit/admin/`            | 멤버 목록과 역할 부여                                                                     |
| `meerkit/styles/tokens.css` | 색상, 반경, 폰트 토큰. Tailwind `@theme`에 연결                                           |
| `app/(meerkit)/`            | 킷 화면으로 가는 얇은 연결. 지워도 되는 구역이 한눈에 보인다                              |
| `app/(service)/`            | 서비스 화면 자리                                                                          |

### 상태 분리

| 구분            | 담는 것                                     | 도구                                          |
| --------------- | ------------------------------------------- | --------------------------------------------- |
| 클라이언트 상태 | 액세스 토큰, 인증 진행 상태, 모달 열림·모드 | Zustand (persist 안 함)                       |
| 서버 상태       | 내 정보, 멤버 목록                          | TanStack Query (키 접두사 `['meerkit', ...]`) |

내 정보는 `useMe()` 하나로만 가져오고 Zustand에 복사하지 않는다.

### 초기 화면 (WelcomePage)

- 로고와 한 줄 소개 (문구 미정)
- 로그인 버튼 → `AuthDialog` 로그인 모드
- 회원가입 버튼 → `AuthDialog` 가입 모드
- 사용 설명서 링크 → `NEXT_PUBLIC_DOCS_URL` 새 탭
- 로그인 후에는 `UserMenu`(이메일, 로그아웃)가 보이고, 관리자에게는 관리자 페이지 링크가 보인다
- UI 모음(`/ui`) 링크

---

## 7. UI 모음 페이지 (`/ui`)

킷의 모든 UI를 한 화면에서 확인하는 페이지다. Storybook 없이 앱 안의 라우트 하나로 만든다.

- 파일: 본체는 `meerkit/showcase/UiShowcase.tsx`, 연결은 `app/(meerkit)/ui/page.tsx`
- 구성
  1. 디자인 토큰: 주색, 배경, 글자색, 반경, 폰트 샘플
  2. shadcn 기본 부품: Button, Input, Label, Dialog, Table, Select, Badge, Sonner 토스트
  3. 킷 컴포넌트: LoginForm, SignupForm, UserMenu, MemberTable, RoleSelect
  4. 상태별 모습: 기본, 로딩, 오류, 비어 있음
  5. 모달 열기 버튼: AuthDialog를 로그인/가입 모드로 직접 열어 본다
- 인증 없이 열린다(목 데이터 사용). 백엔드가 없어도 화면을 확인할 수 있어 PR A 단계에서 먼저 만들기 좋다.
- 운영 배포에서는 `NEXT_PUBLIC_SHOW_UI_PAGE=false`로 막을 수 있게 한다(제안).
- 로그인·가입 폼 스타일은 `LoginForm.tsx`, `SignupForm.tsx` 두 파일에서만 정의하고, `/ui`에서 바로 확인하며 다듬는다.

---

## 8. setup 로직과 로그·에러 규칙

### 명령

| 명령                           | 하는 일                                                          |
| ------------------------------ | ---------------------------------------------------------------- |
| `npx create-meerkit <이름>`    | 템플릿으로 폴더 생성, 다음 안내 출력                             |
| `npx meerkit setup`            | 환경 확인 → 설치 → `.env` → DB → 마이그레이션 → 시드 → 서버 실행 |
| `npx meerkit dev`              | backend + frontend 실행 (제안)                                   |
| `npx meerkit db up/down/reset` | 로컬 DB 제어 (제안)                                              |

로직 자체는 프로젝트 안 `scripts/setup/`에 두고 CLI가 호출한다. Fork해서 쓰는 사람도 같은 스크립트를 쓸 수 있다.

### 단계

| 단계 | 내용                                          | 실패 시                          |
| ---- | --------------------------------------------- | -------------------------------- |
| 1/7  | Node, Python, uv, Docker 확인                 | 없는 도구와 설치 안내 후 중단    |
| 2/7  | `frontend` `npm install`                      | 재시도 명령 안내                 |
| 3/7  | `backend` `uv sync`                           | 재시도 명령 안내                 |
| 4/7  | `.env.example` → `.env`, JWT 비밀키 자동 생성 | 이미 있으면 덮어쓰지 않고 건너뜀 |
| 5/7  | `docker compose up -d --wait`                 | Docker 상태, 포트 충돌 안내      |
| 6/7  | `alembic upgrade head` + 시드 관리자 생성     | DB 연결 정보 점검 안내           |
| 7/7  | backend, frontend 서버 시작                   | 접속 주소 출력                   |

### 로그 규칙

- 단계마다 한 줄 진행 상황을 출력한다.
- 전체 출력은 `meerkit-setup.log`에 저장한다(`.gitignore` 포함).
- 실패하면 **원인 → 해결 방법 → 재실행 명령 → 로그 위치** 순서로 출력한다. 종료 코드는 성공 0, 실패 1.
- 재실행해도 안전하다(이미 된 단계는 건너뜀).
- 비밀번호와 키는 로그에 남기지 않는다.
- 옵션: `--verbose`, `--skip-docker`

```text
[5/7] 로컬 DB 실행 ............ ✖
      원인: Docker 데몬에 연결할 수 없습니다.
      해결: Docker Desktop을 실행한 뒤 `npx meerkit setup`을 다시 실행하세요.
      로그: ./meerkit-setup.log
```

흔한 실패: Node 버전 부족, `uv` 없음, Docker 미실행, 포트 충돌(5432/8000/3000), 네트워크 오류, DB 준비 지연, 같은 이름 폴더 존재.

성공 시 출력: frontend `http://localhost:3000`, backend `http://localhost:8000/docs`, DB `localhost:5432`, 시드 관리자 계정 안내(`.env` 참고).

---

## 9. 관리자 페이지 테스트 시나리오

| 순서 | 동작                                | 확인할 것                      |
| ---- | ----------------------------------- | ------------------------------ |
| 1    | 초기 화면에서 회원가입              | 모달이 열리고 로컬 DB에 저장됨 |
| 2    | 가입한 계정으로 로그인              | 헤더에 이메일, `/me` 접근 가능 |
| 3    | 일반 사용자로 `/admin/members` 접근 | 접근 차단                      |
| 4    | 시드 관리자로 로그인                | 관리자 페이지 링크 노출        |
| 5    | 멤버의 역할을 admin으로 변경        | 목록에 즉시 반영               |
| 6    | 그 계정으로 다시 로그인             | 관리자 메뉴 노출               |
| 7    | 멤버를 비활성화                     | 해당 계정 로그인 차단          |
| 8    | 새로고침                            | 로그인 상태 복원(리프레시)     |

---

## 10. 문서 수정 범위

| 파일                          | 고칠 곳                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| `README.md`                   | 기술 표, 폴더 구조, 환경 변수 표(NEXT_PUBLIC_DOCS_URL), 퀵스타트(`npx meerkit setup`)          |
| `docs/architecture.md`        | 의존 규칙, 백엔드(users, permissions, repository), 프론트 구조 전체, 상태 규칙, 기능 추가 위치 |
| `docs/how-to-add-feature.md`  | 샘플 삭제 경로(examples), 프론트 기능 위치(`app/(service)/`), import 경로(`@/meerkit`)         |
| `docs/future-extensions.md`   | 토큰 사용량 기록, 권한(permission) 테이블 유지                                                 |
| `CONTRIBUTING.md`             | 충돌 잘 나는 파일 목록                                                                         |
| `폴더구조_및_프로젝트생성.md` | 프론트 트리, 기본값 표, 생성 명령(shadcn init 포함), 역할 표                                   |
| `CLAUDE.md` (신규)            | 아래 11장                                                                                      |

---

## 11. AI 작업 규칙 (CLAUDE.md 후보)

1. **위치**
   - 프론트 킷 코드는 `frontend/src/meerkit/`에만 둔다. `app/`에는 한 줄짜리 연결 파일만 둔다.
   - 백엔드 킷 코드는 `app/core`, `auth`, `users`, `permissions`, `llm`에 둔다.
   - 서브 프로젝트는 `examples/`에만 둔다.
2. **의존 방향**
   - 킷은 `examples/`와 `app/(service)/`를 import하지 않는다.
   - 프론트는 `components → hooks → api → client`, 백엔드는 `router → service → repository` 방향으로만 import한다.
   - 가능하면 ESLint `no-restricted-imports`와 `test_import_rules.py`로 자동 검사한다. 문서 규칙만으로는 지켜지지 않는다.
3. **범위**
   - 사용량 관련 코드(usage_logs, 이용 이력, 한도, 잔여량 알림)는 이번 범위에서 만들지 않는다. 향후 확장이다.
   - `llm/`은 사용량 기록과 연결하지 않는다.
   - permission 테이블은 향후 확장이다. 지금은 역할(role)만 쓴다.
4. **상태**
   - 서버 데이터는 TanStack Query, 토큰과 모달 상태는 Zustand.
   - 내 정보를 Zustand에 복사하지 않는다. 토큰 스토어에 `persist`를 쓰지 않는다.
5. **스타일**
   - Tailwind utility와 `tokens.css` 토큰만 사용한다. CSS 모듈과 인라인 스타일은 쓰지 않는다.
   - UI 부품은 shadcn(`components/ui`)을 먼저 쓴다.
   - 새 킷 컴포넌트는 `/ui` 페이지에도 추가한다.
6. **setup 스크립트**
   - 단계별 로그, 실패 시 원인·해결·재실행 명령·로그 위치를 출력한다.
   - 재실행해도 안전하게 만든다. 비밀번호와 키를 출력하지 않는다.
7. **보안**
   - 비밀번호는 argon2 해시로 저장하고 응답에 포함하지 않는다.
   - 시드 계정은 로컬 전용이라고 `.env.example`과 문서에 표시한다. `.env`는 커밋하지 않는다.
8. **새 파일 위치**

   | 만들 것           | 위치                                             |
   | ----------------- | ------------------------------------------------ |
   | 킷 화면 컴포넌트  | `src/meerkit/<기능>/components/`                 |
   | 킷 서버 호출 함수 | `src/meerkit/api/`                               |
   | 킷 라우트 연결    | `src/app/(meerkit)/`                             |
   | 서비스 화면       | `src/app/(service)/`                             |
   | 서브 프로젝트       | `examples/<이름>/`                               |
   | 백엔드 새 API     | 해당 모듈의 router, service, repository, schemas |
   | DB 모델 변경      | `models.py` 수정 후 Alembic 마이그레이션         |

---

## 12. 진행 순서 (소영님 제안 + UI 모음 반영)

0. **결정 먼저:** 토큰 저장 방식(2장 1번), 시드 관리자(2장 2번)
1. **PR A: 프론트 구조 전환** — Tailwind·shadcn 설치, `src/meerkit` 뼈대, WelcomePage, `AuthDialog`와 폼, **`/ui` 페이지**, 문서 수정. 백엔드 없이 목 데이터로 확인 가능. 오늘 우선순위인 로그인·가입 UI가 여기에 해당
2. **PR B: 백엔드 auth** — 로그인, 리프레시 쿠키, 내 정보, repository 계층
3. **PR C: 관리자 기능** — 멤버 API와 화면, 9장 시나리오 검증
4. **별도:** 서브 프로젝트 `examples/` 이동, `npx meerkit setup` 스크립트, `create-meerkit`, CLAUDE.md, 설명서 사이트

PR A와 B는 병렬 진행이 가능하다. 단, 1번 결정(토큰 방식)이 있어야 프론트의 `client.ts`와 백엔드의 refresh API가 맞물린다.
