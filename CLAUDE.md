# CLAUDE.md - Modular Agent Harness & Context Router

당신은 프로젝트의 자율 엔지니어링 에이전트입니다.
본 프로젝트는 도메인별 세부 규칙을 `.claude/harness/` 디렉토리 하위에 분리하여 관리합니다.
작업 시작 전 태스크 플랜을 수립하고, 작업 맥락에 맞는 하네스 파일을 선별 참조하며, 반복 트러블 발생 시 승인을 받아 모듈 문서를 갱신합니다.

---

## 1. Phase 1: Task Navigation Plan (작업 전 필수)

복잡한 구현, 리팩터링, 디버깅 지시를 받으면 **코드를 바로 수정하지 말고**, 참조할 하네스 문서를 지정한 플랜을 먼저 제시합니다.

```text
### 🗺️ Task Navigation Plan
- **최종 목표:** [구현하려는 핵심 기능 또는 버그 수정]
- **참조할 하네스 문서:** [예: `.claude/harness/errors/supabase-rls.md`, `.claude/harness/rules/tailwind-v4.md`]
- **영향 파일:** [수정/생성될 파일 목록]
- **체크포인트 (마일스톤):**
  1. [Step 1: 환경/타입/스키마 정의] -> 검증 조건: `타입 체크 통과`
  2. [Step 2: 핵심 비즈니스 로직 및 컴포넌트] -> 검증 조건: `단위 로직 확인`
  3. [Step 3: UI 연결 및 통합 빌드 검증] -> 검증 조건: `빌드 명령 통과`
- **예상 리스크:** [하네스에 정의된 주의점 기반 작성]
```

> 사용자의 "진행해", "OK" 등 승인 입력 전까지는 실제 파일 수정을 대기합니다.

---

## 2. Phase 2: 상황별 하네스 참조 맵 (Context Routing)

작업 도메인에 따라 아래 해당 경로의 문서를 우선적으로 열람하여 지침을 준수합니다.

| 도메인 / 상황               | 참조 하네스 경로                            | 주요 확인 사항                              |
| :-------------------------- | :------------------------------------------ | :------------------------------------------ |
| **Next.js / 런타임 빌드**   | `.claude/harness/errors/next-app-router.md` | 클라이언트/서버 컴포넌트 경계, SSR 환경변수 |
| **DB 접근 / 권한** (Supabase 미사용) | `.claude/harness/errors/supabase-rls.md` | 서버가 권한 판단, 해시·쿠키 규칙, 프론트와 어긋난 스키마 표 |
| **스타일링 / CSS**          | `.claude/harness/rules/tailwind-v4.md`      | CSS 변수 토큰, 빌드로 CSS 검증, 움직임 끄기  |
| **DB 마이그레이션/배포**    | `.claude/harness/workflows/db-migration.md` | Alembic 순서, 롤백 계획, 무중단 스키마 변경 |
| **pytest 로그 검사**        | `.claude/harness/errors/pytest-app-logging.md` | `app` 로거 `propagate=False`, caplog 켜고 되돌리기 |

---

## 3. Phase 3: 하네스 모듈 자가 진화 및 신규 생성 프로토콜

작업 중 아래 조건 발생 시 임의로 루트에 파일을 만들지 않고, `.claude/harness/` 하위 모듈 문서 업데이트를 제안합니다.

### 📌 승격 트리거 조건

1. 동일 모듈/로직에서 2회 이상 수정이 번복되거나 삽질이 발생한 경우
2. 라이브러리/프레임워크 버전 특이성으로 인한 신규 트러블슈팅인 경우
3. 다른 세션의 에이전트가 반드시 회피해야 할 아키텍처 제약사항이 발견된 경우

### ⚠️ 제안 양식 (출력 포맷)

```text
🔔 [하네스 문서 갱신 제안]
- **원인 요약:** [문제가 발생했던 기술적 근본 원인 1줄]
- **대상 파일:** `.claude/harness/errors/[파일명].md` (기존 파일 수정 또는 신규 생성)
- **추가할 규칙 초안:**
  > - [Always/Never] {명확한 행동 지침} (이유: {근거})

이 내용을 하네스 문서에 반영하고, `docs/troubleshooting.xlsx`용 마크다운 행 데이터를 출력할까요?
```

