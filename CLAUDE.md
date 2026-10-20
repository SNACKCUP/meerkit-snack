# MeerKit AI 작업 규칙

Claude Code 같은 AI 도구가 이 저장소에서 코드를 만들 때 따르는 규칙입니다. 사람도 같은 규칙을 따릅니다.
구조 설명은 [docs/architecture.md](docs/architecture.md), 기능 추가 순서는 [docs/how-to-add-feature.md](docs/how-to-add-feature.md)에 있습니다.

## 1. 위치 규칙

- 프론트 킷 코드는 `frontend/src/meerkit/`에만 둔다. `src/app/`에는 킷을 연결하는 얇은 파일만 둔다.
- 백엔드 킷 코드는 `backend/app/core`, `users`, `auth`, `permissions`, `llm`에 둔다. 서비스 코드는 `backend/app/features/`에 둔다.

| 만들 것 | 위치 |
|---|---|
| 킷의 화면 컴포넌트 | `frontend/src/meerkit/<기능>/components/` |
| 킷의 서버 호출 함수 | `frontend/src/meerkit/api/` |
| 킷의 라우트 연결 | `frontend/src/app/(meerkit)/` |
| 서비스 화면 | `frontend/src/app/(service)/<기능>/` (부품은 `_components/`) |
| 백엔드 새 API | 해당 모듈의 `router.py`, `service.py`, `repository.py`, `schemas.py` |
| DB 모델 변경 | `models.py` 수정 후 Alembic 마이그레이션 생성 (`uv run alembic revision --autogenerate`) |

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
- 권한은 역할(`USER`, `ADMIN`)로만 검사한다. `permissions`/`role_permissions` 테이블은 향후 확장이다.

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
# backend (DB가 켜져 있어야 함: docker compose up -d db)
uv run ruff check .
uv run alembic upgrade head
uv run pytest

# frontend
npm run lint
npm run build
```

Alembic이 자동 생성한 마이그레이션 파일은 `uv run ruff check --fix .`로 형식을 맞춘 뒤 커밋한다.
