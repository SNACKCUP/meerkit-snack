# 서버 작업 전달 (프론트 PR #28 기준)

프론트(PR [sensibly00-glitch/meerkit#28](https://github.com/sensibly00-glitch/meerkit/pull/28))가 호출하지만 서버에 아직 없는 API 3개입니다.
명세는 Docs의 API 페이지(`/docs/api-auth`, `/docs/api-users-me`)에 "서버 구현 예정"으로 올라가 있습니다.
스키마 제약은 `backend/app/*/schemas.py`를 보고 적었습니다. 저장 방식 등은 제안입니다.

## 1. 아이디 찾기 `POST /api/auth/id/forgot` (인증 없음)

- 요청: `{ "email": "writer01@example.com" }` (`ForgotIdRequest`, email 최대 255자)
- 응답: **202**, 본문 없음
- 가입된 이메일이면 일부를 가린 아이디(예: `wr****01`)를 메일로 보낸다.
- 보안상 **가입 여부와 관계없이 항상 같은 응답**(202)을 준다. `password/forgot`과 같은 방식이다.
- 메일은 `app.mail.send_mail`로 보내고, 라우터에서 `BackgroundTasks`로 넘긴다.
- 아이디 전체를 로그에 남기지 않는다.
- 탈퇴·비활성 계정은 기존 비밀번호 찾기와 같은 정책으로 처리한다.

## 2. 프로필 이미지 올리기 `POST /api/users/me/avatar` (Bearer)

- 요청: `multipart/form-data`, 필드 이름은 `file` 하나
- 프론트가 먼저 확인하지만 **서버에서도 검사**한다.
  - 형식: JPG, PNG, WEBP만 허용
  - 크기: 최대 2MB
  - 확장자가 아니라 파일 내용(매직 바이트)으로 확인
- 저장 후 `avatar_url`을 채워 **`UserRead`(내 정보)를 200으로 반환**한다.
- `users.avatar_url`(String 500)은 모델에 이미 있어서 마이그레이션은 필요 없다.
- 파일 이름은 사용자가 보낸 것을 쓰지 않고 서버가 새로 만든다.
- 새로 올리면 이전 파일은 지운다.
- 저장소는 로컬 디스크든 외부 스토리지든 정하기 나름이지만, `avatar_url`이 브라우저에서 바로 열리는 주소여야 한다 (프록시 경로면 `/api/...`).

## 3. 프로필 이미지 삭제 `DELETE /api/users/me/avatar` (Bearer)

- 파일을 지우고 `avatar_url`을 비운다.
- 응답: `UserRead` 200

## 정해야 할 것

- **이름 길이:** 프론트는 이름 최소 2자, 최대 10자인데 서버는 `name` 1~50자다. 기준을 정하면 `schemas.py`(signup, `ProfileUpdate`)와 Docs 표를 같이 고친다. ("백 최대 15"로 맞출지 결정 필요)
- **서버 재시작:** 8000번 서버가 예전 코드로 떠 있어서 Swagger에 한글 설명이 일부 보이지 않는다.
- **Docs 갱신:** 서버 구현 후 `frontend`에서 `node scripts/gen-api-spec.mjs`를 실행하면 "서버 구현 예정" 표시가 실제 명세로 바뀐다 (프론트 담당).
- `requirements` 엔드포인트는 킷 Docs에서 제외해 두었다.
