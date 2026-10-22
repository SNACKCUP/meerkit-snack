# docs 페이지별 팀 전달 사항

> 대상: **Meerkit 팀 내부.** 킷 사용자가 읽을 내용이 아니라서 docs(`/docs`)에서는 뺐다.
> docs는 "킷을 가져다 쓰는 개발자"를 위한 설명서다. 팀 회의, 내부 결정, 일정 같은 맥락은 여기(md)에만 둔다.

## 작성 규칙

| 구분 | 규칙 |
| --- | --- |
| 쓰지 않는다 | "팀 회의에서…", "팀이 확정해야…", "우리가 정한…", 내부 일정·결정 과정, 팀원에게 하는 말 |
| 써도 된다 | 현재 **구현 상태**를 알리는 안내. 예: "백엔드는 아직 구현 전이라 서버 쪽 항목은 설계 기준(예정)입니다. 구현되는 대로 이 표를 실제 동작에 맞춰 갱신합니다." |
| 사용자 기준으로 바꿔 쓴다 | 팀 결정은 사용자에게 필요한 "권장/주의" 형태로 (예: "OWNER는 본인 소유 데이터만 관리하도록 제한하는 것이 안전합니다.") |

현재 docs에 남아 있는 **상태 안내 문구**(허용)의 위치:
- Security 페이지 맨 위
- Deployment 페이지 맨 위
- Project Structure의 Backend 섹션
- Guides › Add a role의 "백엔드는 아직 구현 전" 안내

---

## 페이지별 정리

### API Reference
- **뺀 문구:** "이 목록은 팀 회의의 설계안입니다. 실제 URL 규칙에 맞춰 조정할 수 있으며…"
- **남긴 것:** "서비스의 API 주소 규칙이 다르다면 `src/meerkit/api/`의 함수만 고치면 된다"(사용자용 안내로 바꿔 Client functions 앞에 둠)
- **팀이 알아야 할 것:** 엔드포인트 경로(`/auth/*`, `/users*`)는 회의 설계안 기준이며 **백엔드 구현 시 이 문서와 맞춰야 한다.** 다르게 정해지면 `frontend/src/meerkit/api/` 한 곳만 고치면 된다.

### Roles & Permissions
- **뺀 문구:** "이 표는 회의에서 정리한 권장안입니다. 실제 권한 범위는 팀이 확정해야…"
- **남긴 것:** "권한 범위는 서비스 정책에 맞게 정하세요. 특히 OWNER는 본인 소유 데이터만 관리하도록 제한하는 것이 안전합니다."
- **팀 결정 필요:**
  1. CRUD 매트릭스(MASTER/OWNER/VIEWER/WRITER)는 화이트보드 기반 **권장안**이다. 실제 범위 확정이 필요하다.
  2. OWNER의 "본인 소유 데이터"를 구현하려면 소유 관계(예: `projects` 테이블)가 먼저 필요하다. 없으면 OWNER가 MASTER와 구분되지 않는다.
  3. MASTER와 OWNER의 관리자 화면 접근 범위(현재는 MASTER만).

### Authentication
- **뺀 문구:** "이메일 인증 (Signup Form 페이지에 설계 제안)" (Not included yet 목록에서)
- **상태:** 이메일 인증은 이제 **선택 기능으로 구현**되어 있다(코드 방식). Related features 표로 옮겼다.
- **팀 결정 필요:** 링크 방식 인증은 미구현. 서비스 기본값을 켜짐/꺼짐 중 무엇으로 둘지(현재 꺼짐).

### FAQ
- **뺀 섹션:** "Contributing" (킷 코드는 `src/meerkit/` 안에서만 수정 / 새 컴포넌트를 만들면 docs 페이지도 추가 / 사용량 기능은 범위 밖)
- **이유:** 킷 개발자(우리 팀)용 규칙이라 사용자가 볼 필요가 없다.
- **옮길 곳:** 저장소 루트 `CONTRIBUTING.md`에 아래 규칙으로 옮기는 것을 권장.
  - 킷 코드는 `frontend/src/meerkit/` 안에서만 수정한다.
  - 새 킷 컴포넌트를 만들면 docs 페이지(`docs/content`, `docs/nav.ts`)도 추가한다.
  - 사용량 관련 기능은 이번 범위가 아니며 향후 확장으로 둔다.
  - 콘솔 에러(아래 "작업 점검" 참고)를 남기지 않는다.

