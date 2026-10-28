# 소셜 로그인 설정 및 구현 명세 (Google · Kakao · Naver)

> 상태: 구현 전 명세. 백엔드 API는 아직 없습니다. 프론트의 Google 버튼·콜백 화면(`frontend/src/meerkit/auth/`)은 먼저 머지되어 있고, 이 문서의 서버 계약은 그 화면에 맞춥니다.
> 첫 구현 대상은 Google이고, Kakao·Naver는 **공급자 파일 하나와 환경 변수만 추가**하면 붙도록 설계합니다.

## 한눈에 보기

1. 사용자가 소셜 버튼을 누르면 브라우저가 `GET /api/auth/{provider}/login`으로 이동합니다. (`provider` = `google` | `kakao` | `naver`)
2. 서버는 `state`를 만들어 짧게 유지되는 서명 쿠키에 넣고, 공급자 인증 화면으로 302를 보냅니다.
3. 공급자가 `GET /api/auth/{provider}/callback?code=...&state=...`로 돌려보냅니다.
4. 서버는 `state`를 확인하고, 인가 코드를 토큰으로 바꾼 뒤 사용자 정보를 **공통 형식(`SocialProfile`)** 으로 바꿉니다.
5. `social_accounts`에서 `(provider, provider_user_id)`로 연결을 찾습니다. 연결이 있으면 그 사용자로 로그인하고, 없으면 연결하거나 새로 가입시킵니다.
6. 리프레시 JWT를 httpOnly 쿠키(`meerkit_refresh`)로 설정하고 프론트 `/auth/{provider}/callback`으로 302를 보냅니다. 실패하면 `?error=<코드>`를 붙입니다.
7. 프론트 콜백 화면이 `POST /api/auth/refresh`로 액세스 토큰을 받습니다. 토큰은 주소(쿼리)에 넣지 않습니다.

```text
브라우저 ──GET /api/auth/google/login──▶ 서버 ──302──▶ Google
Google ──302 /api/auth/google/callback?code&state──▶ 서버 (토큰 교환·프로필·계정 처리, 쿠키 설정)
서버 ──302 /auth/google/callback[?error=...]──▶ 프론트 ──POST /api/auth/refresh──▶ 액세스 토큰
```

## 폴더 구조 (독립 모듈)

소셜 로그인은 기존 `auth/`에 덧붙이지 않고 **별도 킷 패키지 `social`** 로 분리합니다. 이 폴더와 라우터 등록 한 줄을 지우면 소셜 로그인이 빠지고, 다른 킷은 그대로 동작해야 합니다.

### 백엔드: `backend/app/social/`

```text
backend/app/social/
├── __init__.py          # 공개 API: router
├── models.py            # SocialAccount (social_accounts 테이블)
├── schemas.py           # SocialProfile: 공급자 응답을 바꾼 공통 형식
├── repository.py        # social_accounts SQL (조회·생성·last_login_at 갱신)
├── service.py           # 공급자와 무관한 계정 처리: 찾기 → 연결 → 신규 가입
├── state.py             # state·PKCE·약관 동의를 담은 서명 쿠키 발급/검증
├── router.py            # GET /auth/{provider}/login, GET /auth/{provider}/callback
└── providers/
    ├── __init__.py      # 레지스트리: get_provider(name) / enabled_providers()
    ├── base.py          # OAuthProvider 프로토콜 (아래 계약)
    ├── google.py        # 1차 구현
    ├── kakao.py         # 확장
    └── naver.py         # 확장

backend/tests/social/
├── conftest.py          # 공급자 HTTP mock (respx 등)
├── test_google.py
├── test_service.py      # 공급자와 무관한 연결·가입 규칙
└── test_router.py       # 302 위치, error 코드, 쿠키
```

