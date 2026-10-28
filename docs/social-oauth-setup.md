# 소셜 로그인 설정 및 구현 명세 (Google · Kakao · Naver)

> 상태: **Google 백엔드 구현됨** (`backend/app/social/`). Kakao·Naver는 공급자 파일 하나와 환경 변수만 추가하면 붙도록 설계했고, 아직 만들지 않았습니다.
> 프론트는 바꾸지 않습니다. 이미 머지된 Google 버튼·콜백 화면(`frontend/src/meerkit/auth/`)의 계약에 서버를 맞췄습니다.

## 한눈에 보기

1. 사용자가 소셜 버튼을 누르면 브라우저가 `GET /api/auth/{provider}/login`으로 이동합니다. (`provider` = `google`, 이후 `kakao` | `naver`)
2. 서버는 `state`(+ PKCE)를 만들어 짧게 유지되는 서명 쿠키에 넣고, 공급자 인증 화면으로 302를 보냅니다.
3. 공급자가 `GET /api/auth/{provider}/callback?code=...&state=...`로 돌려보냅니다.
4. 서버는 `state`를 확인하고, 인가 코드를 토큰으로 바꾼 뒤 사용자 정보를 **공통 형식(`SocialProfile`)** 으로 바꿉니다.
5. `social_accounts`에서 `(provider, provider_user_id)`로 연결을 찾습니다. 연결이 있으면 로그인하고, 없으면 연결하거나 새로 가입시킵니다.
6. 리프레시 JWT를 httpOnly 쿠키(`meerkit_refresh`)로 설정하고 프론트 `/auth/{provider}/callback`으로 302를 보냅니다. 실패하면 `?error=<코드>`를 붙입니다.
7. 프론트 콜백 화면이 `POST /api/auth/refresh`로 액세스 토큰을 받습니다. 토큰은 주소(쿼리)에 넣지 않습니다.

```text
브라우저 ──GET /api/auth/google/login──▶ 서버 ──302──▶ Google
Google ──302 /api/auth/google/callback?code&state──▶ 서버 (토큰 교환·프로필·계정 처리, 쿠키 설정)
서버 ──302 /auth/google/callback[?error=...]──▶ 프론트 ──POST /api/auth/refresh──▶ 액세스 토큰
```

## 폴더 구조 (독립 킷 모듈)

소셜 로그인은 기존 `auth/`에 덧붙이지 않고 **별도 킷 패키지 `social`** 로 분리했습니다. `app/api.py`의 라우터 등록 한 줄을 지우면 소셜 로그인이 빠지고, 다른 킷은 그대로 동작합니다.

```text
backend/app/social/
├── __init__.py          # 설명만 둠 (router 를 import 하지 않음 — 아래 "주의" 참고)
├── config.py            # SocialSettings: SOCIAL_REDIRECT_BASE_URL, GOOGLE_CLIENT_ID·SECRET + 운영 검사
├── models.py            # SocialAccount (social_accounts 테이블)
├── schemas.py           # SocialProfile: 공급자 응답을 바꾼 공통 형식
├── repository.py        # social_accounts SQL
├── service.py           # 공급자와 무관한 계정 규칙: 찾기 → 연결 → 신규 가입
├── state.py             # state·PKCE·약관 동의를 담은 서명 쿠키 발급/검증
├── router.py            # GET /auth/{provider}/login, GET /auth/{provider}/callback
├── cleanup.py           # 개인정보를 지운 회원의 연결 행 삭제 (매일, purge 다음)
└── providers/
    ├── __init__.py      # 목록 PROVIDERS, get_provider(name): 켜진 공급자만
    ├── base.py          # OAuthProvider: 인증 URL, 토큰 교환, HTTP 공통(제한 시간·오류 변환)
    └── google.py        # Google (PKCE 사용, userinfo 엔드포인트)

backend/tests/social/
├── conftest.py              # Google 켜기 + httpx.MockTransport 로 Google 응답 흉내
├── test_social_login.py     # 302 위치, error 코드, 쿠키, 계정 처리 (HTTP)
└── test_social_accounts.py  # 공급자와 무관한 규칙, 비밀번호 없는 계정, cleanup
```

