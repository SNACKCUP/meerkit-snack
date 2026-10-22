# Tailwind v4 · CSS 규칙

> 대상: `frontend/src/app/globals.css`, `frontend/src/meerkit/styles/tokens.css`.

## 토큰

- Always: 색, 모서리, 그림자는 `--mk-*` 토큰으로 정의하고(`tokens.css`), `@theme inline`의 `--color-*`로 Tailwind에 연결한다. 킷 컴포넌트에 색을 직접 적지 않는다.
- Always: 애니메이션 곡선은 `--mk-ease`를 쓴다. 움직임은 항상 부드럽게(천천히 감속) 한다.
- 이 저장소는 `@utility`를 쓰지 않는다. 직접 만든 CSS는 `globals.css`의 `.mk-*` 클래스(글로우, 로더, 스켈레톤 등)에 둔다. 새 커스텀 유틸리티가 필요하면 Tailwind v4 문법(`@utility 이름 { ... }`)을 쓴다.

## 서비스 화면의 테마 덮어쓰기

- 한 화면 안에서만 색을 바꿔야 하면, 최상위 요소에 `--mk-*` 값을 인라인 스타일로 덮어쓴다. 그 안의 Meerkit 컴포넌트(AI 입력창, 체크박스, 업로드 영역)도 같은 색을 따른다. 현재 `app/(sub)/maemusae/page.tsx`가 이 방식이다.
- 주의: `CLAUDE.md`의 스타일 규칙(토큰만 사용, 인라인 스타일 금지)과 충돌한다. 서비스 화면(`(service)`)은 토큰만 쓰는 것이 기본이고, 이 방식은 `(sub)` 서브 프로젝트 화면에서만 쓴다.

## 빌드로 검증

- Always: CSS를 고친 뒤에는 `npm run build`로 확인한다. `eslint`와 `tsc`는 CSS 문법을 검사하지 않는다. (사례: `globals.css`에 `}`가 하나 남아 모든 페이지가 빌드 오류 화면이 됐다)
- 정규식으로 CSS를 일괄 치환한 뒤에는 중괄호 짝을 눈으로 확인한다.

## 애니메이션

- Never: 한 요소에 `animation`을 가진 클래스를 둘 이상 붙이지 않는다. 뒤의 `animation`이 앞의 것을 덮어쓴다. (사례: `.mk-swap`과 `.mk-shimmer-text`를 한 요소에 붙여 글자 반짝임이 사라졌다) 바깥/안쪽 요소로 나눈다.
- Always: 새 애니메이션 클래스는 두 곳에 모두 등록한다. `:root[data-mk-motion="off"] ...`와 `@media (prefers-reduced-motion: reduce)` 목록. 빠뜨리면 움직임 끄기가 먹지 않는다.
- Tailwind 기본 애니메이션(`animate-ping` 등)도 같은 목록에 넣는다.

## 커서

- Tailwind preflight는 버튼 커서를 기본 화살표로 바꾼다. `globals.css`의 `@layer base`에 있는 커서 규칙(버튼·링크·탭·체크박스는 pointer, 비활성은 not-allowed)을 지우지 않는다.