- **층 위치:** `social`은 `core`, `users`, `auth`만 import 합니다. 토큰 발급과 `set_refresh_cookie`는 `auth`에 있는 것을 재사용합니다. `social`을 import 하는 킷은 없고, `app/api.py`만 라우터를 등록합니다.
- **협의 필요:** `backend/tests/test_import_rules.py`의 `ALLOWED_KIT_IMPORTS`에 `"social": {"core", "users", "auth"}`를 추가해야 합니다 (CLAUDE.md "킷 의존 방향 변경 시 먼저 협의").
- 모델 import는 `backend/alembic/env.py`에 `app.social.models`를 한 줄 추가합니다.

### 공급자 계약 (`providers/base.py`)

공급자마다 다른 부분은 이 계약 안에서만 처리합니다. `service.py`와 `router.py`에는 `if provider == "kakao"` 같은 분기를 두지 않습니다.

```python
class OAuthProvider(Protocol):
    name: str                     # "google" | "kakao" | "naver"  (social_accounts.provider 값)
    uses_pkce: bool

    def is_configured(self) -> bool: ...                       # 클라이언트 ID·시크릿이 설정됐는지
    def authorize_url(self, state: str, code_challenge: str | None) -> str: ...
    async def exchange_code(self, code: str, code_verifier: str | None) -> dict: ...  # 토큰 응답 (저장하지 않음)
    async def fetch_profile(self, tokens: dict) -> SocialProfile: ...


class SocialProfile(BaseModel):
    provider: str
    provider_user_id: str         # 항상 문자열로 정규화 (카카오 id는 숫자)
    email: str | None             # 공급자가 안 주거나 사용자가 동의하지 않으면 None
    email_verified: bool          # 공급자가 검증했다고 보장할 때만 True
    name: str | None
    profile_image_url: str | None
```

### 프론트: `frontend/src/meerkit/social/`

지금은 `auth/` 안에 있는 Google 전용 파일을 소셜 공통 폴더로 옮기고, 공급자는 설정 표 한 줄로 늘립니다.

```text
frontend/src/meerkit/social/
├── providers.ts             # 공급자 표: { id, label, Icon, 버튼 색 토큰 }
├── SocialCallbackPage.tsx   # ← auth/GoogleCallbackPage.tsx (provider 인자로 일반화)
├── mutations.ts             # useSocialLogin(provider)  ← auth/mutations.ts 의 useGoogleLogin
└── components/
    ├── SocialLogin.tsx      # ← auth/components/SocialLogin.tsx (켜진 공급자 버튼 목록)
    ├── SocialButton.tsx     # 공통 버튼 틀
    └── icons/               # GoogleIcon, KakaoIcon, NaverIcon (브랜드 가이드 준수)

frontend/src/app/(meerkit)/auth/[provider]/callback/page.tsx   # ← auth/google/callback/page.tsx
```

- 설정은 `meerkit.config.ts`의 `login.social: { google: true, kakao: false, naver: false }`처럼 공급자별 불리언으로 둡니다. 꺼진 공급자의 콜백 경로는 404를 보냅니다.
- 서버 호출 주소는 `api/auth.ts`의 `googleLoginUrl()`을 `socialLoginUrl(provider)`로 일반화합니다.
- `LoginForm.tsx`, `SignupForm.tsx`는 `<SocialLogin />` 자리만 두고, 버튼 모양은 `social/components`에서 정의합니다.
- 공개 export는 `frontend/src/meerkit/index.ts`에 추가하고, 킷 문서 `docs/content/google-login.tsx`는 `social-login.tsx`로 바꿉니다.

## 공급자별 설정