- **층 위치:** `social`은 `core`, `users`, `auth`만 import 합니다. 토큰 발급(`auth.service.issue_tokens`)과 `auth.router.set_refresh_cookie`를 재사용합니다. `social`을 import 하는 킷은 없습니다. `tests/test_import_rules.py`에 `"social": {"core", "users", "auth"}`를 추가했습니다. 이유와 검토한 대안은 [social-import-layer.md](social-import-layer.md)에 있습니다.
- **설정 분리:** `storage`·`llm`처럼 `social/config.py`가 자기 설정을 직접 읽습니다. `core/config.py`는 바꾸지 않았습니다. 프론트 주소는 기존 `FRONTEND_BASE_URL`을 씁니다.
- **주의:** `app/social/__init__.py`에서 router를 import 하지 않습니다. `alembic/env.py`가 `app.social.models`를 import 할 때 `router → auth → mail`까지 함께 로드되면, `env.py`의 `fileConfig()`(`disable_existing_loggers=True`)가 그 사이 만들어진 `app.*` 로거를 꺼 버려 로그 테스트가 실패합니다. 라우터는 `from app.social.router import router`로 가져옵니다.

### 공급자 계약 (`providers/base.py`)

공급자마다 다른 부분은 공급자 파일 안에서만 다룹니다. `service.py`와 `router.py`에는 `if provider == "kakao"` 같은 분기가 없습니다.

| 공급자 파일이 정하는 것                                              | 공통(`OAuthProvider`)이 처리하는 것                                           |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `name`, `authorize_endpoint`, `token_endpoint`, `scope`, `uses_pkce` | 인증 URL 만들기 (`response_type`, `client_id`, `redirect_uri`, `state`, PKCE) |
| `client_id`, `client_secret` (자기 설정값)                           | 토큰 교환 (`grant_type=authorization_code`, 같은 `redirect_uri`)              |
| `fetch_profile(tokens)` → `SocialProfile`                            | HTTP 제한 시간, 200 아닌 응답·JSON 오류를 `ProviderError`로 변환              |
| `extra_authorize_params()` (예: Google `prompt=select_account`)      | `is_configured()`: ID·시크릿이 모두 있어야 켜짐                               |

```python
@dataclass(frozen=True)
class SocialProfile:
    provider: str
    provider_user_id: str         # 항상 문자열 (카카오 id 는 숫자)
    email: str | None             # 공급자가 안 주거나 사용자가 동의하지 않으면 None
    email_verified: bool          # 공급자가 검증했다고 보장할 때만 True
    name: str | None = None
    profile_image_url: str | None = None
```

**새 공급자 추가 순서 (Kakao 예):** `providers/kakao.py`에 `OAuthProvider`를 상속해 만들기 → `providers/__init__.py`의 목록에 추가 → `social/config.py`에 `kakao_client_id`·`kakao_client_secret` 추가 → `.env.example`에 변수 추가 → `tests/social/`에 응답 흉내 테스트 추가. 테이블·service·router는 바꾸지 않습니다. 단, 프론트에는 지금 Google 버튼과 `/auth/google/callback` 화면만 있으므로, Kakao·Naver를 실제로 쓰려면 그때 프론트에 버튼과 콜백 화면을 따로 추가해야 합니다.

## 공급자별 설정

| 항목               | Google (구현됨)                                          | Kakao (예정)                                                        | Naver (예정)                               |
| ------------------ | -------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------ |
| 콘솔               | Google Cloud Console → OAuth 클라이언트(웹 애플리케이션) | Kakao Developers → 내 애플리케이션                                  | NAVER Developers → 애플리케이션 등록       |
| 인증 URL           | `https://accounts.google.com/o/oauth2/v2/auth`           | `https://kauth.kakao.com/oauth/authorize`                           | `https://nid.naver.com/oauth2.0/authorize` |
| 토큰 URL           | `https://oauth2.googleapis.com/token`                    | `https://kauth.kakao.com/oauth/token`                               | `https://nid.naver.com/oauth2.0/token`     |
| 프로필 URL         | `https://openidconnect.googleapis.com/v1/userinfo`       | `https://kapi.kakao.com/v2/user/me`                                 | `https://openapi.naver.com/v1/nid/me`      |
| scope              | `openid email profile`                                   | `account_email profile_nickname profile_image` (동의 항목에서 설정) | 콘솔의 제공 정보 선택에서 설정             |
| `provider_user_id` | `sub`                                                    | `id` (숫자 → 문자열)                                                | `response.id`                              |
| 이메일             | `email`                                                  | `kakao_account.email` (사용자가 동의하지 않으면 없음)               | `response.email`                           |
| `email_verified`   | `email_verified`                                         | `is_email_valid && is_email_verified`                               | 검증 여부 필드 없음 → `False`로 취급       |
| PKCE               | 사용                                                     | 사용하지 않음                                                       | 사용하지 않음                              |
| 비고               | ID Token은 쓰지 않음 (아래 "보안")                       | 이메일 필수 동의는 비즈 앱 전환이 필요할 수 있음                    | `state` 필수                               |

