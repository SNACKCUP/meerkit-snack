# 협업 규칙

## 이슈

- 작업은 이슈부터 만듭니다. "New issue"에서 **기능**(`feat`), **버그**(`bug`), **작업**(`task`) 중 하나를 고릅니다.
- 이슈 번호를 PR 본문에 `Closes #번호`로 적으면 PR이 합쳐질 때 이슈가 자동으로 닫힙니다.
- 템플릿 파일은 `.github/ISSUE_TEMPLATE/`에 있습니다.

## 브랜치

- `main`은 항상 실행 가능한 상태로 유지합니다. 직접 push 하지 않고 PR로만 합칩니다.
- 작업 브랜치 이름: `종류/짧은-설명`
  - `feat/upload-api`, `fix/login-401`, `docs/readme`, `chore/ci-cache`

```bash
git checkout main
git pull
git checkout -b feat/upload-api
```

## 커밋 메시지

```text
종류: 무엇을 했는지 한 줄
```

| 종류       | 언제                     |
| ---------- | ------------------------ |
| `feat`     | 새 기능                  |
| `fix`      | 버그 수정                |
| `docs`     | 문서만 변경              |
| `refactor` | 동작 변화 없는 코드 정리 |
| `test`     | 테스트 추가/수정         |
| `chore`    | 설정, 의존성, CI 등      |

예: `feat: 문서 업로드 API 추가`

## PR

- PR은 작게 만듭니다. 하루 1~2개, 변경 파일 10개 안팎이 적당합니다.
- PR 설명에 **무엇을 바꿨는지**, **어떻게 확인했는지**를 적습니다.
- CI(backend-ci, frontend-ci)가 초록불이어야 합칩니다.
- 리뷰 순서: 주니어끼리 먼저 리뷰 → 시니어 최종 승인.

## 충돌이 잘 나는 곳

아래 파일은 여러 사람이 동시에 고치기 쉬우니, 수정 전에 팀 채팅에 먼저 말합니다.

- `backend/app/api.py`
- `backend/alembic/env.py`
- `frontend/src/app/layout.tsx` (공통 레이아웃)
- `frontend/src/meerkit/index.ts` (킷 공개 API)
- `backend/pyproject.toml`, `frontend/package.json` (의존성 추가)

마이그레이션 파일(`alembic/versions/`)은 한 번에 한 사람만 생성합니다.

## 의존성 추가

```bash
# 백엔드
cd backend && uv add 패키지명          # 개발용은 uv add --dev
# 프론트엔드
cd frontend && npm install 패키지명
```

`uv.lock`, `package-lock.json`도 함께 커밋합니다.

## 비밀값

- `.env`는 절대 커밋하지 않습니다 (`.gitignore`에 등록됨).
- 새 환경 변수를 추가하면 `.env.example`과 README의 환경 변수 표를 같이 고칩니다.
- 실수로 키를 커밋했다면 즉시 해당 키를 폐기하고 새로 발급합니다.

## PR 올리기 전 확인

```bash
# backend
uv run ruff check .
uv run pytest
# frontend
npm run lint
npm run build
```
