# DB 접근 · 권한 규칙 (Supabase 미사용)

> 이 프로젝트는 Supabase를 쓰지 않는다. 스택은 **FastAPI + SQLAlchemy + PostgreSQL 16 + Alembic**이라 RLS(행 수준 보안)가 없다.
> Supabase를 도입하면 이 문서에 RLS 규칙(정책이 같은 테이블을 다시 조회해 무한 재귀가 생기는 문제, 외래키가 걸린 마이그레이션 순서)을 추가한다.

## 권한은 서버가 판단한다

- Always: 권한은 서버가 최종 판단한다. 프론트에서 버튼을 숨기는 것은 보호가 아니다. (역할 검사는 `backend/app/core/principal.py`, 현재 사용자 채우기는 `backend/app/auth/principal.py`)
- Always: SQL은 `repository`에만 둔다. 흐름은 `router → service → repository`다.
- Never: 응답에 `hashed_password`를 포함하지 않는다. 비밀번호는 argon2로 해시한다 (`backend/app/core/security.py`).
- Always: 리프레시 토큰은 httpOnly 쿠키(`meerkit_refresh`)로만 보낸다 (`backend/app/auth/router.py`). 자바스크립트가 읽을 수 없어야 XSS로 탈취되지 않는다.
- Always: 비밀번호 재설정 요청은 가입 여부와 관계없이 항상 같은 응답(202)을 준다. 재설정 토큰·이메일 인증번호는 `core.security.hash_secret`(HMAC)으로 해시해 저장하고, 짧은 만료·단일 사용으로 한다 (`backend/app/auth/service.py`).
- Always: 로그인 잠금은 서버가 판단한다 (연속 5회 실패 → 5분, `429` + `Retry-After`). 브라우저 쪽 잠금(`frontend/src/meerkit/auth/lockout.ts`)은 안내용이다.
- Always: 비밀번호를 바꾸면 `password_changed_at`을 기록한다. 그 이전에 발급된 토큰은 `auth.service.user_from_token`이 거부한다.
- Never: 탈퇴 계정을 바로 지우지 않는다. `deactivated_at`을 기록하고, 보관 기간 뒤 `app.users.purge`가 개인정보만 지운다(행은 유지).

## 스키마

- `users`와 `roles`는 `user_roles`로 연결한다 (`ondelete="CASCADE"`, 한 사람이 여러 역할). 역할 `MASTER`(1), `OWNER`(2), `VIEWER`(3), `WRITER`(4)는 마이그레이션으로 넣고, id는 프론트 `frontend/src/meerkit/roles.ts`와 맞춘다.
- 약관은 `terms`(code + version), 동의 기록은 `user_term_agreements`. code는 프론트 `meerkit.config.ts`의 `signup.terms[].id`와 같아야 한다. 문구가 바뀌면 version을 올린 새 행을 넣고 이전 행은 `is_active=false`.
- 권한 표(`permissions`, `role_permissions`)는 이번 범위가 아니다 (`CLAUDE.md` 3장, `docs/future-extensions.md`).

## 프론트와 아직 맞지 않는 곳 (프론트 연동 때 프론트 쪽을 고친다)

역할 4종, 아이디 로그인, `deactivated_at`·`deleted_at` 탈퇴는 백엔드에 반영됐다 (`feat/kit-auth-contract`). 남은 차이:

| 항목 | 프론트 현재 | 백엔드 |
| --- | --- | --- |
| 사용자 역할 | `user.role` 하나 (`{id, name}`) | `user.roles` 배열 (`[{id, name}]`), 여러 역할 |
| 역할 변경 API | `PATCH /users/{id}/role` `{role_id}` | `PUT /users/{id}/roles` `{roles: ["MASTER", ...]}` |
| 탈퇴 표시 | `deleted_at` | 탈퇴 시각은 `deactivated_at`, `deleted_at`은 개인정보를 지운 시각 |
| 이메일 인증 | `signup.emailVerification: false` | 기본 필수 (`SIGNUP_EMAIL_VERIFICATION_REQUIRED=true`). 프론트도 `true`로 맞춘다 |
| 탈퇴 API | 없음 | `DELETE /users/me` `{password}` |
