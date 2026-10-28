# `social` 킷의 층 규칙 (`test_import_rules.py` 변경 근거)

> 대상: PR #38 리뷰어. CLAUDE.md의 "킷 층 표를 바꾸려면 팀과 먼저 협의"에 따라, 층 표에 한 줄을 추가한 이유를 정리합니다.
> 관련 문서: [social-oauth-setup.md](social-oauth-setup.md), [architecture.md](architecture.md)

## 변경 내용

`backend/tests/test_import_rules.py`의 `ALLOWED_KIT_IMPORTS`에 한 줄을 추가했습니다. 기존 킷의 허용 목록은 바꾸지 않았습니다.

```python
ALLOWED_KIT_IMPORTS: dict[str, set[str]] = {
    ...
    "account": {"core", "users", "auth", "permissions"},
    "social": {"core", "users", "auth"},   # 추가
}
```

## 1. 왜 필요한가: 표에 없는 패키지는 테스트가 막습니다

```python
def test_every_kit_package_is_in_the_table():
    """새 공통 패키지를 만들면 이 표에 층을 정해 넣어야 합니다."""
    packages = {p.name for p in APP_DIR.iterdir() if p.is_dir() and (p / "__init__.py").exists()}
    assert packages - {"features"} <= set(ALLOWED_KIT_IMPORTS)
```

`backend/app/` 아래에 `__init__.py`가 있는 폴더는 `features`만 빼고 모두 층 표에 있어야 합니다. `app/social/`을 새 킷 패키지로 만들었으므로, 표에 층을 정해서 넣지 않으면 이 테스트가 실패합니다.

## 2. 왜 `{"core", "users", "auth"}`인가

허용 목록은 `social`이 실제로 import 하는 킷과 같습니다.

| 허용 | 실제로 쓰는 곳 | 이유 |
| --- | --- | --- |
| `core` | 설정, DB 세션, `Base`·`TimestampMixin`, JWT `ALGORITHM`, 로깅 | 모든 킷의 기반 |
| `users` | `social/service.py`: `users.repository.get_by_email`, `users.service.create_user`, `UserError` / `social/repository.py`: `User` | 이메일로 기존 회원 찾기, 신규 회원 만들기 (약관·기본 역할·중복 검사 규칙을 그대로 재사용) |
| `auth` | `social/router.py`: `auth.service.issue_tokens`, `auth.router.set_refresh_cookie` | 일반 로그인과 똑같은 리프레시 토큰·쿠키(`meerkit_refresh`, 경로 `/api/auth`)를 발급 |

`mail`, `storage`, `permissions`, `account`는 쓰지 않으므로 넣지 않았습니다. 꼭 필요한 것만 허용해서, 나중에 실수로 다른 킷을 import 하면 테스트가 잡습니다.

## 3. 기존 의존 방향을 바꾸지 않습니다

```text
core ← users ← auth ← permissions ← account
                  ↖
                   social      (social 을 import 하는 킷은 없음)
```

- `social`은 맨 위에 붙는 잎 노드입니다. 다른 킷은 `social`을 모르고, `app/api.py`만 라우터를 등록합니다.
- 그래서 `app/social/` 폴더와 `api.py`의 등록 한 줄을 지워도 나머지 킷은 그대로 동작합니다.
- `auth`나 `users`가 `social`을 import 하면 순환이 생깁니다. 이 표가 그것을 막습니다. 같은 이유로 "소셜로만 가입한 계정인지"는 `social_accounts`가 아니라 `users.has_password`에 두었습니다 (`account` 킷이 `social`을 import 하지 않아도 알 수 있게).

## 4. 검토한 다른 방법

| 방법 | 표 변경 | 채택하지 않은 이유 |
| --- | --- | --- |
| `auth/` 안에 넣기 | 필요 없음 | 기존 모듈에 덧붙이지 않고 독립 폴더로 분리한다는 방침과 맞지 않음. Kakao·Naver가 추가되면 `auth`가 계속 커짐 |
| `features/social`로 옮기기 | 필요 없음 | `features/`는 Fork 한 사람이 지우고 바꾸는 서비스 코드 자리. 로그인은 모든 서비스가 쓰는 공통 기능이라 위치가 맞지 않음 |
| `auth`를 import 하지 않고 토큰·쿠키 코드를 복사 | `{"core", "users"}`로 줄어듦 | 쿠키 이름·경로·만료 규칙이 두 군데로 갈라져, 한쪽만 고치면 로그인이 깨질 위험 |

## 협의할 것

기존 킷의 의존 방향은 바뀌지 않습니다. 확인받을 것은 **"새 킷 `social`을 `auth` 위의 잎 층(`core`·`users`·`auth`만 사용)에 둔다"** 하나입니다. 합의되면 CLAUDE.md 1장과 `architecture.md`의 의존 방향 설명(이 PR에서 이미 갱신함)을 그대로 유지합니다.