| 항목 | Google | Kakao | Naver |
| --- | --- | --- | --- |
| 콘솔 | Google Cloud Console → OAuth 클라이언트(웹 애플리케이션) | Kakao Developers → 내 애플리케이션 | NAVER Developers → 애플리케이션 등록 |
| 인증 URL | `https://accounts.google.com/o/oauth2/v2/auth` | `https://kauth.kakao.com/oauth/authorize` | `https://nid.naver.com/oauth2.0/authorize` |
| 토큰 URL | `https://oauth2.googleapis.com/token` | `https://kauth.kakao.com/oauth/token` | `https://nid.naver.com/oauth2.0/token` |
| 프로필 URL | `https://openidconnect.googleapis.com/v1/userinfo` (+ ID Token 검증) | `https://kapi.kakao.com/v2/user/me` | `https://openapi.naver.com/v1/nid/me` |
| scope | `openid email profile` | `account_email profile_nickname profile_image` (동의 항목에서 설정) | 콘솔의 제공 정보 선택에서 설정 |
| `provider_user_id` | `sub` | `id` (숫자 → 문자열) | `response.id` |
| 이메일 | `email` | `kakao_account.email` (사용자가 동의하지 않으면 없음) | `response.email` |
| `email_verified` | `email_verified` | `is_email_valid && is_email_verified` | 검증 여부 필드 없음 → `False`로 취급 |
| PKCE | 사용 | 사용하지 않음 | 사용하지 않음 |
| 비고 | — | 이메일 필수 동의는 비즈 앱 전환이 필요할 수 있음 | `state` 필수 |

### Redirect URI

개발 환경은 Next가 `/api/*`를 FastAPI(8000)로 프록시하므로, 공급자 콜백도 프론트 주소의 `/api` 경로로 등록합니다. 이렇게 하면 서버가 설정하는 쿠키가 프론트와 같은 출처(localhost:3000)에 저장됩니다.

| 공급자 | 개발 Redirect URI |
| --- | --- |
| Google | `http://localhost:3000/api/auth/google/callback` |
| Kakao | `http://localhost:3000/api/auth/kakao/callback` |
| Naver | `http://localhost:3000/api/auth/naver/callback` |

> 현재 Google Console에 등록된 `http://localhost:3000/auth/google/callback`은 **프론트 화면 주소**입니다. 서버가 시작하는 방식에서는 위의 `/api/...` 주소로 바꿔야 합니다. 프론트 화면 주소는 서버가 마지막에 302로 보내는 곳이며, 공급자 콘솔에는 등록하지 않습니다.

Redirect URI는 공급자 콘솔, 인증 요청, 토큰 교환 요청에서 글자 하나까지 같아야 합니다. 운영 Redirect URI, 동의 화면, 승인된 도메인은 배포 전에 따로 등록합니다.

## 환경 변수

`backend/.env`에 설정합니다. 공통 값 두 개와, 쓰는 공급자의 ID·시크릿을 넣습니다. **ID가 비어 있는 공급자는 꺼진 것으로 보고** `/api/auth/{provider}/login`이 404를 보냅니다. 실제 시크릿은 이 문서, `.env.example`, 프론트, 저장소에 기록하지 않습니다.

```dotenv
# 공통: 공급자 Redirect URI의 앞부분과, 로그인 후 돌아갈 프론트 주소
SOCIAL_REDIRECT_BASE_URL=http://localhost:3000/api/auth
FRONTEND_BASE_URL=http://localhost:3000

# Google
GOOGLE_CLIENT_ID=934918016968-6m597koiqd4th9tg0qu8r2q4l16f0dda.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<Google Cloud Console에서 발급한 시크릿>

# Kakao (REST API 키 / 보안 탭의 Client Secret)
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=

# Naver
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
```

Redirect URI는 `{SOCIAL_REDIRECT_BASE_URL}/{provider}/callback`으로 만듭니다. 공급자마다 URI 변수를 따로 두지 않습니다. 운영에서는 같은 이름의 변수를 배포 플랫폼의 백엔드 서비스에 설정합니다.

## API 계약

