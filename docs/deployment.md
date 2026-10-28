# 운영 배포 가이드

MeerKit을 실제 서비스로 올리는 순서입니다. 코드는 준비되어 있고(`backend/Dockerfile`, `.github/workflows/deploy.yml`), 이 문서는 바깥 서비스 설정을 다룹니다.

> 우리 설정 (2026-10-28)
> - 프론트: Vercel, `https://meerkit.dev`
> - 백엔드: Render (Docker, Singapore, Starter), `https://api.meerkit.dev`
> - DB·파일: Supabase `meerkit-prod` (Singapore), 메일: Resend `mail.meerkit.dev`
>
> Fork해서 쓰는 사람은 도메인과 업체 계정만 자기 것으로 바꾸면 됩니다.

## 구조

```text
브라우저 ── https://meerkit.dev ──▶ Vercel (Next.js)
                                      │ /api/* 를 서버 쪽에서 전달 (next.config.ts rewrites)
                                      ▼
                              Render (FastAPI) https://api.meerkit.dev
                                │            │             │
                         Supabase DB   Supabase Storage   Resend SMTP
```

브라우저는 `meerkit.dev` 하나만 봅니다. 리프레시 토큰 쿠키가 같은 사이트 쿠키로 동작하고 CORS 문제도 없습니다.

## 배포가 흘러가는 방식

1. PR이 main에 병합되면 `backend-ci`가 테스트합니다.
2. 통과하면 `deploy` 워크플로가 `production` 환경 **승인을 기다립니다** (Actions 화면의 Review deployments).
3. 승인하면 운영 DB에 `alembic upgrade head` → Render 배포 훅 호출 → `/health`의 `commit`이 새 커밋이 될 때까지 확인합니다.
4. 프론트는 Vercel이 main을 보고 자동으로 배포합니다.

- 마이그레이션이 새 서버보다 먼저 돕니다. 그래서 마이그레이션은 **이전 코드와도 함께 돌아가게** 만듭니다 (컬럼 추가 먼저, 삭제는 다음 배포에서).
- Render의 Auto-Deploy는 끕니다. 배포는 이 워크플로로만 합니다.

## 처음 한 번 설정하기

### 1. Supabase 운영 프로젝트

1. New project: 이름 `meerkit-prod`, 지역 **Singapore**, DB 암호는 비밀번호 관리자에 저장
2. 보안: **데이터 API 끄기**, 새 테이블 자동 표시 끄기, 자동 RLS 켜기. GitHub 연결은 비워 둠 (테이블은 Alembic으로만 만듦)
3. **Connect → Session pooler** 주소 확인 (`...pooler.supabase.com:5432/postgres`). Transaction(6543) 주소는 쓰지 않습니다 (psycopg의 준비된 문장과 맞지 않음)
   - 주소는 `postgresql://...` 그대로 넣어도 됩니다. 서버가 `postgresql+psycopg://`로 바꿔 씁니다
   - 끝에 `?sslmode=require`를 붙입니다
4. 파일 저장소: [storage-setup.md](storage-setup.md)의 운영 설정 1~2단계

### 2. GitHub 설정

Settings → Environments → **New environment** `production`:

| 종류 | 이름 | 값 |
| --- | --- | --- |
| Required reviewers | | 배포를 승인할 사람 |
| Secret | `PROD_DATABASE_URL` | 1-3의 Session pooler 주소 |
| Secret | `RENDER_DEPLOY_HOOK_URL` | 3단계에서 복사 |
| Variable | `PROD_API_URL` | `https://api.meerkit.dev` |

탈퇴 계정 정리(`account-purge`, 매일 03:00)는 저장소 Secret `DATABASE_URL`에 같은 주소를 넣으면 시작됩니다.

비밀 값이 없으면 `deploy`는 아무것도 하지 않고 끝납니다. 준비 전에 병합해도 안전합니다.

### 3. Render 백엔드

1. New → **Web Service** → GitHub 저장소 연결
2. Root Directory `backend`, Language **Docker**, Region **Singapore**, Instance **Starter**
   - 무료(Free)는 15분 쉬면 잠들고 메일 포트가 막혀 있어 운영에 쓰지 않습니다
3. Advanced: Health Check Path `/health/ready`, **Auto-Deploy: No**
4. 환경변수 (Environment):

| 이름 | 값 |
| --- | --- |
| `APP_ENV` | `production` |
| `DATABASE_URL` | Supabase Session pooler 주소 |
| `JWT_SECRET_KEY` | `openssl rand -hex 32` 결과 |
| `COOKIE_SECURE` | `true` |
| `CORS_ORIGINS` | `https://meerkit.dev` |
| `FRONTEND_BASE_URL` | `https://meerkit.dev` |
| `MAIL_BACKEND` 외 `MAIL_*` | [mail-setup.md](mail-setup.md) 6장, 키는 운영용 `meerkit-prod` |
| `STORAGE_*` 7개 | [storage-setup.md](storage-setup.md) 운영 설정 3장 |
| `OPENAI_API_KEY` | AI 기능을 쓸 때 (없으면 AI만 503) |
| `SOCIAL_REDIRECT_BASE_URL` | 구글 로그인을 쓸 때 `https://meerkit.dev/api/auth` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | 구글 로그인을 쓸 때. 운영용 OAuth 클라이언트를 따로 만들고 승인된 Redirect URI에 `https://meerkit.dev/api/auth/google/callback` 등록 ([social-oauth-setup.md](social-oauth-setup.md)). 비우면 구글 로그인만 꺼짐 |
| `API_DOCS_ENABLED` | `true` 또는 `false` (Swagger 공개 여부) |