### Redirect URI

개발 환경은 Next가 `/api/*`를 FastAPI(8000)로 프록시하므로, 공급자 콜백도 프론트 주소의 `/api` 경로로 등록합니다. 이렇게 하면 서버가 설정하는 쿠키가 프론트와 같은 출처(localhost:3000)에 저장됩니다.

| 공급자 | 개발 Redirect URI                                |
| ------ | ------------------------------------------------ |
| Google | `http://localhost:3000/api/auth/google/callback` |
| Kakao  | `http://localhost:3000/api/auth/kakao/callback`  |
| Naver  | `http://localhost:3000/api/auth/naver/callback`  |

> **주의:** 공급자 콘솔에는 위의 `/api/...` 주소(서버가 받는 곳)만 등록합니다. 프론트 화면 주소 `http://localhost:3000/auth/google/callback`은 서버가 마지막에 302로 보내는 곳이므로 콘솔에 등록하지 않습니다.

Redirect URI는 공급자 콘솔, 인증 요청, 토큰 교환 요청에서 글자 하나까지 같아야 합니다. 운영 Redirect URI, 동의 화면, 승인된 도메인은 배포 전에 따로 등록합니다.

## 환경 변수

`backend/.env`에 설정합니다. **ID나 시크릿이 비어 있는 공급자는 꺼진 것**으로 보고 `/api/auth/{provider}/login`·`callback`이 404를 보냅니다. 실제 시크릿은 이 문서, `.env.example`, 프론트, 저장소에 기록하지 않습니다.

```dotenv
# Redirect URI = <SOCIAL_REDIRECT_BASE_URL>/<provider>/callback (공급자마다 URI 변수를 따로 두지 않음)
SOCIAL_REDIRECT_BASE_URL=http://localhost:3000/api/auth
# 로그인 후 돌아갈 프론트 주소 (기존 변수, 메일 링크와 같이 씀)
FRONTEND_BASE_URL=http://localhost:3000

GOOGLE_CLIENT_ID=934918016968-6m597koiqd4th9tg0qu8r2q4l16f0dda.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<Google Cloud Console에서 발급한 시크릿>

# 선택: 공급자 요청 제한 시간(초), 기본 10
SOCIAL_HTTP_TIMEOUT_SECONDS=10
```

운영(`APP_ENV=production`)에서 Google을 켰는데 `SOCIAL_REDIRECT_BASE_URL`이 https가 아니거나 localhost이면 서버가 시작하지 않습니다 (`social/config.py`의 `production_problems`). 운영에서는 같은 이름의 변수를 배포 플랫폼의 백엔드 서비스에 설정합니다.

## API 계약

| 요청                                                        | 동작                                                                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `GET /api/auth/{provider}/login`                            | state 쿠키를 설정하고 공급자 인증 화면으로 302. 꺼진·없는 공급자는 404                                  |
| `GET /api/auth/{provider}/login?agreed_terms=terms,privacy` | 동의한 약관 code를 state 쿠키에 함께 담음 (처음 온 계정의 가입에 사용). 지금 프론트는 보내지 않음       |
| `GET /api/auth/{provider}/callback?code&state`              | 공급자가 호출. 성공하면 리프레시 쿠키를 설정하고 `{FRONTEND_BASE_URL}/auth/{provider}/callback`으로 302 |
| 실패                                                        | `{FRONTEND_BASE_URL}/auth/{provider}/callback?error=<코드>`로 302                                       |