### Installation
- **현황:** 문서에는 `npx create-meerkit my-app`, `npx meerkit setup`이 나오지만 **둘 다 아직 구현되지 않았다.**
- **팀 결정 필요:** 구현 전까지 "준비 중" 안내 문구(상태 안내라 허용)를 넣을지, 구현 일정을 맞출지. 발표에서 "된다"고 말하지 않도록 주의.

### Deployment / 문서 사이트 분리
- 사용자용 배포 안내만 docs에 둔다. 문서 사이트를 따로 배포하는 팀 내부 설정(`NEXT_PUBLIC_DOCS_ONLY` 등)은 [docs_site_deployment.md](docs_site_deployment.md)에 있다.

### Terms Agreement / Footer 관련
- `/terms`, `/privacy`는 **샘플 문구**다. 출시 전 법무 검토를 거친 실제 약관으로 교체해야 한다 (사용자 문서에도 같은 주의가 있다).

### 백엔드 구현 체크리스트 (docs가 가정하고 있는 서버 규약)

docs와 프론트는 아래를 가정하고 만들어졌다. 백엔드 구현의 기준표로 쓸 수 있다.

| 영역 | 엔드포인트 | 비고 |
| --- | --- | --- |
| 인증 | `POST /auth/signup`, `/auth/login`, `/auth/refresh`, `/auth/logout` | 리프레시 토큰은 httpOnly 쿠키, 로그인 실패 시 429 + `Retry-After` |
| 비밀번호 | `POST /auth/password/forgot`, `/auth/password/reset` | 토큰 해시 저장, 짧은 만료, 단일 사용, forgot은 항상 동일 응답 |
| 이메일 인증 | `POST /auth/email/send-code`, `/auth/email/verify-code` | 선택 기능. 인증 성공 시 `{ token }`, 가입 때 `email_verification_token` 검증 |
| 내 정보 | `GET/PATCH /users/me`, `PATCH /users/me/password` | role_id 같은 필드는 무시. `PATCH /users/me`는 바꿀 항목만 보내는 **부분 수정**(닉네임만 보내는 경우 포함) |
| 주소 검색 | `GET /address/search?q&page&size` → `{ items, total, is_end }` | 선택 기능(`signup.addressSearch: "dialog"`일 때만). 카카오 로컬 API(주소 검색)를 서버가 대신 호출. REST 키는 서버에만 둔다. 팝업 방식(`"popup"`, 기본)은 서버 불필요 |
| 닉네임 | `PATCH /users/me { nickname }` | 길이 2~12자와 **중복 검사를 서버가 수행**, 중복은 409 + `detail`. 가입 요청의 `nickname`도 같은 규칙 |
| 관리자 | `GET /users?q&role_id&status&page&size` → `{ items, total, page, size }`, `PATCH /users/{id}/role`, `DELETE /users/{id}` | MASTER만, 마지막 MASTER 보호, 변경 기록 |
| 테이블 | `users`(+선택 컬럼 `nickname`, `postcode`, `address`, `address_detail`, `phone`, `birth_date`, `gender`, `email_verified_at`), `roles`, 약관 동의, 비밀번호 재설정 토큰, 이메일 인증 | Data Model 페이지 참고 |
| 서버 규칙 | 서버가 권한을 최종 판단, 비밀번호 Argon2, 로그인 잠금(브라우저 잠금은 안내용), 레이트 리밋 | Security 페이지 참고 |

---

## 작업 점검 (매번 확인)

UI/docs를 고친 뒤에는 **브라우저 콘솔에 에러가 없는지** 확인한다.
- 개발 서버에서 `/`, `/docs`, `/docs/<여러 페이지>`, `/me`, `/admin/members`를 열고 콘솔과 네트워크를 본다.
- 백엔드가 없는 환경(발표, 문서만 보는 방문자)에서도 **불필요한 `/api` 호출로 빨간 에러가 나오면 안 된다.**
  - 이번에 고친 사례: docs를 열 때마다 `POST /api/auth/refresh`가 나가 500/401 에러가 났다 → "이 브라우저에서 로그인한 적이 있을 때만" 세션 복원을 요청하도록 변경.