---

## 4. 메타 행동 강령 (Meta Constraints)

1. **임의 파일 증식 금지:** 승인 없이 `.claude/harness/` 외부에 가이드 md 파일을 생성하지 마십시오. 모든 에러/규칙 문서는 `.claude/harness/errors/`, `.claude/harness/rules/`, `.claude/harness/workflows/` 내에만 위치합니다.
2. **트러블슈팅 행 추출 의무:** 에러가 해결되고 사용자가 승인하면, `docs/troubleshooting.xlsx`에 바로 붙여넣을 수 있도록 아래 표 형식으로 마크다운 데이터를 즉시 제공합니다:
   - `| ID | 일자 | 도메인 | 심각도 | 이슈 요약 | 증상 및 에러 로그 | 근본 원인 | 실패했던 시도 | 최종 해결책 | 하네스 반영 파일 |`

> 저장소 공통 규칙(위치, 의존 방향, 범위, 상태, 스타일, 보안, 확인 명령)은 아래 "MeerKit AI 작업 규칙"에 있습니다. 모든 작업에 공통으로 적용됩니다.

---

# MeerKit AI 작업 규칙

Claude Code 같은 AI 도구가 이 저장소에서 코드를 만들 때 따르는 규칙입니다. 사람도 같은 규칙을 따릅니다.
구조 설명은 [docs/architecture.md](docs/architecture.md), 기능 추가 순서는 [docs/how-to-add-feature.md](docs/how-to-add-feature.md)에 있습니다.

## 1. 위치 규칙

- 프론트 킷 코드는 `frontend/src/meerkit/`에만 둔다. `src/app/`에는 킷을 연결하는 얇은 파일만 둔다.
- 백엔드 킷 코드는 `backend/app/core`, `users`, `auth`, `permissions`, `account`, `social`, `llm`, `mail`, `storage`, `codes`에 둔다. 서비스 코드는 `backend/app/features/`에 둔다.
- 킷끼리는 한 방향으로만 import 한다: `core ← users ← auth ← permissions ← account`, `mail`·`llm`·`storage`·`codes`는 `core`만, `users`는 `storage`도 씀, `social`은 `core`·`users`·`auth`만 (`tests/test_import_rules.py`의 층 표). 바꿔야 하면 먼저 협의한다.

| 만들 것             | 위치                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------- |
| 킷의 화면 컴포넌트  | `frontend/src/meerkit/<기능>/components/`                                                |
| 킷의 서버 호출 함수 | `frontend/src/meerkit/api/`                                                              |
| 킷의 라우트 연결    | `frontend/src/app/(meerkit)/`                                                            |
| 서비스 화면         | `frontend/src/app/(service)/<기능>/` (부품은 `_components/`)                             |
| 백엔드 새 API       | 해당 모듈의 `router.py`, `service.py`, `repository.py`, `schemas.py`                     |
| DB 모델 변경        | `models.py` 수정 후 Alembic 마이그레이션 생성 (`uv run alembic revision --autogenerate`) |

킷에 새 기능을 공개할 때는 `frontend/src/meerkit/index.ts`에 export를 추가한다.

## 2. 의존 방향

- 킷은 서비스 코드(`backend/app/features/`, `frontend/src/app/(service)/`)를 import 하지 않는다.
  - 백엔드: `backend/tests/test_import_rules.py`가 검사한다.
  - 프론트: ESLint `no-restricted-imports`가 검사한다 (`frontend/eslint.config.mjs`).
- `src/app/`은 킷을 `@/meerkit`(공개 API)으로만 import 한다.
- 프론트는 `components → hooks → api → client` 방향으로만 import 한다.
- 백엔드는 `router → service → repository` 방향으로만 import 한다. SQL은 repository에만 둔다.

## 3. 범위 제한 (이번 10일 범위)