5. Create를 누르면 Render가 한 번 바로 배포합니다. 아직 테이블이 없어 가입 같은 기능은 실패하지만 `/health`는 응답합니다
6. Settings → **Deploy Hook** 주소를 복사해 GitHub Secret `RENDER_DEPLOY_HOOK_URL`에 넣고, Actions → `deploy` → **Run workflow**로 마이그레이션과 재배포를 합니다
7. Settings → Custom Domains → `api.meerkit.dev` 추가 (DNS는 6단계)

설정이 하나라도 잘못되면 서버가 시작하지 않고 고칠 항목을 로그에 보여 줍니다 (운영 시작 검사).

### 4. Vercel 프론트

1. Add New → Project → 저장소, **Root Directory `frontend`**, Framework Next.js
2. 환경변수:

| 이름 | 값 |
| --- | --- |
| `API_PROXY_TARGET` | `https://api.meerkit.dev` |
| `NEXT_PUBLIC_API_BASE_URL` | `/api` |
| `NEXT_PUBLIC_SITE_URL` | `https://meerkit.dev` |
| 그 밖 | `frontend/.env.example` 참고 |

- `API_PROXY_TARGET`은 빌드할 때 읽힙니다. 바꾸면 다시 배포해야 합니다
3. Settings → Domains: `meerkit.dev` 추가, `www.meerkit.dev`는 `meerkit.dev`로 Redirect

### 5. 도메인 DNS (Porkbun)

| Type | Host | Answer |
| --- | --- | --- |
| A (Vercel 안내 값) | (비움) | Vercel이 보여 주는 IP |
| CNAME | `www` | Vercel이 보여 주는 값 |
| CNAME | `api` | Render가 보여 주는 값 (`...onrender.com`) |

- Porkbun 기본 기록(ALIAS·`*` → `pixie.porkbun.com`)은 지웁니다. 메일 기록(DKIM·SPF·DMARC)은 그대로 둡니다
- HTTPS 인증서는 Vercel·Render가 자동으로 붙입니다 (`.dev`는 HTTPS만 열림)

### 6. 첫 관리자 계정

Environment `production`에 Secret `SEED_ADMIN_PASSWORD`, Variable `SEED_ADMIN_USER_ID`·`SEED_ADMIN_EMAIL`을 넣고 Actions → **seed-admin** → Run workflow. 이미 있으면 건너뜁니다. 비밀번호는 로컬 기본값을 쓰지 않고, 만든 뒤 Secret은 지워도 됩니다.

## 배포 뒤 확인

- [ ] `https://api.meerkit.dev/health` → `{"status":"ok","commit":"<새 커밋>"}`, `/health/ready` → `database: ok`
- [ ] `https://meerkit.dev` HTTPS, `www`는 `meerkit.dev`로 이동
- [ ] 가입 인증 메일 수신, Gmail "원본 보기"에서 SPF·DKIM·DMARC PASS
- [ ] 로그인 뒤 새로고침해도 유지 (쿠키 `Secure`·`HttpOnly`)
- [ ] 비밀번호 찾기 링크가 `https://meerkit.dev/...`
- [ ] (구글 로그인을 켰다면) 구글 로그인 → `https://meerkit.dev`로 돌아와 로그인 상태
- [ ] 프로필 이미지 주소가 `https://<ref>.supabase.co/storage/...`
- [ ] 관리자 멤버 관리 화면
- [ ] Render 로그가 JSON이고 `request_id`가 있으며, 비밀번호·인증번호·키가 없음

## 되돌리기

| 상황 | 할 일 |
| --- | --- |
| 새 서버가 이상함 | Render → Deploys → 이전 배포 **Rollback** |
| 새 화면이 이상함 | Vercel → Deployments → 이전 배포 **Promote to Production** |
| 마이그레이션을 되돌려야 함 | 운영 DB 주소로 `uv run alembic downgrade -1` (데이터가 지워지는 변경인지 먼저 확인) |
| 키가 샘 | 해당 업체에서 새 키 → Render·GitHub 값 교체·재배포 → 예전 키 삭제 |

## 운영 중 할 일

| 할 일 | 어디서 |
| --- | --- |
| 오류 추적 | Render Logs에서 응답 헤더 `X-Request-ID` 값으로 검색 |
| 탈퇴 계정 정리 결과 | Actions → `account-purge` (매일 03:00) |
| DB 용량·일시정지 | Supabase 무료는 7일 동안 요청이 없으면 일시정지, 자동 백업 없음. 실제 운영은 Pro ([future-extensions.md](future-extensions.md)) |
| 메일 사용량 | Resend 대시보드 |
| Swagger 숨기기 | Render `API_DOCS_ENABLED=false` → 재시작 |
