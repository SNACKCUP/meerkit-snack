"use client";

import { Callout, CodeBlock, DocLinks, DocTable, H2, H3, Ic, LinkCards, links, OL, P, PkgTabs, Tree, UL } from "../ui";

export function Introduction() {
  return (
    <>
      <P>
        <strong>Meerkit은 회원가입, 로그인, 역할 기반 권한, 유저 관리 화면을 미리 갖춘 AI 서비스 스타터킷입니다.</strong>{" "}
        새 프로젝트마다 인증을 다시 만들지 않고, 명령어 한 줄로 동작하는 기반 위에서 서비스 기능만 얹을 수 있습니다.
      </P>
      <P>
        Meerkit은 컴포넌트 라이브러리가 아니라 <strong>템플릿</strong>입니다. 코드는 전부 프로젝트 안에 복사되므로 받아서 마음대로 고칠 수 있습니다.
      </P>
      <H2>Principles</H2>
      <UL>
        <li><strong>Ready to run:</strong> 설치 후 바로 가입·로그인·비밀번호 재설정·관리자 기능을 테스트할 수 있습니다.</li>
        <li><strong>Open code:</strong> 모든 화면과 훅이 <Ic>src/meerkit/</Ic> 안에 그대로 있습니다.</li>
        <li><strong>Separated:</strong> 킷 코드와 서비스 코드를 폴더로 분리해, 업데이트와 커스터마이징이 서로 방해하지 않습니다.</li>
        <li><strong>Server-verified:</strong> 화면에서 버튼을 숨기는 것은 편의일 뿐이고, 권한 검증은 항상 백엔드가 합니다.</li>
        <li><strong>Themeable:</strong> 색, 반경, 폰트를 토큰 한 파일에서 바꿉니다.</li>
      </UL>
      <H2>What&apos;s included</H2>
      <DocTable
        head={["영역", "포함된 것"]}
        rows={[
          ["프론트엔드", "Next.js(App Router), shadcn/ui, Tailwind, Zustand, TanStack Query"],
          ["백엔드", "FastAPI, PostgreSQL, Alembic, JWT 인증"],
          ["인증", "회원가입, 로그인, 로그아웃, 토큰 자동 갱신"],
          ["계정 보호", "연속 로그인 실패 잠금(횟수·시간 설정 가능), 비밀번호 찾기·재설정, 비밀번호 변경"],
          ["가입", "약관 동의(체크박스), 선택 항목(닉네임·주소·성별 등), 비밀번호 확인, 이메일 인증(선택)"],
          ["입력 부품", "주소 검색(2가지 방식), 첨부파일 드래그앤드롭, 체크박스, 라디오, 페이지네이션"],
          ["권한", "MASTER / OWNER / VIEWER / WRITER 역할과 라우트 가드"],
          ["관리자", "멤버 검색·필터·페이지네이션, 역할 변경, 탈퇴 처리"],
          ["환경", "docker-compose 로컬 DB, 설정 스크립트, CI"],
        ]}
      />
      <H2>Tech stack</H2>
      <DocTable
        head={["구분", "기술", "용도"]}
        rows={[
          ["UI", "Next.js, React, shadcn/ui, Tailwind v4", "화면과 컴포넌트"],
          ["클라이언트 상태", "Zustand", "액세스 토큰, 모달 열림 상태"],
          ["서버 상태", "TanStack Query", "내 정보, 멤버 목록 캐시"],
          ["HTTP", "Axios", "토큰 부착, 401 시 자동 갱신"],
          ["API", "FastAPI", "인증·유저 API"],
          ["DB", "PostgreSQL", "users, roles 테이블"],
        ]}
      />
      <H2>Who is it for</H2>
      <UL>
        <li>가입·로그인·권한 관리를 매번 새로 만들고 싶지 않은 팀</li>
        <li>AI 서비스 같은 기능 개발에 시간을 쓰고 싶고, 사용자 관리는 검증된 기반 위에서 시작하고 싶은 팀</li>
        <li>shadcn/ui와 Tailwind를 이미 쓰고 있어서, 그 방식 그대로 인증 화면을 얹고 싶은 팀</li>
      </UL>
      <H2>What users can do</H2>
      <P>킷으로 만든 서비스를 쓰는 사람은 역할에 따라 다음을 할 수 있습니다.</P>
      <DocTable
        head={["누가", "할 수 있는 것"]}
        rows={[
          ["방문자", "웰컴 페이지에서 회원가입, 로그인"],
          ["방문자", "비밀번호를 잊었을 때 이메일로 재설정 링크 받기"],
          ["로그인한 모든 사용자", "아바타 메뉴 열기, 내 정보·비밀번호 수정, 로그아웃"],
          ["MASTER (관리자)", "멤버 검색·필터·페이지 이동, 확인 창에서 역할 부여·변경, 탈퇴 처리"],
          ["OWNER · WRITER · VIEWER", "역할에 맞는 서비스 기능 사용 (내 서비스에서 가드로 구현)"],
        ]}
      />
      <H2>How the pieces connect</H2>
      <Tree>{`
브라우저 (Next.js 화면)
   │  회원가입 · 로그인 · 관리자 화면 (src/meerkit)
   ▼
/api 프록시 ── 같은 도메인처럼 동작, 쿠키·CORS 단순화
   ▼
FastAPI 백엔드 ── 토큰 발급, 권한 검증 (서버가 최종 판단)
   ▼
PostgreSQL ── users, roles
`}</Tree>
      <H2>What is not included</H2>
      <P>범위를 좁게 유지하기 위해 다음은 기본 제공하지 않습니다. 필요하면 서비스에서 추가하세요.</P>
      <UL>
        <li>링크 방식 이메일 인증, 소셜 로그인, 2단계 인증</li>
        <li>프로필 이미지 업로드 (이미지 주소를 받아 표시만 합니다)</li>
        <li>실제 약관 문구와 메일 발송 (샘플 약관 페이지만 있습니다)</li>
        <li>세부 권한(permission) 테이블, 조직·팀 구조</li>
        <li>AI 사용량 기록과 한도 관리 (관리자용 사용량 화면 UI는 제공하며, 실제 집계는 추후 적용 예정)</li>
      </UL>
      <H2>Next steps</H2>
      <LinkCards
        items={[
          { href: "/docs/installation", title: "Installation", desc: "프로젝트를 만들고 실행합니다." },
          { href: "/docs/authentication", title: "Authentication", desc: "인증 흐름을 이해합니다." },
          { href: "/docs/login-form", title: "Components", desc: "화면 부품을 살펴봅니다." },
        ]}
      />
    </>
  );
}