| 요청 | 동작 |
| --- | --- |
| `GET /api/auth/{provider}/login?intent=login` | state 쿠키를 설정하고 공급자 인증 화면으로 302 |
| `GET /api/auth/{provider}/login?intent=signup&agreed_terms=terms,privacy` | 가입 화면 버튼. 동의한 약관을 state 쿠키에 함께 담음 |
| `GET /api/auth/{provider}/callback?code&state` | 공급자가 호출. 성공하면 리프레시 쿠키를 설정하고 `{FRONTEND_BASE_URL}/auth/{provider}/callback`으로 302 |
| 실패 | `{FRONTEND_BASE_URL}/auth/{provider}/callback?error=<코드>`로 302 |

### state 쿠키 (`state.py`)

- `state`(무작위 32바이트), `code_verifier`(PKCE 공급자만), `intent`, `agreed_terms`, `provider`를 `JWT_SECRET_KEY`로 서명해 httpOnly 쿠키 `meerkit_oauth_state`에 넣습니다. 만료는 10분, `Path=/api/auth/{provider}/callback`, `SameSite=Lax`입니다.
- 콜백에서 쿼리의 `state`, 쿠키의 `state`, 쿠키의 `provider`가 모두 맞는지 확인하고 쿠키는 바로 지웁니다 (한 번만 사용). 서버에 저장하지 않으므로 별도 테이블이 필요 없습니다.

### 오류 코드 (`?error=`)

| 코드 | 상황 |
| --- | --- |
| `access_denied` | 사용자가 공급자 화면에서 취소함 |
| `state_mismatch` | state가 없거나, 다르거나, 만료됨 |
| `provider_error` | 토큰 교환·프로필 조회 실패, ID Token 검증 실패 |
| `email_required` | 공급자가 이메일을 주지 않았는데 신규 가입이 필요함 |
| `email_exists` | 같은 이메일의 기존 계정이 있지만 공급자가 검증된 이메일이라고 보장하지 않음 (자동 연결하지 않음) |
| `terms_required` | 처음 온 계정인데 약관 동의 없이 로그인 버튼으로 들어옴 → 프론트가 가입 화면으로 안내 |
| `account_inactive` | 비활성·탈퇴·삭제 계정 |

공급자 오류 원문, 인가 코드, 토큰 값은 오류 코드·응답·로그에 넣지 않습니다.

## `social_accounts` 테이블

사용자 한 명은 공급자마다 계정을 하나씩 연결할 수 있습니다 (Google 1개 + Kakao 1개 + ...). 공급자를 추가해도 **테이블 변경 없이** 행만 늘어나도록 공통 컬럼만 둡니다.

| 컬럼 | 타입 | 제약 | 목적 |
| --- | --- | --- | --- |
| `id` | `Integer` | PK | 기본 키 |
| `user_id` | `Integer` | FK `users.id` `ON DELETE CASCADE`, 인덱스 | 연결된 MeerKit 사용자 |
| `provider` | `String(20)` | NOT NULL | `google`, `kakao`, `naver`. DB enum을 쓰지 않아 공급자를 추가해도 마이그레이션이 필요 없음. 허용 값은 `providers/` 레지스트리가 검사 |
| `provider_user_id` | `String(255)` | NOT NULL | 공급자가 발급한 변하지 않는 계정 식별자 (Google `sub`, Kakao `id`, Naver `response.id`) |
| `email` | `String(255)` | NULL 허용 | 연결 당시 공급자가 준 이메일. Kakao·Naver는 동의에 따라 없을 수 있음 |
| `email_verified` | `Boolean` | NOT NULL, 기본 `false` | 공급자가 이메일 검증을 보장했는지. 기존 계정 자동 연결 판단에 사용 |
| `name` | `String(50)` | NULL 허용 | 연결 당시 공급자 표시 이름 (마이페이지 "연결된 계정" 표시용) |
| `profile_image_url` | `String(500)` | NULL 허용 | 연결 당시 공급자 프로필 이미지 주소 (표시용, 저장소에 복사하지 않음) |
| `last_login_at` | `DateTime(tz)` | NULL 허용 | 이 공급자로 마지막 로그인한 시각 |
| `created_at`, `updated_at` | `DateTime(tz)` | `TimestampMixin` | 연결 생성·수정 시각 |