### state 쿠키 (`state.py`)

- `state`(무작위 32바이트), `code_verifier`(PKCE 공급자만), `agreed_terms`, `provider`를 `JWT_SECRET_KEY`로 서명해 httpOnly 쿠키 `meerkit_oauth_state`에 넣습니다. 만료는 10분, `Path=/api/auth/{provider}/callback`, `SameSite=Lax`입니다.
- 콜백에서 쿠키 서명·만료, 쿠키의 `provider`, 쿼리의 `state`가 모두 맞는지 확인합니다. 콜백 응답은 성공·실패와 관계없이 쿠키를 지웁니다 (한 번만 사용). 서버에 저장하지 않으므로 테이블이 필요 없습니다.

### 오류 코드 (`?error=`)

| 코드               | 상황                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| `access_denied`    | 공급자가 `error`를 붙여 돌려보냄 (사용자가 취소 등)                                              |
| `state_mismatch`   | state 쿠키가 없거나, 다르거나, 만료됨. 또는 `code`가 없음                                        |
| `provider_error`   | 토큰 교환·프로필 조회 실패 (시간 초과, 200 아닌 응답, 필수 값 없음)                              |
| `email_required`   | 공급자가 이메일을 주지 않았는데 신규 가입이 필요함                                               |
| `email_exists`     | 같은 이메일의 기존 계정이 있지만 공급자가 검증된 이메일이라고 보장하지 않음 (자동 연결하지 않음) |
| `already_linked`   | 그 회원에게 같은 공급자의 다른 계정이 이미 연결됨, 또는 동시에 같은 계정이 연결되는 충돌         |
| `terms_required`   | 처음 온 계정인데 현재 필수 약관 동의가 없음                                                      |
| `signup_failed`    | 그 밖의 가입 규칙 위반                                                                           |
| `account_inactive` | 비활성·탈퇴·삭제 계정                                                                            |

공급자 오류 원문, 인가 코드, 토큰 값, state 값은 오류 코드·응답·로그에 넣지 않습니다. 로그에는 `provider`, 오류 코드, 공급자 응답 상태 코드만 남깁니다.

> **현재 프론트에서의 동작:** 프론트 Google 버튼은 `agreed_terms`를 보내지 않습니다. 그래서 필수 약관(`terms`, `privacy`)이 켜져 있는 동안 **처음 온 Google 계정은 가입되지 않고 `terms_required`로 끝납니다.** 이미 연결된 계정의 로그인과, 검증된 이메일로 기존 회원에 연결하는 경우는 동작합니다. 프론트 콜백 화면은 오류 코드와 관계없이 같은 실패 화면을 보여 줍니다. 신규 가입까지 열려면 이후 프론트 작업에서 가입 화면의 Google 버튼이 동의한 약관을 `agreed_terms`로 붙여 보내야 합니다 (서버는 이미 받을 준비가 됨).

## `social_accounts` 테이블

사용자 한 명은 공급자마다 계정을 하나씩 연결할 수 있습니다 (Google 1개 + Kakao 1개 + ...). 공급자를 추가해도 **테이블 변경 없이** 행만 늘어나도록 공통 컬럼만 둡니다.

| 컬럼                       | 타입           | 제약                              | 목적                                                                                                                           |
| -------------------------- | -------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `id`                       | `Integer`      | PK                                | 기본 키                                                                                                                        |
| `user_id`                  | `Integer`      | FK `users.id` `ON DELETE CASCADE` | 연결된 MeerKit 사용자                                                                                                          |
| `provider`                 | `String(20)`   | NOT NULL                          | `google`, `kakao`, `naver`. DB enum을 쓰지 않아 공급자를 추가해도 마이그레이션이 필요 없음. 허용 값은 `providers/` 목록이 정함 |
| `provider_user_id`         | `String(255)`  | NOT NULL                          | 공급자가 발급한 변하지 않는 계정 식별자 (Google `sub`, Kakao `id`, Naver `response.id`)                                        |
| `email`                    | `String(255)`  | NULL 허용                         | 마지막 로그인 때 공급자가 준 이메일. Kakao·Naver는 동의에 따라 없을 수 있음                                                    |
| `email_verified`           | `Boolean`      | NOT NULL, 기본 `false`            | 공급자가 이메일 검증을 보장했는지                                                                                              |
| `name`                     | `String(50)`   | NULL 허용                         | 마지막 로그인 때 공급자 표시 이름 (마이페이지 "연결된 계정" 표시용)                                                            |
| `profile_image_url`        | `String(500)`  | NULL 허용                         | 공급자 프로필 이미지 주소 (표시용, 저장소에 복사하지 않음)                                                                     |
| `last_login_at`            | `DateTime(tz)` | NULL 허용                         | 이 공급자로 마지막 로그인한 시각                                                                                               |
| `created_at`, `updated_at` | `DateTime(tz)` | `TimestampMixin`                  | 연결 생성·수정 시각                                                                                                            |