- 사용량 관련 코드(`usage_logs`, 이용 이력, 한도, `/history`, `/admin/usage`)는 만들지 않는다. → [향후 확장](docs/future-extensions.md)
- `llm/`은 사용량 기록과 연결하지 않는다.
- 역할은 `MASTER`, `OWNER`, `VIEWER`, `WRITER` 4종이고 한 사람이 여러 역할을 가질 수 있다. 관리자 검사는 `app.core.principal`의 `require_admin`(`ADMIN_ROLE` = `MASTER`) 하나로만 한다. 권한 검사는 요청마다 auth가 채운 현재 사용자만 읽으므로 어느 킷 모듈이든 `core`만 import 해서 쓸 수 있다.
- 위 관리자는 서비스 전체 관리자다. 서브 서비스 안 리소스 단위 권한(예: 매무새 프로젝트의 관리자/일반 멤버)은 서비스가 자기 테이블로 정하고 킷 역할로 대신하지 않는다. MASTER는 이런 리소스를 고객 지원용으로 보기만 한다.
- 역할별 세부 권한은 아직 정하지 않았다. `permissions`/`role_permissions` 테이블은 향후 확장이다.
- 화면에 보이는 분류값(구분, 우선순위, 문서 종류 등)은 공통코드(`app.codes`)로 관리한다. 킷과 서브 서비스가 테이블 2개를 같이 쓰고 `owner`(`MEERKIT`/`MMS`)로 구분하며, `group_code`는 `owner_`로 시작한다. 서브 서비스는 자기 묶음을 자기 마이그레이션에서만 넣고, 저장 전에 `require_code`로 검사한다. 코드가 흐름을 바꾸는 상태값·권한은 공통코드에 넣지 않고 각 테이블의 `CHECK`로 둔다.
- 파일은 `app.storage.get_storage()`로만 저장한다. 공개 버킷(`meerkit-public`)에는 공개해도 되는 파일만 두고, 고객 문서는 넣지 않는다.
- 메일은 `app.mail.send_mail`로만 보낸다. 라우터에서 `BackgroundTasks`로 넘기고, 인증번호·토큰·비밀번호를 로그에 남기지 않는다.

## 4. 상태 규칙 (프론트)

- 서버에서 오는 데이터는 TanStack Query로, 토큰·모달 상태는 Zustand로 다룬다.
- 내 정보를 Zustand에 복사하지 않는다 (`useMe()`만 사용).
- 토큰 스토어에 `persist`를 쓰지 않는다. 액세스 토큰은 메모리, 리프레시 토큰은 httpOnly 쿠키.

## 5. 스타일 규칙

- Tailwind utility와 `frontend/src/meerkit/styles/tokens.css`의 토큰만 사용한다. CSS 모듈과 인라인 스타일은 쓰지 않는다.
- UI 부품은 shadcn(`frontend/src/components/ui`)을 먼저 쓴다.
- 로그인·가입 폼의 모양은 `LoginForm.tsx`, `SignupForm.tsx`에서만 정의한다.

## 6. setup 스크립트 규칙 (만들 때)

- 단계별 로그를 남기고, 실패 시 원인·해결·재실행 명령·로그 파일 위치를 출력한다.
- 재실행해도 안전하게 만든다 (이미 된 단계는 건너뜀).
- 비밀번호, 키를 로그에 출력하지 않는다.

## 7. 보안 규칙

- 비밀번호는 argon2 해시로 저장하고 응답에 포함하지 않는다.
- 로컬 테스트용 기본 비밀번호(`SEED_ADMIN_PASSWORD`)는 `.env.example`과 문서에 "로컬 전용"이라고 표시한다.
- `.env`는 커밋하지 않는다.

## 8. 확인 명령

```bash
# backend (DB가 켜져 있어야 함: npm run db:start)
uv run ruff check .
uv run alembic upgrade head
uv run pytest

# frontend
npm run lint
npm run build
```

Alembic이 자동 생성한 마이그레이션 파일은 `uv run ruff check --fix .`로 형식을 맞춘 뒤 커밋한다.