인덱스·제약:

- `UNIQUE (provider, provider_user_id)`: 로그인 시 조회 키입니다. 카카오의 숫자 id처럼 공급자끼리 값이 겹칠 수 있으므로 `provider_user_id` 혼자가 아니라 **두 컬럼을 합쳐** 유일하게 둡니다.
- `UNIQUE (user_id, provider)`: 한 사용자에게 같은 공급자 계정을 두 개 연결하지 않습니다.

이전 초안에서 바뀐 점: `social_clsf` → `provider`, `social_sub` → `provider_user_id`로 이름을 바꿨습니다 (`sub`는 OIDC 용어라 Kakao·Naver에 맞지 않음). 단독 유일 키를 복합 유일 키로 바꾸고, `email`을 NULL 허용으로 바꿨으며, `email_verified`, `name`, `profile_image_url`, `last_login_at`을 추가했습니다.

**저장하지 않는 것:** 공급자 Access Token, Refresh Token, ID Token, 프로필 원본 JSON. 계정 식별에는 필요 없고, 새면 피해가 큽니다. 공급자 API를 쓰는 기능(예: 카카오톡 메시지)이 생기면 그때 암호화 저장을 따로 설계합니다.

### `users` 테이블 추가 컬럼

| 컬럼 | 타입 | 목적 |
| --- | --- | --- |
| `has_password` | `Boolean`, NOT NULL, 기본 `true` | 소셜로만 가입한 계정은 `false`. 아이디·비밀번호 로그인을 막고, 마이페이지의 비밀번호 변경·탈퇴 확인 화면이 "비밀번호 설정" 흐름으로 갈라지는 기준 |

`account` 킷은 `social`을 import 할 수 없으므로 (층 규칙), "비밀번호가 있는 계정인지"는 `social_accounts`가 아니라 `users`에 둡니다. 소셜 신규 사용자도 `hashed_password`에는 로그인에 쓸 수 없는 무작위 비밀번호의 해시를 넣어 NOT NULL을 유지합니다. 비밀번호를 설정하면 `has_password=true`로 바꿉니다. `auth`의 로그인과 `account`의 비밀번호 확인은 `has_password=false`이면 해시를 비교하지 않고 기존 "아이디 또는 비밀번호가 틀림" 응답을 그대로 돌려줍니다.

## 계정 처리 규칙 (`service.py`)

공급자와 무관하게 `SocialProfile`만 보고 판단합니다. 아래 순서를 한 트랜잭션에서 처리합니다.

1. **연결 있음:** `(provider, provider_user_id)`로 찾은 사용자의 상태를 확인합니다. 비활성·탈퇴·삭제면 `account_inactive`를 보냅니다. 정상이면 `social_accounts.last_login_at`, `users.last_login_at`을 갱신하고 로그인합니다. 공급자 이메일이 바뀌었으면 `social_accounts.email`만 갱신하고 `users.email`은 바꾸지 않습니다.
2. **연결 없음 + 같은 이메일의 기존 사용자 있음:**
   - `email_verified=true`이면 기존 사용자에게 연결 행을 만들고 로그인합니다. 비활성 계정을 임의로 다시 활성화하지 않습니다.
   - `email_verified=false`(Naver 전체, 검증되지 않은 Kakao 이메일)이면 자동 연결하지 않고 `email_exists`를 보냅니다. 연결은 로그인한 상태에서 마이페이지에서 하도록 향후 확장합니다.
3. **연결 없음 + 기존 사용자 없음 (신규 가입):**
   - 이메일이 없으면 `email_required`를 보냅니다.
   - state 쿠키에 현재 필수 약관 동의가 없으면 `terms_required`를 보냅니다.
   - 사용자를 만듭니다: 역할 `VIEWER`, 기존 아이디 규칙에 맞는 고유 `login_id`(예: `g_` + 무작위), `name`은 공급자 이름(없으면 이메일 앞부분), `has_password=false`, `email_verified_at`은 `email_verified=true`일 때만 기록합니다.
   - 약관 동의 기록과 `social_accounts` 행을 같은 트랜잭션에서 저장합니다.
