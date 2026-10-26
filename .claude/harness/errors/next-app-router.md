# Next.js App Router 주의점

> 대상: `frontend/` (Next.js 16, App Router, Cache Components, Turbopack). 작업 전 `frontend/AGENTS.md`의 안내대로 `node_modules/next/dist/docs/`를 먼저 읽는다. 알던 Next와 다르다.

## 라우트와 경계

- Always: 라우트 그룹 `(meerkit)`, `(service)`, `(sub)`는 주소에 나타나지 않는다. `app/(sub)/maemusae/page.tsx`의 주소는 `/maemusae`다. (이유: 폴더 이름과 URL을 혼동하기 쉽다)
- Always: 브라우저 API(`window`, `localStorage`, `canvas`, `MediaRecorder`, `AudioContext`, gsap)를 쓰는 파일은 `"use client"`를 맨 위에 둔다. `window` 접근은 `useEffect` 안에서만 한다. (이유: 서버 렌더링 중에는 `window`가 없다)
- Always: 레이아웃 props는 생성된 타입(`LayoutProps<"/">`)을 쓴다. `src/app/layout.tsx` 참고.

## 동적 경로와 Cache Components

- Always: 브라우저 데이터(localStorage 등)로만 그려지는 동적 경로(`[id]`, `[token]`)는 `page.tsx`를 서버 파일로 두고 `export const instant = false`를 내보낸 뒤, 화면은 같은 폴더의 `view.tsx`(`"use client"`)에서 그린다. (이유: 클라이언트 `page.tsx`나 상위 `layout.tsx`에 두면 개발 모드에서 "Could not validate that a segment has instant navigation" 에러가 계속 난다. 사례: `(sub)/maemusae/projects/[id]/`)
- Always: `usePathname()`을 쓰는 클라이언트 컴포넌트를 레이아웃에서 감쌀 때는 `<Suspense>`로 감싼다. (이유: 동적 경로에서 `next build`가 CLIENT_HOOK_DYNAMIC 오류로 실패한다. 사례: 매무새 `Shell`)

## 서버 호출

- Never: 마운트 때마다 `POST /auth/refresh`를 무조건 호출하지 않는다. "이 브라우저에서 로그인한 적이 있음" 표시(`localStorage` 키 `meerkit-session`)가 있을 때만 호출하고, 문서 전용 배포(`docsOnly`)에서는 건너뛴다. (이유: 백엔드가 없는 환경에서 모든 docs 페이지가 500/401 콘솔 에러를 냈다)

## 렌더링과 DOM

- Always: docs처럼 Cache Components가 이전 페이지를 숨겨 둔 채 남기는 화면에서는 DOM 조회(목차, 앵커)를 현재 `article` ref 안으로 한정한다. (이유: 숨겨진 이전 페이지의 제목이 목차에 섞였다)
- Always: 제목 id는 실행 중에 중복을 제거한다. 중복이면 React "같은 key" 에러와 목차 이중 활성화가 생긴다. (사례: `Pagination`이 두 번 나온 문서)
- Never: 렌더 중에 ref를 쓰지 않는다. 최신 값 동기화는 `useEffect`에서 한다. (이유: `react-hooks` 규칙이 막는다)

## 애니메이션(gsap)

- Always: `gsap.registerPlugin(ScrollTrigger)`는 모듈 맨 위에서 한 번만, 애니메이션은 `gsap.context(..., scopeRef)` 안에서 만들고 cleanup에서 `ctx.revert()`를 부른다. (이유: 라우트 이동과 개발 중 재마운트에서 트리거가 쌓인다)
- Always: 설정의 움직임 끄기(`document.documentElement.dataset.mkMotion === "off"`)와 `prefers-reduced-motion`을 지킨다. 이때는 완성된 화면을 그대로 보여 준다.

## 폰트

- Never: 페이지 파일에서 `<link>`로 폰트를 불러오지 않는다. 불가피하면 `eslint-disable-next-line @next/next/no-page-custom-font`로 이유를 남긴다. 기본은 루트 레이아웃의 `<link>`다.

## 개발 중 확인

- 화면 작업 뒤에는 브라우저 콘솔 에러와 불필요한 `/api` 호출이 없는지 확인한다 (`docs/seungyeol/docs_team_notes.md`의 "작업 점검").
- 개발용 브라우저 창은 프레임을 늦게 그려 애니메이션이 끊겨 보이거나 첫 화면이 비어 보일 수 있다. 환경 현상이므로 버그로 판단하기 전에 몇 초 기다린 뒤 다시 본다.