인덱스·제약:

- `UNIQUE (provider, provider_user_id)`: 로그인 시 조회 키입니다. 카카오의 숫자 id처럼 공급자끼리 값이 겹칠 수 있으므로 두 컬럼을 합쳐 유일하게 둡니다.
- `UNIQUE (user_id, provider)`: 한 사용자에게 같은 공급자 계정을 두 개 연결하지 않습니다. 회원별 조회도 이 인덱스가 맡으므로 `user_id` 단독 인덱스는 두지 않습니다.

`email`·`name`·`profile_image_url`·`email_verified`는 로그인할 때마다 공급자 값으로 갱신하고, `users`의 값은 바꾸지 않습니다.

**저장하지 않는 것:** 공급자 Access Token, Refresh Token, ID Token, 프로필 원본 JSON. 계정 식별에는 필요 없고, 새면 피해가 큽니다. 공급자 API를 쓰는 기능(예: 카카오톡 메시지)이 생기면 그때 암호화 저장을 따로 설계합니다.

### `users.has_password` (추가 컬럼)

| 컬럼           | 타입                             | 목적                           |
| -------------- | -------------------------------- | ------------------------------ |
| `has_password` | `Boolean`, NOT NULL, 기본 `true` | 소셜로만 가입한 계정은 `false` |

- `account` 킷은 층 규칙상 `social`을 import 할 수 없으므로, "비밀번호가 있는 계정인지"는 `users`에 둡니다. 기존 회원은 기본값 `true`가 채워집니다.
- 소셜 신규 회원도 `hashed_password`에는 아무도 모르는 무작위 값의 해시를 넣어 NOT NULL을 유지합니다 (`users.service.create_user(password=None)`).
- `has_password=false`일 때:
  - 아이디·비밀번호 로그인: 없는 계정과 같은 `401 INVALID_CREDENTIALS` (가입 방식을 알려 주지 않음)
  - 비밀번호 변경(`PATCH /users/me/password`): `400 PASSWORD_NOT_SET`
  - 탈퇴(`DELETE /users/me`): `400 PASSWORD_NOT_SET`
- 비밀번호 찾기 메일로 비밀번호를 설정하면 `has_password=true`가 되어 위 기능이 모두 열립니다.

## 계정 처리 규칙 (`service.py`)

공급자와 무관하게 `SocialProfile`만 보고 판단합니다.

1. **연결 있음:** `(provider, provider_user_id)`로 찾은 사용자가 비활성·탈퇴·삭제면 `account_inactive`. 정상이면 연결 행의 공급자 값과 `last_login_at`, `users.last_login_at`을 갱신하고 로그인합니다.
2. **연결 없음 + 같은 이메일의 기존 사용자 있음:**
   - `email_verified=false`(Naver 전체, 검증되지 않은 Kakao 이메일)이면 자동 연결하지 않고 `email_exists`. 남의 계정을 가로채는 것을 막기 위해서입니다.
   - `email_verified=true`이면 사용자 상태를 확인하고(비활성 계정을 다시 활성화하지 않음), 같은 공급자의 다른 계정이 이미 연결돼 있으면 `already_linked`, 아니면 연결 행을 만들고 로그인합니다.
