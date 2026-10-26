# E2E 테스트 (Playwright)

프론트와 백엔드를 연결한 뒤, 가입·로그인·권한이 실제로 맞물리는지 확인합니다.

## 준비

1. DB 실행: `npm run db:start` (저장소 루트)
2. 백엔드 실행 (`backend/.env`에서 `SIGNUP_EMAIL_VERIFICATION_REQUIRED=false`로 두세요. 프론트 설정도 이메일 인증을 쓰지 않습니다)
   ```bash
   cd backend && uv run alembic upgrade head && uv run python -m app.users.seed && uv run uvicorn app.main:app --port 8000
   ```
3. 처음 한 번: `cd frontend && npx playwright install chromium`

## 실행

```bash
cd frontend
E2E_ADMIN_PASSWORD='<backend/.env 의 SEED_ADMIN_PASSWORD>' npm run e2e
```

- 프론트(3000)가 꺼져 있으면 `npm run dev`를 자동으로 띄웁니다. 첫 컴파일이 느려 첫 테스트가 시간 초과로 실패할 수 있으니, 그땐 다시 실행하세요.
- `E2E_ADMIN_PASSWORD`가 없으면 관리자 시나리오만 건너뜁니다.
- 가입 테스트는 실행마다 새 아이디(`e2e…`)를 만들어 DB에 회원이 남습니다. 로컬 DB에서만 돌리세요.
- 실패 시 `npx playwright show-report`로 스크린샷·트레이스를 볼 수 있습니다.
