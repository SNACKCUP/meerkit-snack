/** 컴포넌트를 누가 쓰는지: 사용자 화면 / 관리자 화면 / 둘 다 쓰는 공통 */
export type Audience = "user" | "admin" | "common";

export const AUDIENCES: Record<Audience, { section: string; badge: string; hint: string; tone: { bar: string } }> = {
  user: { section: "사용자 화면", badge: "사용자용", hint: "서비스를 쓰는 일반 사용자가 보는 화면에 쓰입니다.", tone: { bar: "border-sky-500/40" } },
  admin: { section: "관리자 화면", badge: "관리자용", hint: "관리자(MASTER)만 쓰는 화면에 쓰입니다.", tone: { bar: "border-violet-500/40" } },
  common: { section: "공통", badge: "공통", hint: "사용자 화면과 관리자 화면 모두에서 쓰입니다.", tone: { bar: "border-slate-500/40" } },
};

export interface DocMeta {
  slug: string;
  title: string;
  description: string;
  /** 컴포넌트 페이지에만 있다. 사이드바의 2단 구분과 페이지 머리말에 쓰인다 */
  audience?: Audience;
}

export interface DocGroup {
  label: string;
  items: DocMeta[];
}

// 사이드바 순서이자 이전/다음 페이지 순서.
export const docGroups: DocGroup[] = [
  {
    label: "Getting Started",
    items: [
      { slug: "introduction", title: "Introduction", description: "Meerkit이 무엇이고 무엇을 제공하는지 소개합니다." },
      { slug: "installation", title: "Installation", description: "명령어 한 줄로 프로젝트를 만들고 로컬에서 실행합니다." },
      { slug: "project-structure", title: "Project Structure", description: "폴더 구조와 어디에 무엇을 두는지 설명합니다." },
      { slug: "theming", title: "Theming", description: "Tailwind와 shadcn 위에 얹은 Meerkit 스타일을 설정하고, 쓰지 않을 때 정리하는 방법입니다." },
      { slug: "deployment", title: "Deployment", description: "Meerkit으로 만든 내 서비스를 운영 환경에 배포할 때 설정하고 확인할 것입니다." },
    ],
  },
  {
    label: "Core Concepts",
    items: [
      { slug: "authentication", title: "Authentication", description: "회원가입, 로그인, 토큰 흐름과 보안 규칙을 설명합니다." },
      { slug: "roles", title: "Roles & Permissions", description: "역할 4종과 CRUD 권한, 가드 사용법을 설명합니다." },
      { slug: "data-model", title: "Data Model", description: "users, roles 테이블과 필드를 정리합니다." },
      { slug: "login-lockout", title: "Login Lockout", description: "n번 연속 실패하면 m분 동안 로그인을 잠그고, 새로고침해도 유지하는 방법입니다." },
      { slug: "security", title: "Security", description: "킷이 맡는 보안과 내 서비스가 직접 챙겨야 할 보안 체크리스트입니다." },
    ],
  },
  {
    label: "Guides",
    items: [
      { slug: "guide-protect-page", title: "Protect a page", description: "내 서비스 화면을 로그인과 역할로 보호하는 순서를 따라 합니다." },
      { slug: "guide-add-role", title: "Add a role", description: "기본 4종 외에 새 역할을 추가하는 순서입니다." },
      { slug: "guide-call-api", title: "Call your own API", description: "내 백엔드 API를 토큰이 자동으로 붙는 클라이언트로 호출합니다." },
    ],
  },
  {
    label: "Components",
    items: [
      { slug: "components", title: "Overview", description: "킷이 제공하는 모든 컴포넌트를 한눈에 봅니다." },
      { slug: "login-form", title: "Login Form", description: "아이디와 비밀번호로 로그인하는 폼입니다.", audience: "user" },
      { slug: "signup-form", title: "Signup Form", description: "아이디, 이름, 이메일, 비밀번호를 받는 가입 폼입니다.", audience: "user" },
      { slug: "email-verification", title: "Email Verification", description: "이메일 인증번호 받기·확인 버튼. 서비스에 따라 켜고 끌 수 있습니다.", audience: "user" },
      { slug: "terms-agreement", title: "Terms Agreement", description: "가입 시 약관 동의를 받는 체크박스 영역과, 체크박스·라디오 컴포넌트입니다.", audience: "user" },
      { slug: "google-login", title: "Google Login", description: "로그인·가입 폼 아래에 구글 계정으로 시작하는 버튼을 붙이는 옵션입니다.", audience: "user" },
      { slug: "password-reset", title: "Password Reset", description: "이메일 링크로 비밀번호를 다시 정하는 비밀번호 찾기·재설정 화면입니다.", audience: "user" },
      { slug: "profile", title: "Profile & Password", description: "내 정보 수정과 비밀번호 변경 화면입니다.", audience: "user" },
      { slug: "nickname", title: "Nickname", description: "닉네임 입력, 자동 생성 버튼, 마이페이지에서의 닉네임 변경입니다.", audience: "user" },
      { slug: "auth-dialog", title: "Auth Dialog", description: "로그인과 가입을 하나로 묶은 모달입니다.", audience: "user" },
      { slug: "profile-image", title: "Profile Image", description: "프로필 이미지를 고르고 미리 보며 올리는 입력입니다.", audience: "user" },
      { slug: "user-avatar", title: "User Avatar", description: "프로필 이미지 또는 이니셜로 사용자를 나타내는 아바타입니다.", audience: "user" },
      { slug: "user-menu", title: "User Menu", description: "로그인한 사용자가 자기 계정을 다루는 아바타 드롭다운 메뉴입니다.", audience: "user" },
      { slug: "member-table", title: "Member Table", description: "관리자용 유저 목록 테이블입니다.", audience: "admin" },
      { slug: "member-directory", title: "Member Directory", description: "검색, 필터, 페이지네이션을 갖춘 관리자 멤버 목록입니다.", audience: "admin" },
      { slug: "member-ai-usage", title: "Member AI Usage", description: "멤버의 AI 사용량을 원형(Radial) 차트로 보여 줍니다. 프론트 UI만 제공하며 사용량 집계는 추후 적용 예정입니다.", audience: "admin" },
      { slug: "member-ai-usage-history", title: "Member AI Usage History", description: "멤버의 AI 사용량을 일·주·월별 막대(Bar) 차트로 보여 줍니다. 프론트 UI만 제공하며 사용량 집계는 추후 적용 예정입니다.", audience: "admin" },
      { slug: "role-manager", title: "Role Manager", description: "관리자가 사용자에게 권한(역할)을 부여하거나 바꾸는 확인 창입니다.", audience: "admin" },
      { slug: "role-select", title: "Role Select", description: "유저의 역할을 바꾸는 선택 상자입니다.", audience: "admin" },
      { slug: "address-field", title: "Address Field", description: "주소 검색 버튼으로 우편번호와 주소를 함께 입력하는 두 가지 주소 입력 방식입니다.", audience: "common" },
      { slug: "file-dropzone", title: "File Dropzone", description: "끌어다 놓거나 눌러서 첨부파일을 고르는 영역입니다.", audience: "common" },
      { slug: "loading", title: "Loading", description: "9가지 스타일의 로더와, 불러오는 중 화면에 공통으로 끼우는 모듈입니다.", audience: "common" },
      { slug: "date", title: "Date", description: "기본 달력, 날짜 선택, 시작·종료일 연동, 기간 범위 선택 입력입니다.", audience: "common" },
      { slug: "route-guards", title: "Route Guards", description: "로그인과 역할로 화면을 보호합니다.", audience: "common" },
    ],
  },
  {
    label: "AI Components",
    items: [
      { slug: "ai-prompt-input", title: "AI Prompt Input", description: "AI에게 질문하거나 코멘트를 남기는 입력 폼. 글 입력, 파일 첨부, 에이전트 선택, 보내기·중지를 한 덩어리로 묶었습니다." },
      { slug: "thinking-indicator", title: "Thinking Indicator", description: "AI가 답을 준비하는 동안 보여 주는 \"생각 중\" 애니메이션입니다." },
      { slug: "api-key-input", title: "API Key Input", description: "사용자가 자기 AI API 키를 넣는 입력 칸과, 웰컴 페이지의 AI 테스트(LlmPlayground)입니다. 로그인 안내와 토큰 사용량 표시를 포함합니다." },
      { slug: "voice", title: "Voice", description: "마이크로 말하면 입력창에 글로 들어가고, 목소리 크기에 따라 컬러 파동이 일렁입니다." },
    ],
  },
  {
    label: "API",
    items: [
      { slug: "api-overview", title: "Overview", description: "API 공통 규칙과 묶음 목록입니다." },
      { slug: "api-health", title: "Health", description: "서버 상태 확인 API입니다." },
      { slug: "api-auth", title: "Auth", description: "회원가입, 로그인, 토큰 재발급, 이메일 인증, 비밀번호 찾기·재설정 API입니다." },
      { slug: "api-users-me", title: "Users · 내 정보", description: "내 정보 조회·수정, 비밀번호 변경, 탈퇴 API입니다." },
      { slug: "api-users-admin", title: "Users · 관리자", description: "멤버 검색, 역할 변경, 활성/비활성, 삭제 API입니다 (MASTER 전용)." },
      { slug: "api-llm", title: "LLM", description: "내 API 키로 AI에게 한 번 묻고 답과 토큰 사용량을 받는 API입니다 (로그인 필요)." },
    ],
  },
  {
    label: "Reference",
    items: [
      { slug: "hooks", title: "Hooks & State", description: "useAuth, 쿼리, 뮤테이션, 스토어 목록입니다." },
      { slug: "faq", title: "FAQ", description: "자주 묻는 질문과 문제 해결입니다." },
    ],
  },
];

export const allDocs: DocMeta[] = docGroups.flatMap((g) => g.items);

export const docHref = (slug: string) => (slug === "introduction" ? "/docs" : `/docs/${slug}`);