3. **연결 없음 + 기존 사용자 없음 (신규 가입):**
   - 이메일이 없으면 `email_required`.
   - `users.service.create_user(..., password=None, agreed_terms=state 쿠키의 값, commit=False)`로 회원을 만듭니다. 필수 약관이 빠졌으면 `terms_required`.
   - 역할 `VIEWER`, `login_id`는 `{provider}_` + 무작위 10자(예: `google_3f9a1c2b7d`), `name`은 공급자 이름(없으면 이메일 앞부분), `has_password=false`, `email_verified_at`은 `email_verified=true`일 때만 기록합니다.
   - 회원, 약관 동의, 연결 행을 **한 트랜잭션**으로 저장합니다. 유일 제약 충돌이 나면 모두 되돌리고 `already_linked`.

### 탈퇴·파기

- 사용자 행이 지워지면 `ON DELETE CASCADE`로 연결 행도 지워집니다.
- 개인정보 파기(`app.users.purge`)는 사용자 행을 남기므로, 이어서 `uv run python -m app.social.cleanup`이 `deleted_at`이 기록된 회원의 연결 행을 지웁니다. `.github/workflows/account-purge.yml`에 추가했습니다 (`--dry-run` 지원).
- 탈퇴(`deactivated_at`)만 한 상태에서는 연결 행이 남지만, 그 계정의 소셜 로그인은 `account_inactive`로 막힙니다.
- 공급자 쪽 연결 끊기(Kakao unlink, Naver 토큰 삭제)는 토큰을 저장하지 않으므로 이번 범위에 넣지 않았습니다.

## 보안

- `state` 검증을 생략하지 않습니다. Google은 PKCE(`S256`)도 함께 사용합니다.
- **ID Token은 쓰지 않습니다.** 토큰 교환(클라이언트 시크릿 포함)과 userinfo 요청 모두 서버가 Google에 직접 TLS로 보내고, 사용자 정보는 userinfo 응답에서 받습니다. 그래서 ID Token 서명 검증(JWKS)이 필요 없습니다. 다른 공급자도 같은 방식(프로필 엔드포인트)을 씁니다.
- 공급자 HTTP 요청에는 제한 시간(`SOCIAL_HTTP_TIMEOUT_SECONDS`, 기본 10초)을 두고, 실패는 `provider_error`로 바꿉니다.
- 302로 보내는 프론트 주소는 `FRONTEND_BASE_URL`로 고정합니다. 요청에서 받은 `next`, `redirect` 같은 값으로 이동하지 않습니다 (open redirect 방지).
- 운영(HTTPS)에서는 HTTPS Redirect URI와 `COOKIE_SECURE=true`를 사용합니다. state 쿠키와 리프레시 쿠키 모두 이 값을 따릅니다.

## 변경 파일 목록

### 새로 만든 파일

| 파일                                                                          | 내용                                                                 |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `backend/app/social/__init__.py`                                              | 모듈 설명 (router 를 import 하지 않는 이유)                          |
| `backend/app/social/config.py`                                                | `SocialSettings`, 운영 검사 `production_problems()`                  |
| `backend/app/social/models.py`                                                | `SocialAccount` (`social_accounts`)                                  |
| `backend/app/social/schemas.py`                                               | `SocialProfile`                                                      |
| `backend/app/social/repository.py`                                            | 연결 조회·추가, 삭제된 회원의 연결 세기·지우기                       |
| `backend/app/social/service.py`                                               | `login_or_signup()`, `SocialLoginError`                              |
| `backend/app/social/state.py`                                                 | state·PKCE 서명 쿠키 (`meerkit_oauth_state`)                         |
| `backend/app/social/router.py`                                                | `GET /auth/{provider}/login`, `GET /auth/{provider}/callback`        |
| `backend/app/social/cleanup.py`                                               | `uv run python -m app.social.cleanup [--dry-run]`                    |
| `backend/app/social/providers/__init__.py`                                    | 공급자 목록 `PROVIDERS`, `get_provider()`                            |
| `backend/app/social/providers/base.py`                                        | `OAuthProvider`, `ProviderError`                                     |
| `backend/app/social/providers/google.py`                                      | `GoogleProvider`                                                     |
| `backend/alembic/versions/1b582544577f_add_social_accounts_and_users_has_.py` | `social_accounts` 생성, `users.has_password` 추가 (downgrade 확인함) |
| `backend/tests/social/conftest.py`                                            | `google`, `google_login` 픽스처 (Google 응답 흉내)                   |
| `backend/tests/social/test_social_login.py`                                   | HTTP 흐름 테스트 15개                                                |
| `backend/tests/social/test_social_accounts.py`                                | 계정 규칙·비밀번호 없는 계정·cleanup 테스트 7개                      |