export function Installation() {
  return (
    <>
      <DocLinks items={[links.shadcnInstall, links.tailwindInstall]} />
      <Callout>
        새 프로젝트라면 아래 <strong>Create a project</strong> 두 단계면 충분합니다. 기존 프로젝트에 붙이려면 <strong>Existing project</strong>를 보세요.
      </Callout>
      <H2>Requirements</H2>
      <DocTable
        head={["도구", "버전", "확인 명령"]}
        rows={[
          ["Node.js", "20 이상", <Ic key="n">node -v</Ic>],
          ["Python", "3.12 이상", <Ic key="p">python3 --version</Ic>],
          ["uv", "최신", <Ic key="u">uv --version</Ic>],
          ["Docker", "실행 중이어야 함", <Ic key="d">docker info</Ic>],
        ]}
      />
      <H2>Create a project</H2>
      <P>폴더 구조만 생성합니다. 이 단계에서는 설치나 실행을 하지 않습니다.</P>
      <PkgTabs command="npx create-meerkit my-app" />
      <P>프로젝트 안으로 이동해 세팅을 실행합니다. 의존성 설치, 환경 변수 생성, DB 실행, 마이그레이션, 서버 실행까지 한 번에 진행됩니다.</P>
      <CodeBlock title="bash" code={"cd my-app\nnpx meerkit setup"} />
      <H2>What setup does</H2>
      <OL>
        <li>Node, Python, uv, Docker가 있는지 확인합니다. 없으면 설치 안내 후 멈춥니다.</li>
        <li><Ic>frontend</Ic>에서 <Ic>npm install</Ic>을 실행합니다.</li>
        <li><Ic>backend</Ic>에서 <Ic>uv sync</Ic>를 실행합니다.</li>
        <li><Ic>.env.example</Ic>을 <Ic>.env</Ic>로 복사하고 JWT 비밀키를 생성합니다. 이미 있으면 덮어쓰지 않습니다.</li>
        <li><Ic>docker compose up -d --wait</Ic>로 로컬 DB를 띄웁니다.</li>
        <li>Alembic 마이그레이션을 적용하고 시드 관리자 계정을 만듭니다.</li>
        <li>백엔드와 프론트엔드 서버를 시작하고 접속 주소를 출력합니다.</li>
      </OL>
      <P>각 단계는 한 줄로 진행 상황을 보여 주고, 전체 로그는 <Ic>meerkit-setup.log</Ic>에 저장됩니다. 다시 실행해도 안전합니다(이미 끝난 단계는 건너뜁니다).</P>
      <H2>Local URLs</H2>
      <DocTable
        head={["서비스", "주소"]}
        rows={[
          ["Frontend", <Ic key="f">http://localhost:3000</Ic>],
          ["Backend API 문서", <Ic key="b">http://localhost:8000/docs</Ic>],
          ["PostgreSQL", <Ic key="d">localhost:5432</Ic>],
        ]}
      />
      <H2>Environment variables</H2>
      <P>프론트엔드 <Ic>frontend/.env</Ic>에서 설정합니다. 운영 환경에 올릴 때의 값은 Deployment 페이지를 보세요.</P>
      <DocTable
        head={["변수", "기본값", "설명"]}
        rows={[
          [<Ic key="1">NEXT_PUBLIC_API_BASE_URL</Ic>, "/api", "브라우저가 호출할 API 경로. next.config의 프록시가 백엔드로 전달합니다."],
          [<Ic key="2">API_PROXY_TARGET</Ic>, "http://localhost:8000", "프록시가 전달할 백엔드 주소."],
          [<Ic key="3">NEXT_PUBLIC_DOCS_URL</Ic>, "/docs", "웰컴 페이지 Docs 링크(새 창). 문서를 따로 배포했다면 그 주소."],
          [<Ic key="4">NEXT_PUBLIC_GITHUB_URL</Ic>, "저장소 주소", "문서 상단 GitHub 버튼."],
          [<Ic key="5">NEXT_PUBLIC_SHOW_DOCS_PAGE</Ic>, "true", "이 문서(/docs) 라우트를 열지 여부. 운영에서는 false로 닫는 것을 권장합니다."],
        ]}
      />
      <H2>Existing project</H2>
      <P>이미 있는 Next.js 프로젝트에 킷의 프론트 부분만 가져오려면 다음 순서로 진행합니다.</P>
      <OL>
        <li>Tailwind v4와 shadcn/ui를 설정합니다. <Ic>components.json</Ic>의 <Ic>hooks</Ic> 별칭은 <Ic>@/meerkit/auth</Ic>로 둡니다.</li>
        <li>필요한 패키지를 설치합니다.</li>
        <li><Ic>src/meerkit/</Ic>과 <Ic>src/components/ui/</Ic>를 복사합니다.</li>
        <li>루트 레이아웃을 <Ic>{"<MeerkitProvider>"}</Ic>로 감쌉니다.</li>
        <li>토큰 파일을 <Ic>globals.css</Ic>에서 불러옵니다.</li>
      </OL>
      <CodeBlock title="bash" code={"npm install zustand @tanstack/react-query axios radix-ui \\\n  class-variance-authority clsx tailwind-merge lucide-react sonner"} />
      <CodeBlock title="app/layout.tsx" code={`import { MeerkitProvider } from "@/meerkit";\n\nexport default function RootLayout({ children }) {\n  return (\n    <html lang="ko">\n      <body>\n        <MeerkitProvider>{children}</MeerkitProvider>\n      </body>\n    </html>\n  );\n}`} />
      <CodeBlock title="app/globals.css" code={`@import "tailwindcss";\n@import "../meerkit/styles/tokens.css";`} />
      <H2>Troubleshooting</H2>
      <DocTable
        head={["증상", "원인", "해결"]}
        rows={[
          ["Docker에 연결할 수 없음", "Docker Desktop이 꺼져 있음", "Docker를 실행한 뒤 setup을 다시 실행"],
          ["포트 충돌 (3000/8000/5432)", "다른 프로세스가 사용 중", "해당 프로세스를 종료하거나 포트를 변경"],
          ["Node 버전 부족", "Node 20 미만", "Node를 업그레이드"],
          ["uv 명령 없음", "uv 미설치", "uv를 설치한 뒤 다시 실행"],
          ["DB 연결 실패", "컨테이너가 아직 준비 중", "잠시 뒤 setup을 다시 실행"],
        ]}
      />
    </>
  );
}

export function ProjectStructure() {
  return (
    <>
      <P>저장소는 <Ic>backend</Ic>와 <Ic>frontend</Ic>로 나뉩니다. 이 페이지는 프론트엔드 폴더를 중심으로 설명합니다.</P>
      <H2>Repository</H2>
      <Tree>{`
meerkit/
├── backend/             FastAPI 백엔드
├── frontend/            Next.js 프론트엔드
├── docs/                설계·가이드 문서
├── .github/workflows/   CI
├── docker-compose.yml   로컬 DB
└── README.md
`}</Tree>
      <H2>Frontend</H2>
      <Tree>{`
frontend/src/
├── app/                 라우트 (연결 파일만)
│   ├── (meerkit)/       킷 화면: /me, /admin/members, /docs(문서 사이트용)
│   └── (service)/       서비스 화면 자리
├── components/ui/       shadcn 컴포넌트
├── lib/utils.ts         cn()
└── meerkit/             킷 본체 (수정하지 않는다)
    ├── api/             client.ts, auth.ts, users.ts
    ├── auth/            스토어, 훅, 가드, 폼, 모달
    ├── admin/           멤버 테이블, 역할 선택
    ├── docs/            이 문서 사이트
    ├── providers/       MeerkitProvider
    ├── welcome/         웰컴 페이지
    ├── styles/          tokens.css
    ├── config.ts  roles.ts  types.ts  index.ts
`}</Tree>
      <H2>Project root</H2>
      <Tree>{`
frontend/
├── meerkit.config.ts    내가 고치는 Meerkit 설정 (theme, motion, signup 옵션)
├── components.json     shadcn 설정
├── .env.example        환경 변수
└── src/
`}</Tree>
      <P>킷 폴더(<Ic>src/meerkit</Ic>)는 업데이트 대상이므로 건드리지 않고, 바꾸고 싶은 것은 <Ic>meerkit.config.ts</Ic>와 <Ic>globals.css</Ic>에서 합니다.</P>
      <H2>Where does X go?</H2>
      <DocTable
        head={["만들 것", "위치"]}
        rows={[
          ["킷 화면 컴포넌트", <Ic key="1">src/meerkit/&lt;기능&gt;/components/</Ic>],
          ["킷 서버 호출 함수", <Ic key="2">src/meerkit/api/</Ic>],
          ["킷 라우트 연결", <Ic key="3">src/app/(meerkit)/</Ic>],
          ["서비스 화면", <Ic key="4">src/app/(service)/</Ic>],
          ["shadcn 컴포넌트 추가", <Ic key="5">src/components/ui/</Ic>],
        ]}
      />
      <H2>Backend</H2>
      <Tree>{`
backend/
├── alembic/             마이그레이션
├── tests/
└── app/
    ├── main.py          앱 생성
    ├── core/            설정, DB 연결
    ├── auth/            회원가입·로그인 (구현 예정)
    ├── llm/             LLM 호출 모듈 (구현 예정)
    └── features/        샘플 기능 (서비스 코드는 여기에)
`}</Tree>
      <Callout>백엔드는 아직 구현 전입니다. 위 구조는 현재 저장소 기준이며, 인증·유저 API가 들어오면 갱신됩니다.</Callout>
      <H2>Import direction</H2>
      <P>코드가 서로를 가져오는 방향은 한쪽으로만 흐르게 합니다. 이렇게 해야 킷을 업데이트해도 내 서비스 코드가 깨지지 않습니다.</P>
      <Tree>{`
app/(service)/   내 서비스 화면
      │  가져다 쓴다 (@/meerkit)
      ▼
src/meerkit/     킷 본체          ← 서비스를 import하지 않는다
      │
      ▼
components/ui/   shadcn 컴포넌트
`}</Tree>
      <H2>Rules</H2>
      <UL>
        <li><Ic>meerkit/</Ic>은 킷 코드입니다. 킷을 받아 쓰는 사람은 이 폴더를 수정하지 않는 것을 권장합니다.</li>
        <li><Ic>app/</Ic>에는 한 줄짜리 연결 파일만 둡니다. 화면 본체는 <Ic>@/meerkit</Ic>에서 가져옵니다.</li>
        <li>킷은 <Ic>app/(service)/</Ic>를 import하지 않습니다. 의존은 서비스 → 킷 방향으로만 흐릅니다.</li>
        <li>서버 데이터는 TanStack Query, 토큰과 모달 상태는 Zustand에 둡니다.</li>
        <li>스타일은 Tailwind utility와 토큰만 사용합니다.</li>
      </UL>
      <Callout>
        <Ic>(meerkit)</Ic>, <Ic>(service)</Ic>는 URL에 나타나지 않는 그룹 폴더입니다. 킷 화면으로 가는 연결과 서비스 화면을 한눈에 구분하기 위한 용도입니다.
      </Callout>
    </>
  );
}

export function Theming() {
  return (
    <>
      <DocLinks items={[links.shadcnTheming, links.tailwindTheme, links.tailwindCustom]} />
      <P>
        Meerkit의 스타일은 새로운 스타일 시스템이 아닙니다. <strong>Tailwind CSS와 shadcn/ui를 쓰던 방식 그대로</strong> 두고, 그 위에
        Meerkit의 색·모서리·모션 값을 덧붙인 얇은 레이어입니다. 그래서 Tailwind와 shadcn을 아는 사람은 새로 배울 것이 거의 없습니다.
      </P>

      <H2>How it fits together</H2>
      <Tree>{`
Tailwind CSS v4     @import "tailwindcss" · @theme inline      유틸리티 클래스(bg-primary 등)를 만든다
 └ shadcn/ui        components.json · src/components/ui        컴포넌트 코드. 색은 의미 이름(primary, card…)으로만 쓴다
    └ Meerkit 토큰  src/meerkit/styles/tokens.css              --mk-* 변수. 값의 단일 출처
       └ Meerkit 화면  src/meerkit/**                           shadcn 컴포넌트를 조합해 만든 로그인·관리자 화면
`}</Tree>
      <P>버튼 하나가 색을 얻는 경로는 다음과 같습니다.</P>
      <CodeBlock title="한 줄로 보는 흐름" code={`<Button>                       className="bg-primary"           ← shadcn 컴포넌트\n  → Tailwind                   --color-primary                  ← @theme inline\n  → Meerkit 토큰               var(--mk-primary)                ← tokens.css\n  → 값                         #2a2c3b`} />
      <UL>
        <li>컴포넌트는 값을 모르고 <strong>의미 이름</strong>만 압니다. 그래서 값을 바꿔도 컴포넌트를 고칠 필요가 없습니다.</li>
        <li>값은 <Ic>--mk-*</Ic> 변수 한 곳에만 있습니다. 바꾸고 싶으면 이 변수만 건드리면 됩니다.</li>
        <li>shadcn CLI로 새 컴포넌트를 추가해도 같은 의미 이름을 쓰므로 자동으로 Meerkit 색을 따릅니다.</li>
      </UL>

      <H2>Choose a theme</H2>
      <P>
        프로젝트 루트의 <Ic>meerkit.config.ts</Ic>에서 고릅니다. 킷 폴더(<Ic>src/meerkit</Ic>)는 건드리지 않습니다.
      </P>
      <CodeBlock title="meerkit.config.ts" code={`import { defineMeerkitConfig } from "@/meerkit/define-config";\n\nexport default defineMeerkitConfig({\n  theme: "meerkit", // "meerkit" | "shadcn"\n  motion: true,     // false면 Meerkit 애니메이션을 모두 끈다\n});`} />
      <DocTable
        head={["theme", "결과", "이럴 때"]}
        rows={[
          [<Ic key="1">&quot;meerkit&quot;</Ic>, "Meerkit 기본 스타일 (쿨 그레이 + 포인트 블루, 둥근 모서리, 부드러운 모션)", "기본 스타일 그대로 쓰거나, 일부 값만 바꿀 때"],
          [<Ic key="2">&quot;shadcn&quot;</Ic>, "프로젝트의 shadcn 기본 변수(--background, --primary…)를 그대로 따름", "이미 shadcn 테마가 있고 Meerkit 색은 쓰고 싶지 않을 때"],
        ]}
      />
      <P>선택은 루트 <Ic>{"<html>"}</Ic>의 <Ic>data-mk-theme</Ic> 속성으로 반영됩니다. 코드를 지우거나 import를 바꾸지 않아도 됩니다.</P>

      <H2>Use your own shadcn theme</H2>
      <P>
        이미 쓰고 있는 shadcn 테마(<Ic>globals.css</Ic>의 <Ic>--background</Ic>, <Ic>--primary</Ic> 등)를 유지하고 싶다면 <Ic>theme: &quot;shadcn&quot;</Ic>으로 바꾸세요.
        Meerkit 변수가 shadcn 변수를 가리키도록 자동으로 연결됩니다.
      </P>
      <DocTable
        head={["Meerkit 변수", "shadcn 변수", "비고"]}
        rows={[
          [<Ic key="1">--mk-background</Ic>, <Ic key="a">--background</Ic>, ""],
          [<Ic key="2">--mk-foreground</Ic>, <Ic key="b">--foreground</Ic>, ""],
          [<Ic key="3">--mk-card</Ic>, <Ic key="c">--card</Ic>, ""],
          [<Ic key="4">--mk-primary</Ic>, <Ic key="d">--primary</Ic>, "기본 버튼"],
          [<Ic key="5">--mk-muted / --mk-accent</Ic>, <Ic key="e">--muted / --accent</Ic>, ""],
          [<Ic key="6">--mk-border</Ic>, <Ic key="f">--border</Ic>, ""],
          [<Ic key="7">--mk-destructive</Ic>, <Ic key="g">--destructive</Ic>, ""],
          [<Ic key="8">--mk-radius</Ic>, <Ic key="h">--radius</Ic>, "없으면 0.625rem"],
          [<Ic key="9">--mk-surface</Ic>, <Ic key="i">--background</Ic>, "shadcn에 없는 토큰. 입력창 배경"],
          [<Ic key="10">--mk-brand</Ic>, <Ic key="j">--primary</Ic>, "shadcn에 없는 토큰. 링크, 포커스, 배지"],
          [<Ic key="11">--mk-shadow-soft</Ic>, <Ic key="k">shadow-sm 수준</Ic>, "shadcn에 없는 토큰. 카드 그림자"],
        ]}
      />
      <Callout>
        <Ic>tokens.css</Ic>는 이 모드에서도 계속 불러와야 합니다. 값만 shadcn 변수로 바뀌고, <Ic>bg-surface</Ic>·<Ic>text-brand</Ic> 같은 클래스는 그대로 동작합니다.
      </Callout>

      <H2>Change individual values</H2>
      <P>
        기본 스타일에서 일부만 바꾸려면 <Ic>tokens.css</Ic>를 고치지 말고, <Ic>globals.css</Ic>에서 import 아래에 덮어쓰세요.
        그래야 킷을 업데이트해도 내 값이 유지됩니다.
      </P>
      <CodeBlock title="app/globals.css" code={`@import "tailwindcss";\n@import "../meerkit/styles/tokens.css";\n\n:root {\n  --mk-brand: #7c3aed;   /* 포인트 색 */\n  --mk-primary: #111827; /* 기본 버튼 */\n  --mk-radius: 0.5rem;   /* 모서리 */\n}`} />

      <H2>Tokens</H2>
      <DocTable
        head={["토큰", "Tailwind 클래스", "용도", "기본값"]}
        rows={[
          [<Ic key="1">--mk-background</Ic>, <Ic key="a">bg-background</Ic>, "페이지 배경", "#f3f4f6"],
          [<Ic key="2">--mk-foreground</Ic>, <Ic key="b">text-foreground</Ic>, "기본 글자색", "#1b1d29"],
          [<Ic key="3">--mk-card</Ic>, <Ic key="c">bg-card</Ic>, "카드 배경", "#fafafb"],
          [<Ic key="4">--mk-surface</Ic>, <Ic key="d">bg-surface</Ic>, "입력창, 아웃라인 버튼 배경", "#ffffff"],
          [<Ic key="5">--mk-primary</Ic>, <Ic key="e">bg-primary</Ic>, "기본 버튼, 어두운 면", "#2a2c3b"],
          [<Ic key="6">--mk-brand</Ic>, <Ic key="f">text-brand</Ic>, "포인트 (링크, 포커스, 배지)", "#2c63fb"],
          [<Ic key="7">--mk-muted</Ic>, <Ic key="g">bg-muted</Ic>, "보조 배경", "#eceef1"],
          [<Ic key="8">--mk-accent</Ic>, <Ic key="h">bg-accent</Ic>, "호버, 선택 배경", "#e9ebef"],
          [<Ic key="9">--mk-border</Ic>, <Ic key="i">border</Ic>, "테두리", "#e3e5ea"],
          [<Ic key="10">--mk-destructive</Ic>, <Ic key="j">text-destructive</Ic>, "오류, 삭제", "#d6455d"],
        ]}
      />
      <Callout>
        기본 디자인은 중립 그레이이고, <Ic>brand</Ic> 파랑은 링크, 포커스 링, 작은 배지에만 아주 가끔 씁니다. 주 버튼은 어두운 <Ic>primary</Ic>입니다.
      </Callout>

      <H2>Dark mode</H2>
      <P>기본 제공은 라이트 테마뿐입니다. 다크 모드를 추가하려면 같은 <Ic>--mk-*</Ic> 변수만 다시 정의하면 되고, 컴포넌트는 고치지 않습니다.</P>
      <CodeBlock title="app/globals.css" code={`:root[data-theme="dark"] {\n  --mk-background: #0b0c10;\n  --mk-foreground: #f2f3f7;\n  --mk-card: #14161c;\n  --mk-surface: #1a1d25;\n  --mk-muted: #1f222b;\n  --mk-accent: #262a34;\n  --mk-border: #2a2e39;\n  --mk-primary: #f2f3f7;\n  --mk-primary-foreground: #0b0c10;\n}`} />

      <H2>Radius</H2>
      <P><Ic>--mk-radius</Ic> 하나로 모든 모서리가 바뀝니다. 작을수록 각지고 클수록 둥글어집니다.</P>
      <DocTable
        head={["클래스", "계산"]}
        rows={[
          [<Ic key="1">rounded-md</Ic>, "radius − 4px"],
          [<Ic key="2">rounded-lg</Ic>, "radius"],
          [<Ic key="3">rounded-xl</Ic>, "radius + 4px"],
          [<Ic key="4">rounded-2xl</Ic>, "radius + 8px"],
          [<Ic key="5">rounded-3xl</Ic>, "radius + 16px"],
        ]}
      />

      <H2>Fonts</H2>
      <P>기본 글꼴은 Pretendard(한글·영문), 코드는 시스템 모노스페이스입니다. <Ic>--font-sans</Ic>와 <Ic>app/layout.tsx</Ic>의 스타일시트를 바꾸면 교체됩니다.</P>

      <H2>Motion</H2>
      <P>Meerkit의 움직임은 한 가지 원칙을 따릅니다: <strong>항상 부드럽게.</strong> 급하게 멈추거나 튕기지 않고, 빠르게 시작해 천천히 감속하며 멈춥니다.</P>
      <UL>
        <li>곡선은 <Ic>--mk-ease</Ic> 하나만 씁니다 (<Ic>cubic-bezier(0.22, 1, 0.36, 1)</Ic>). 닫힐 때만 <Ic>--mk-ease-in</Ic>으로 가볍게 빠집니다.</li>
        <li>나타날 때는 길게(0.5~0.9초), 사라질 때는 짧게(0.3초 안팎) 합니다.</li>
        <li>움직임은 투명도, 아주 작은 이동, 약한 블러만 씁니다. 선형(linear)이나 바운스는 쓰지 않습니다.</li>
      </UL>
      <DocTable
        head={["클래스", "동작", "쓰이는 곳"]}
        rows={[
          [<Ic key="1">mk-rise</Ic>, "아래에서 블러가 풀리며 올라옴 (0.9s)", "웰컴 페이지, 문서 본문"],
          [<Ic key="2">mk-fade</Ic>, "서서히 나타남 (1.2s)", "장식 카드"],
          [<Ic key="3">mk-float</Ic>, "위아래로 천천히 떠다님 (7s, 반복)", "장식 카드"],
          [<Ic key="4">mk-swap</Ic>, "내용 교체 시 부드럽게 등장 (0.45s)", "로그인 ↔ 가입 전환, 추가 입력 필드"],
          [<Ic key="5">mk-overlay · mk-dialog</Ic>, "열릴 때 0.4~0.55s, 닫힐 때 0.3s로 부드럽게", "Dialog (Auth Dialog)"],
        ]}
      />
      <H3>모션 끄기</H3>
      <UL>
        <li><Ic>meerkit.config.ts</Ic>에서 <Ic>motion: false</Ic>로 설정하면 위 클래스가 모두 꺼집니다.</li>
        <li>사용자 OS에서 &quot;동작 줄이기&quot;를 켰다면 설정과 관계없이 자동으로 꺼집니다.</li>
      </UL>
      <H3>내 컴포넌트에 쓰기</H3>
      <CodeBlock title="tsx" code={`<section className="mk-rise" style={{ animationDelay: "200ms" }}>\n  ...\n</section>`} />

      <H2>Not using the Meerkit style</H2>
      <P>Meerkit 스타일이 필요 없다면 두 단계로 정리할 수 있습니다.</P>
      <H3>1단계: 값만 끄기 (권장)</H3>
      <P><Ic>theme: &quot;shadcn&quot;</Ic>과 <Ic>motion: false</Ic>로 바꾸면 코드는 그대로 두고 내 shadcn 테마만 적용됩니다.</P>
      <H3>2단계: 코드까지 정리하기</H3>
      <P>Meerkit 전용 토큰과 클래스를 완전히 없애고 싶다면 아래 순서로 정리합니다. 먼저 사용처를 찾으세요.</P>
      <CodeBlock title="bash" code={`grep -rnE "bg-brand|text-brand|border-brand|bg-surface|shadow-soft|mk-" src`} />
      <DocTable
        head={["Meerkit 전용", "바꿀 표준 shadcn 클래스"]}
        rows={[
          [<Ic key="1">bg-surface</Ic>, <Ic key="a">bg-background</Ic>],
          [<Ic key="2">bg-brand · text-brand</Ic>, <Ic key="b">bg-primary · text-primary</Ic>],
          [<Ic key="3">shadow-soft</Ic>, <Ic key="c">shadow-sm</Ic>],
          [<Ic key="4">mk-rise · mk-fade · mk-swap …</Ic>, "삭제 (또는 직접 만든 애니메이션)"],
        ]}
      />
      <OL>
        <li>위 표대로 클래스를 바꿉니다.</li>
        <li><Ic>globals.css</Ic>에서 <Ic>tokens.css</Ic> import와 <Ic>mk-*</Ic> 키프레임을 지웁니다.</li>
        <li><Ic>layout.tsx</Ic>의 <Ic>data-mk-theme</Ic>, <Ic>data-mk-motion</Ic> 속성을 지웁니다.</li>
        <li>쓰지 않는 화면(<Ic>welcome/</Ic>, <Ic>docs/</Ic>)은 폴더째 삭제해도 인증 기능에는 영향이 없습니다.</li>
      </OL>

      <H2>Add a shadcn component</H2>
      <P>shadcn CLI로 추가한 컴포넌트는 같은 의미 이름을 쓰므로 별도 작업 없이 현재 테마를 따릅니다.</P>
      <CodeBlock title="bash" code={"npx shadcn@latest add select"} />
    </>
  );
}

export function Deployment() {
  return (
    <>
      <P>
        Meerkit으로 만든 <strong>내 서비스</strong>를 운영 환경에 올릴 때 설정하고 확인할 것을 정리했습니다.
        로컬 개발은 Installation 페이지를 보세요.
      </P>
      <Callout>
        백엔드는 아직 구현 전이라 서버 관련 항목은 <strong>설계 기준(예정)</strong>입니다. 프론트엔드 항목은 지금 그대로 적용할 수 있습니다.
      </Callout>

      <H2>What you deploy</H2>
      <DocTable
        head={["구성", "설명", "실행"]}
        rows={[
          ["Frontend", "Next.js 앱 (standalone 출력)", <Ic key="1">node .next/standalone/server.js</Ic>],
          ["Backend", "FastAPI 앱", <Ic key="2">uvicorn app.main:app</Ic>],
          ["Database", "PostgreSQL", "관리형 DB 또는 컨테이너"],
        ]}
      />
      <P>컨테이너 이미지(Dockerfile)는 아직 제공하지 않습니다. 호스팅 환경에 맞게 직접 구성하세요.</P>

      <H2>Build the frontend</H2>
      <CodeBlock title="bash" code={"cd frontend\nnpm ci\nnpm run build\nnode .next/standalone/server.js"} />
      <P><Ic>next.config.ts</Ic>의 <Ic>output: &quot;standalone&quot;</Ic> 덕분에 필요한 파일만 담긴 폴더가 만들어집니다. 정적 파일(<Ic>public</Ic>, <Ic>.next/static</Ic>)은 함께 복사해야 합니다.</P>

      <H2>Environment variables</H2>
      <DocTable
        head={["변수", "운영 값", "설명"]}
        rows={[
          [<Ic key="1">API_PROXY_TARGET</Ic>, "운영 백엔드 주소", "/api 요청을 전달할 곳. 내부 주소를 쓸 수 있습니다."],
          [<Ic key="2">NEXT_PUBLIC_API_BASE_URL</Ic>, "/api", "바꾸지 않는 것을 권장합니다. 같은 도메인이라 쿠키와 CORS가 단순해집니다."],
          [<Ic key="3">NEXT_PUBLIC_SHOW_DOCS_PAGE</Ic>, "false", "내 서비스에서 /docs 라우트를 닫습니다."],
          [<Ic key="4">NEXT_PUBLIC_DOCS_URL</Ic>, "내 문서 주소", "웰컴 페이지의 Docs 버튼이 열 주소. 쓰지 않는다면 버튼을 지우세요."],
        ]}
      />
      <Callout tone="warn">
        <Ic>NEXT_PUBLIC_</Ic>로 시작하는 값은 <strong>빌드 시점에 번들에 들어가고 브라우저에 공개</strong>됩니다. 비밀값을 넣지 마세요. 환경 변수를 바꾸면 다시 빌드해야 합니다.
      </Callout>

      <H2>Backend (planned)</H2>
      <UL>
        <li>배포 순서: <strong>마이그레이션 → 백엔드 → 프론트엔드</strong>. 새 컬럼을 쓰는 프론트가 먼저 올라가지 않게 합니다.</li>
        <li>운영용 <Ic>.env</Ic>를 새로 만듭니다 (JWT 비밀키, DB 주소). 로컬 값을 복사하지 마세요.</li>
        <li>시드 관리자 계정은 로컬 테스트용입니다. 운영에서는 비밀번호를 바꾸거나 삭제하세요.</li>
      </UL>

      <H2>Cookies &amp; HTTPS</H2>
      <UL>
        <li>리프레시 쿠키는 <Ic>HttpOnly</Ic>, <Ic>Secure</Ic>, <Ic>SameSite=Lax</Ic>로 설정합니다. <Ic>Secure</Ic>는 HTTPS에서만 전달됩니다.</li>
        <li>프론트와 백엔드가 같은 도메인(프록시)이면 CORS 설정을 늘릴 필요가 없습니다.</li>
        <li>도메인을 나누어 배포한다면 쿠키 도메인과 CORS 허용 출처를 직접 맞춰야 합니다.</li>
      </UL>

      <H2>Go-live checklist</H2>
      <OL>
        <li>HTTPS가 켜져 있고 HTTP는 HTTPS로 이동한다</li>
        <li><Ic>/docs</Ic>가 닫혀 있거나 별도 주소로 옮겨져 있다</li>
        <li>시드 관리자 비밀번호를 바꿨거나 계정을 지웠다</li>
        <li>운영 JWT 비밀키가 새로 만들어졌고 저장소에 없다</li>
        <li>로그인·가입·역할 변경을 운영 환경에서 한 번씩 시험했다</li>
        <li>Security 페이지의 체크리스트를 확인했다</li>
      </OL>
    </>
  );
}