4. 이미 다른 사용자에게 연결된 `(provider, provider_user_id)`는 다시 연결하지 않습니다 (유일 제약 위반은 트랜잭션을 되돌리고 `provider_error`가 아니라 로그인 실패로 처리).

### 탈퇴·파기

- 사용자 행이 지워지면 `ON DELETE CASCADE`로 연결 행도 지워집니다.
- 탈퇴 후 개인정보 파기(`app.users.purge`)는 사용자 행을 지우지 않고 값만 지우므로, `social_accounts`의 `email`, `name`, `profile_image_url`이 남습니다. `users`는 `social`을 import 할 수 없으므로 `social/cleanup.py`(`uv run python -m app.social.cleanup`)가 `deleted_at`이 기록된 사용자의 연결 행을 지웁니다. purge와 같은 스케줄로 실행합니다.
- 공급자 쪽 연결 끊기(Kakao unlink, Naver 토큰 삭제)는 토큰을 저장하지 않으므로 이번 범위에 넣지 않습니다.

## 보안

- `state` 검증을 생략하지 않습니다. Google은 PKCE(`S256`)도 함께 사용합니다.
- Google ID Token은 서명(Google JWKS), `iss`, `exp`, `aud == GOOGLE_CLIENT_ID`를 검증합니다.
- 공급자 HTTP 요청에는 연결·읽기 제한 시간(예: 5초/10초)을 두고, 실패는 `provider_error`로 바꿉니다.
- 인가 코드, 토큰, Client Secret, state 값은 로그에 남기지 않습니다. 로그에는 `provider`와 오류 코드만 남깁니다.
- 302로 보내는 프론트 주소는 `FRONTEND_BASE_URL`로 고정합니다. 요청에서 받은 `next`, `redirect` 같은 값으로 이동하지 않습니다 (open redirect 방지).
- 운영(HTTPS)에서는 HTTPS Redirect URI와 `COOKIE_SECURE=true`를 사용합니다.

## 구현 순서와 확인

1. `social/models.py`, `users.has_password` 추가 → 마이그레이션
2. `providers/base.py`, `providers/google.py`, `state.py`, `service.py`, `router.py`
3. `test_import_rules.py` 층 표에 `social` 추가 (협의 후), `app/api.py`에 라우터 등록
4. 프론트 `meerkit/social/`로 옮기고 일반화
5. Kakao → Naver 공급자 파일 추가 (테이블·서비스 변경 없음)

```bash
cd backend
uv run alembic revision --autogenerate -m "add social accounts"
uv run ruff check --fix .
uv run alembic upgrade head
uv run pytest
```

테스트는 공급자 토큰·프로필 HTTP 응답을 mock하여 다음을 확인합니다.

- 연결된 계정 로그인 → 리프레시 쿠키 설정, 프론트 콜백으로 302
- 신규 가입 → 사용자·`VIEWER` 역할·약관 동의·연결 행이 함께 생성, `has_password=false`
- `state` 누락·불일치·만료, ID Token 검증 실패 → `state_mismatch` / `provider_error`
- 같은 이메일 기존 계정: `email_verified=true`면 연결, `false`면 `email_exists`
- 이메일 없는 프로필 신규 가입 → `email_required`, 약관 없음 → `terms_required`
- 비활성·탈퇴 계정 → `account_inactive`
- 공급자 요청 실패 시 사용자·연결 행이 남지 않음
- 같은 `provider_user_id` 값이 다른 공급자에 있어도 서로 다른 계정으로 처리됨
- 꺼진 공급자(`*_CLIENT_ID` 비어 있음) → 404