### 수정한 파일

| 파일                                    | 변경                                                                                                                                                  |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `backend/app/users/models.py`           | `User.has_password` 추가                                                                                                                              |
| `backend/app/users/service.py`          | `create_user(password=None)`이면 비밀번호 없는 계정, `commit=False` 인자, 비밀번호 없는 계정의 `withdraw` → `PASSWORD_NOT_SET`                        |
| `backend/app/auth/service.py`           | `has_password=false` 계정의 아이디 로그인 거부(`INVALID_CREDENTIALS`), `change_password` → `PASSWORD_NOT_SET`, 비밀번호 재설정 시 `has_password=true` |
| `backend/app/api.py`                    | `social` 라우터 등록                                                                                                                                  |
| `backend/app/main.py`                   | 시작 검사에 `social` 운영 검사 추가                                                                                                                   |
| `backend/alembic/env.py`                | `import app.social.models`                                                                                                                            |
| `backend/tests/test_import_rules.py`    | 층 표에 `"social": {"core", "users", "auth"}`                                                                                                         |
| `backend/.env.example`                  | `SOCIAL_REDIRECT_BASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (빈 값)                                                                        |
| `.github/workflows/account-purge.yml`   | purge 다음에 `app.social.cleanup` 실행                                                                                                                |
| `docs/architecture.md`                  | 킷 다이어그램·폴더 구조·인증 방식·API 표에 `social` 추가                                                                                              |
| `CLAUDE.md`                             | 킷 위치·의존 방향에 `social` 추가                                                                                                                     |
| `docs/social-oauth-setup.md`            | 이 문서                                                                                                                                               |
| `docs/social-import-layer.md` (새 파일) | 층 표에 `social`을 추가한 근거 (팀 협의용)                                                                                                            |

**바꾸지 않은 것:** `frontend/` 전체, `backend/app/core/`.

## 확인

```bash
cd backend
uv run ruff check .
uv run alembic upgrade head      # downgrade -1 → upgrade head 도 확인함
uv run pytest                    # 183개 통과 (소셜 22개 포함)
```

테스트는 Google 토큰·userinfo HTTP 응답을 `httpx.MockTransport`로 흉내 내어 다음을 확인합니다.

- 꺼진·없는 공급자 → 404
- 로그인 시작 → Google 주소, `client_id`, `redirect_uri`, `scope`, `state`, PKCE `S256`, httpOnly state 쿠키
- 신규 가입(약관 동의) → 회원·`VIEWER`·약관 동의 2건·연결 행, `has_password=false`, 리프레시 쿠키로 `/auth/refresh`·`/users/me` 성공
- 약관 없이 신규 가입 → `terms_required`, 데이터 없음
- 연결된 계정 재로그인 → 연결 행 공급자 값만 갱신, `users`는 그대로
- `state` 위조·쿠키 없음 → `state_mismatch`, Google 요청 안 함 / state 쿠키는 콜백에서 지워짐
- 사용자 취소 → `access_denied`
- 토큰 교환 400·userinfo 500 → `provider_error`, 데이터 없음
- 이메일 없음 → `email_required`
- 같은 이메일 기존 회원: 검증된 이메일이면 연결(비밀번호 유지), 아니면 `email_exists`
- 같은 이메일의 다른 Google 계정 → `already_linked`
- 비활성·탈퇴 계정 → `account_inactive`
- 같은 `provider_user_id`가 다른 공급자에 있어도 서로 다른 회원 / 한 회원에 여러 공급자 연결
- 비밀번호 없는 계정: 아이디 로그인 401, 비밀번호 변경·탈퇴 `PASSWORD_NOT_SET`, 비밀번호 재설정 후 로그인 가능
- cleanup: 개인정보를 지운 회원의 연결만 삭제, dry-run, 재실행 안전