### AI 사용량 (멤버 AI Usage / Usage History)

- **상태:** 프론트 UI만 작업된 상태. 사용량을 기록·집계하는 서버는 **추후 적용 예정**이다. (사용량 관리는 원래 이번 범위 밖이었고, 관리자용 화면 UI만 먼저 만들었다.)
- docs 두 페이지 상단과 Data Model(AI usage), Introduction(포함되지 않는 것)에 "UI만 제공, 집계는 추후 적용" 안내를 넣었다.
- **/admin/members에는 연결하지 않았다.** 실제 데이터가 없어서, 현재는 docs 미리보기(목 데이터)에서만 보인다. 서버가 준비되면 멤버 행의 "사용량" 버튼이나 상세 패널에서 두 컴포넌트를 쓰면 된다.
- 화면이 기대하는 데이터 모양(백엔드 설계 참고):

| 컴포넌트 | 데이터 | 예시 |
| --- | --- | --- |
| `MemberAiUsage` (Radial) | `{ used, limit: number \| null, unit?, resetAt? }` | `{ used: 8100, limit: 10000, unit: "토큰", resetAt }` |
| `MemberAiUsageHistory` (Bar) | `{ day?, week?, month? }: { label, value }[]` | `{ day: [{ label: "10/07", value: 120 }, ...] }` |

- 예상 엔드포인트(미정): `GET /users/{id}/ai-usage`, `GET /users/{id}/ai-usage/history?period=day|week|month`. 허용량(limit) 설정과 초기화 주기도 함께 정해야 한다.

### 의존성 변경

- `recharts` 추가: shadcn `Chart` 컴포넌트(`components/ui/chart.tsx`)가 쓰는 표준 의존성. 막대·원형 차트에만 쓰인다.
- Orb(생각 중 구슬)는 외부 패키지(`thinking-orbs`)를 **설치하지 않고** 참고만 해서 `canvas`로 직접 만들었다 (`ai/ThinkingOrb.tsx`, 의존성 0). 상태 9종(working, searching, solving, listening, connecting, weaving, composing, breathing, shaping)은 같은 이름을 썼다.

### 이번 수정에서 정리한 UI 동작 (참고)

- **주소 입력칸은 클릭해도 검색되지 않는다.** 예전에는 읽기 전용 칸을 누르면 즉시 검색이 실행되어 docs 미리보기에서 "검색도 안 했는데 주소가 채워지는" 것처럼 보였다. 지금은 `주소 검색` 버튼으로만 시작한다.
- **닉네임 저장은 서버가 성공했을 때만 편집 창이 닫힌다.** 중복 오류가 보이지 않던 문제를 고쳤다 (`NicknameForm`의 `onSubmit`이 Promise를 돌려주면 성공/실패를 기다린다).
- 문서의 미리보기에서 디버그처럼 보이던 "증표", "필수 약관 동의 상태" 표시는 제거했다.
- Password Reset 페이지에 화면 문구를 바꾸는 파일 위치 표를 추가했다 (`Change the text`).

### 로딩 공통 모듈 (`src/meerkit/loading/`)

- `Loader`(9종: ring, dash, dots, bars, pulse, orbit, grid, progress, morph), `LoadingState`, `LoadingOverlay`, `useDelayedLoading`, `components/ui/skeleton.tsx`. 기본 모양은 `meerkit.config.ts`의 `loading.variant`(기본 `ring`).
- 기존 "불러오는 중…" 자리(RequireAuth/RequireRole, MemberDirectory, MemberAiUsage(History), AddressSearchDialog)를 모두 이 모듈로 교체했다. 새 로딩 화면은 직접 문구를 쓰지 말고 `LoadingState`를 쓴다.
- docs에 `Loading` 페이지(공통) 추가. `globals.css`에 `cursor: pointer`(버튼·링크 등) 기본 규칙과 로더 CSS가 들어 있다.
- 문서 하단 이전/다음 버튼 위 여백을 64px → 120px로 늘렸다.
