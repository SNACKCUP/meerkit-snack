# DB 접근 · 권한 규칙 (Supabase 미사용)

> 이 프로젝트는 Supabase를 쓰지 않는다. 스택은 **FastAPI + SQLAlchemy + PostgreSQL 16 + Alembic**이라 RLS(행 수준 보안)가 없다.
> Supabase를 도입하면 이 문서에 RLS 규칙(정책이 같은 테이블을 다시 조회해 무한 재귀가 생기는 문제, 외래키가 걸린 마이그레이션 순서)을 추가한다.

## 권한은 서버가 판단한다

- Always: 권한은 서버가 최종 판단한다. 프론트에서 버튼을 숨기는 것은 보호가 아니다. (역할 검사는 `backend/app/permissions/deps.py`, `roles.py`)
- Always: SQL은 `repository`에만 둔다. 흐름은 `router → service → repository`다.
- Never: 응답에 `hashed_password`를 포함하지 않는다. 비밀번호는 argon2로 해시한다 (`backend/app/core/security.py`).
- Always: 리프레시 토큰은 httpOnly 쿠키(`meerkit_refresh`)로만 보낸다 (`backend/app/auth/router.py`). 자바스크립트가 읽을 수 없어야 XSS로 탈취되지 않는다.
- 설계 기준(구현할 때 지킨다): 비밀번호 재설정 요청은 가입 여부와 관계없이 항상 같은 응답을 주고, 토큰은 해시로 저장하며 짧은 만료·단일 사용으로 한다. 로그인 잠금(브라우저 쪽)은 안내용이라 서버에서도 똑같이 막는다.

## 스키마

- `users`와 `roles`는 `user_roles`로 연결한다 (`ondelete="CASCADE"`). 초기 역할 `USER`, `ADMIN`은 마이그레이션의 `bulk_insert`로 넣는다.
- 권한 표(`permissions`, `role_permissions`)는 이번 범위가 아니다 (`CLAUDE.md` 3장, `docs/future-extensions.md`).

## 프론트 설계와 아직 맞지 않는 곳 (연동 전에 정렬)

| 항목 | 프론트 docs | 백엔드 현재 |
| --- | --- | --- |
| 역할 | MASTER / OWNER / VIEWER / WRITER 4종 | `USER`, `ADMIN` 2종 |
| 로그인 식별자 | 아이디(`user_id`) | 이메일 (`users.email`) |
| 탈퇴 | `deleted_at` 소프트 삭제 | `is_active` 플래그만 있음 |

이 표는 서버 구현과 프론트를 연결하기 전에 한 번 맞춘다. 어느 쪽을 바꿀지는 팀이 정한다.
