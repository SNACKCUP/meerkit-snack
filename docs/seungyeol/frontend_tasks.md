# 프론트 작업 순서 (회원가입 테이블 설계 회의 반영)

> 기준 문서: `회원가입_테이블_설계_회의_정리.md`, `Meerkit_structure_v3.md`
> 브랜치: `feat/frontend-meerkit-structure`
> 진행 규칙: 위에서부터 순서대로 하고, 끝낸 항목은 `[x]`로 바꾼다.

## 0. v3 문서와 달라지는 점 (회의 기준으로 프론트에 반영)

| 항목        | v3                           | 회의 정리 (이번 작업 기준)                         |
| ----------- | ---------------------------- | -------------------------------------------------- |
| 로그인 식별 | 이메일                       | `user_id` (로그인 ID)                              |
| 가입 입력   | 이메일, 비밀번호, 이름(선택) | `user_id`, `email`, `name`(필수), `password`       |
| 역할        | admin / user, `user_roles`   | MASTER / OWNER / VIEWER / WRITER, `users.role_id`  |
| 역할 개수   | 여러 개                      | 사용자당 1개                                       |
| 관리 API    | `/admin/users...`            | `/users`, `/users/{id}/role`, `DELETE /users/{id}` |
| 내 정보 API | `/auth/me`                   | `/users/me`                                        |
| 계정 상태   | 활성/비활성 토글             | `is_active`, `deleted_at`(소프트 삭제)             |

- 가입 시 역할은 화면에서 고르지 않는다. 서버가 기본 역할을 부여한다 (회의 8번).
- 화면에서 버튼을 숨기는 것은 편의일 뿐, 권한 검증은 백엔드 몫이다.
- 위 값은 아직 팀 확정 전이라 `meerkit/types.ts`와 `meerkit/roles.ts` 한 곳에서만 정의한다. 바뀌면 거기만 고친다.

## 1. 웰컴 페이지 정리

- [x] 헤더 삭제
- [x] "더 빨리, 더 많이 시작하세요" 제거, 부가 텍스트 최소화
- [x] 퀵 스타트 제거
- [x] 하단 카드 영역 제거
- [x] 푸터 제거
- [x] 버튼 3개: 로그인 / 회원가입 / 사용 설명서 (GitHub 링크)
- [x] 로그인·회원가입 버튼은 각각 해당 모달을 연다
- [x] 로그인 상태에서는 버튼 대신 사용자 메뉴를 보여 준다

## 2. 타입·API 정리

- [x] `types.ts`: User(`id`, `user_id`, `email`, `name`, `role`, `is_active`, `created_at`, `updated_at`, `deleted_at`), Role
- [x] `roles.ts`: 역할 4종(id, name, description, CRUD 표)
- [x] `api/auth.ts`: 로그인 `user_id`, 내 정보 `/users/me`
- [x] `api/users.ts`: 목록, 역할 변경(`role_id`), 삭제

## 3. 로그인·회원가입 폼

- [x] LoginForm: `user_id`, `password`
- [x] SignupForm: `user_id`, `email`, `name`, `password`
- [x] 입력값 검증 (필수, 이메일 형식, 비밀번호 8자 이상)
- [x] 서버 오류 메시지 표시 (중복 ID/이메일 등)

## 4. 유저 관리 화면

- [x] 유저 테이블: id, user_id, email, name, 역할, 상태, 가입일
- [x] 역할 변경: 4개 역할 선택, 변경 즉시 반영
- [x] 삭제(탈퇴 처리) 버튼과 상태 배지(활성 / 비활성 / 삭제됨)
- [x] 접근 가드: MASTER만 `/admin/members` 접근

## 5. docs 페이지 (기존 /ui 대체)

- [x] 라우트 `/ui` → `/docs`, 환경 변수 `NEXT_PUBLIC_SHOW_DOCS_PAGE`
- [x] 왼쪽 사이드바, 링크 클릭 시 앵커 이동, 스크롤 위치에 맞춰 활성 표시
- [x] Introduction
- [x] Installation
- [x] Components
  - [x] 로그인
  - [x] 회원가입
  - [x] 유저 테이블 (필드 표 + 미리보기)
  - [x] 유저 권한 변경 테이블 (역할 표 + 미리보기)
- [x] 목 데이터만 사용 (백엔드 없이 열림)

## 6. 마무리

- [x] `npm run lint`, `npx tsc --noEmit`, `npm run build`
- [x] 브라우저에서 `/`, `/docs` 확인, 모달 동작 확인
- [ ] 커밋 (푸시·PR은 요청 시)

## 남은 질문 (팀 확인 필요)

1. 가입 기본 역할은 무엇인가 (VIEWER 제안)
2. MASTER와 OWNER의 관리자 화면 접근 범위 (이번엔 MASTER만)
3. 시드 관리자 계정을 `user_id` 기준으로 만들 것인가
4. v3 문서(admin/user, 이메일 로그인)를 회의 기준으로 고칠 것인가
