"use client";

import { Callout, CodeBlock, DocTable, H2, H3, Ic, OL, P, Tree, UL } from "../ui";
import { ROLES } from "../../roles";
import { Badge } from "@/components/ui/badge";

export function Authentication() {
  return (
    <>
      <P>인증은 <strong>짧게 사는 액세스 토큰</strong>과 <strong>쿠키에 담긴 리프레시 토큰</strong> 두 가지로 이루어집니다.</P>
      <H2>Token strategy</H2>
      <DocTable
        head={["토큰", "저장 위치", "수명", "용도"]}
        rows={[
          ["Access token", "메모리 (Zustand, persist 안 함)", "짧음", "API 요청의 Authorization 헤더"],
          ["Refresh token", "httpOnly 쿠키", "김", "액세스 토큰 재발급"],
        ]}
      />
      <UL>
        <li>액세스 토큰은 localStorage에 저장하지 않습니다. XSS로 읽히는 것을 막기 위해 메모리에만 둡니다.</li>
        <li>리프레시 토큰은 httpOnly 쿠키라 자바스크립트에서 읽을 수 없습니다.</li>
        <li><Ic>/api</Ic> 프록시로 프론트와 백엔드가 같은 도메인처럼 동작하므로 쿠키 방식이 잘 맞습니다.</li>
      </UL>
      <H2>Sign-up flow</H2>
      <Tree>{`
사용자가 회원가입 화면에 정보 입력
        ↓
프론트에서 입력값 검증 (필수, 이메일 형식, 비밀번호 8자 이상)
        ↓
POST /auth/signup
        ↓
서버: 아이디·이메일 중복 확인
        ↓
서버: 비밀번호 해시 (Argon2) 후 users 저장, 기본 역할 부여
        ↓
가입 완료 → 프론트가 이어서 자동 로그인
`}</Tree>
      <Callout tone="warn">
        가입 화면에는 역할 선택이 없습니다. 일반 사용자가 스스로 <Ic>MASTER</Ic>를 지정할 수 없도록, 기본 역할은 항상 서버가 부여합니다.
      </Callout>
      <H2>Login &amp; refresh</H2>
      <OL>
        <li><Ic>POST /auth/login</Ic>이 액세스 토큰을 응답하고 리프레시 쿠키를 설정합니다.</li>
        <li>프론트가 토큰을 스토어에 저장하고, <Ic>GET /users/me</Ic>로 내 정보를 가져옵니다.</li>
        <li>이후 모든 요청에 <Ic>Authorization: Bearer ...</Ic>가 자동으로 붙습니다.</li>
        <li>요청이 401을 받으면 <Ic>POST /auth/refresh</Ic>로 토큰을 갱신하고 원래 요청을 한 번 재시도합니다.</li>
        <li>새로고침하면 <Ic>MeerkitProvider</Ic>가 리프레시 쿠키로 세션을 복원합니다.</li>
      </OL>
      <H3>단일 갱신</H3>
      <P>여러 요청이 동시에 401을 받아도 갱신 요청은 <strong>한 번만</strong> 보냅니다. 나머지는 그 결과를 기다렸다가 새 토큰으로 재시도합니다.</P>
      <CodeBlock title="src/meerkit/api/client.ts" code={`let refreshing: Promise<string | null> | null = null;\n\napi.interceptors.response.use(undefined, async (error) => {\n  const original = error.config;\n  if (error.response?.status !== 401 || original._retried) {\n    return Promise.reject(error);\n  }\n  original._retried = true;\n  refreshing ??= refreshAccessToken().finally(() => (refreshing = null));\n  const token = await refreshing;\n  if (!token) return Promise.reject(error);\n  original.headers.Authorization = \`Bearer \${token}\`;\n  return api(original);\n});`} />
      <H2>Logout</H2>
      <OL>
        <li>사용자가 로그아웃을 누르면 <Ic>POST /auth/logout</Ic>으로 서버의 리프레시 토큰을 폐기합니다.</li>
        <li>서버 응답과 관계없이 프론트는 <strong>메모리의 액세스 토큰을 지우고</strong> 내 정보 캐시를 비웁니다.</li>
        <li>화면은 로그인 전 상태로 돌아가고, 보호된 화면은 로그인 안내를 보여 줍니다.</li>
      </OL>
      <H2>Session restore</H2>
      <P>액세스 토큰은 메모리에만 있어서 새로고침하면 사라집니다. 대신 앱이 시작될 때 리프레시 쿠키로 <Ic>POST /auth/refresh</Ic>를 한 번 호출해 로그인 상태를 되살립니다.</P>
      <DocTable
        head={["상황", "결과"]}
        rows={[
          ["리프레시 쿠키 유효", "새 액세스 토큰을 받아 로그인 상태 복원"],
          ["쿠키 없음·만료", "로그인 전 상태로 시작 (오류 표시 없음)"],
          ["다른 탭에서 로그아웃", "다음 요청에서 갱신이 실패하며 로그아웃 상태가 됨"],
        ]}
      />
      <H2>What the screen shows</H2>
      <DocTable
        head={["상황", "화면 동작"]}
        rows={[
          ["가입 성공", "자동 로그인 후 모달이 닫힘"],
          ["아이디·이메일 중복", "폼 아래에 서버 메시지 표시, 모달 유지"],
          ["로그인 실패", "폼 아래에 오류 메시지 표시"],
          ["보호된 화면에 비로그인으로 접근", "로그인 안내와 로그인 버튼 표시"],
          ["권한이 없는 화면", "접근 권한이 없습니다 표시"],
          ["비활성화·삭제된 계정", "로그인 차단 (서버가 거절)"],
          ["연속 로그인 실패", "남은 시도 안내 후 한도에 닿으면 잠금과 카운트다운"],
          ["약관 미동의", "필수 약관에 모두 동의해 주세요 오류, 요청은 나가지 않음"],
        ]}
      />
      <H2>Password policy</H2>
      <UL>
        <li>프론트는 8자 이상만 검사합니다. 복잡도(대소문자, 숫자, 특수문자) 규칙은 서버 정책으로 정하세요.</li>
        <li>비밀번호는 입력 후 화면 어디에도 다시 표시하거나 저장하지 않습니다.</li>
        <li>비밀번호 찾기·재설정과 비밀번호 변경은 제공됩니다 (Password Reset, Profile &amp; Password 참고).</li>
      </UL>
      <H2>Related features</H2>
      <DocTable
        head={["기능", "설명", "페이지"]}
        rows={[
          ["로그인 잠금", "n번 연속 실패하면 m분 잠금. 새로고침해도 유지", "Login Lockout"],
          ["이메일 인증 (선택)", "가입 시 인증번호로 이메일 확인", "Email Verification"],
          ["비밀번호 재설정", "이메일 링크로 새 비밀번호 설정", "Password Reset"],
          ["내 정보·비밀번호 변경", "로그인한 사용자가 직접 수정", "Profile & Password"],
          ["약관 동의", "가입 시 필수·선택 약관 동의", "Terms Agreement"],
        ]}
      />
      <H2>Not included yet</H2>
      <UL>
        <li>소셜 로그인, 2단계 인증</li>
        <li>모든 기기에서 로그아웃</li>
        <li>감사 로그</li>
      </UL>
      <H2>Security rules</H2>
      <UL>
        <li>비밀번호는 원문을 저장하지 않고 Argon2 같은 안전한 해시로만 저장합니다.</li>
        <li>응답에 <Ic>password_hash</Ic>를 포함하지 않습니다.</li>
        <li>사용자 정보 수정은 본인 또는 허용된 관리자만 가능합니다. 서버에서 검증합니다.</li>
        <li>다른 사용자의 데이터를 조회하거나 삭제하지 못하도록 서버에서 권한을 확인합니다.</li>
        <li>계정 탈퇴는 실제 삭제 대신 <Ic>deleted_at</Ic>을 기록하는 소프트 삭제를 권장합니다.</li>
        <li>시드 관리자 계정은 로컬 테스트 전용이며 <Ic>.env</Ic>는 커밋하지 않습니다.</li>
      </UL>
    </>
  );
}

export function Roles() {
  return (
    <>
      <P>사용자는 <strong>하나의 역할</strong>을 가지며, 역할은 <Ic>roles</Ic> 테이블에서 관리합니다. 화면의 접근 제어는 역할 이름으로 합니다.</P>
      <H2>Roles</H2>
      <DocTable
        head={["id", "name", "설명", "CRUD"]}
        rows={ROLES.map((r) => [r.id, <Badge key={r.id} variant="brand">{r.name}</Badge>, r.description, <Ic key="c">{r.crud}</Ic>])}
      />
      <H2>Permission matrix</H2>
      <DocTable
        head={["역할", "Create", "Read", "Update", "Delete"]}
        rows={[
          ["MASTER", "가능", "가능", "가능", "가능"],
          ["OWNER", "가능", "가능", "가능", "가능 (본인 소유 데이터)"],
          ["VIEWER", "불가", "가능", "불가", "불가"],
          ["WRITER", "가능", "가능", "가능", "정책에 따라 제한"],
        ]}
      />
      <Callout>
        실제 권한 범위는 서비스의 정책에 맞게 정하세요. 특히 OWNER는 본인 소유 데이터만 관리하도록 제한하는 것이 안전합니다.
      </Callout>
      <H2>Change roles in one place</H2>
      <P>프론트의 역할 정의는 <Ic>src/meerkit/roles.ts</Ic> 한 파일입니다. 역할 이름이나 설명이 바뀌면 여기만 고치세요.</P>
      <CodeBlock title="src/meerkit/roles.ts" code={`export const ROLES = [\n  { id: 1, name: "MASTER", description: "시스템 전체 관리자", crud: "CRUD" },\n  { id: 2, name: "OWNER", description: "자신이 소유한 데이터 관리", crud: "CRUD" },\n  { id: 3, name: "VIEWER", description: "조회 전용 사용자", crud: "R" },\n  { id: 4, name: "WRITER", description: "데이터 작성 및 수정 사용자", crud: "CRU" },\n] as const;\n\nexport const ADMIN_ROLE = "MASTER";`} />
      <H2>How a check works</H2>
      <OL>
        <li>로그인하면 <Ic>GET /users/me</Ic>가 내 정보와 역할을 돌려줍니다.</li>
        <li>프론트의 가드와 훅이 <Ic>user.role.name</Ic>을 보고 화면을 보여 줄지 정합니다.</li>
        <li>데이터를 요청하면 <strong>서버가 같은 역할을 다시 검사</strong>하고 허용될 때만 응답합니다.</li>
      </OL>
      <P>1~2번은 사용자 경험을, 3번은 실제 보안을 담당합니다. 둘 중 하나만으로는 안전하지 않습니다.</P>
      <H2>Protect a page</H2>
      <P>관리자만 볼 수 있는 화면은 <Ic>RequireRole</Ic>로 감쌉니다.</P>
      <CodeBlock title="tsx" code={`import { RequireRole, ADMIN_ROLE } from "@/meerkit";\n\nexport default function Page() {\n  return (\n    <RequireRole role={ADMIN_ROLE}>\n      <AdminDashboard />\n    </RequireRole>\n  );\n}`} />
      <H2>Check in code</H2>
      <CodeBlock title="tsx" code={`const { user, isAdmin } = useAuth();\n\nif (user?.role.name === "WRITER") {\n  // 작성 버튼 표시\n}`} />
      <Callout tone="warn">
        화면에서 버튼을 숨기는 것만으로는 보호가 되지 않습니다. 모든 보호는 FastAPI 백엔드에서도 <strong>반드시</strong> 검증해야 합니다.
      </Callout>
      <H2>Assign roles</H2>
      <UL>
        <li>회원가입 시 기본 역할은 서버가 자동으로 부여합니다.</li>
        <li>역할 변경은 관리자(MASTER)만 할 수 있습니다. <Ic>/admin/members</Ic>의 역할 선택 상자를 사용합니다.</li>
        <li>사용자당 역할은 하나이며, 변경하면 이전 역할은 대체됩니다.</li>
      </UL>
    </>
  );
}

export function DataModel() {
  return (
    <>
      <P>가장 먼저 구현하는 두 테이블은 <Ic>users</Ic>와 <Ic>roles</Ic>입니다. 회원 정보와 권한 정보를 분리해 두면 역할이 늘어나도 users 테이블을 바꿀 필요가 없습니다.</P>
      <H2>users</H2>
      <DocTable
        head={["컬럼", "타입 예시", "필수", "설명"]}
        rows={[
          [<Ic key="1">id</Ic>, "BIGINT", "필수", "사용자 고유 식별자 (PK). 자동 생성"],
          [<Ic key="2">user_id</Ic>, "VARCHAR(50)", "필수", "로그인 ID. UNIQUE"],
          [<Ic key="3">password_hash</Ic>, "VARCHAR(255)", "필수", "비밀번호 해시값"],
          [<Ic key="4">email</Ic>, "VARCHAR(255)", "필수", "이메일"],
          [<Ic key="5">name</Ic>, "VARCHAR(100)", "필수", "사용자 이름"],
          [<Ic key="6">role_id</Ic>, "BIGINT", "필수", "roles.id 참조 (FK)"],
          [<Ic key="7">is_active</Ic>, "BOOLEAN", "필수 권장", "계정 활성화 여부"],
          [<Ic key="8">created_at</Ic>, "TIMESTAMPTZ", "필수", "회원가입 일시"],
          [<Ic key="9">updated_at</Ic>, "TIMESTAMPTZ", "필수", "마지막 정보 수정 일시"],
          [<Ic key="10">deleted_at</Ic>, "TIMESTAMPTZ", "선택", "탈퇴·삭제 처리 일시 (소프트 삭제)"],
        ]}
      />
      <H3>id와 user_id의 차이</H3>
      <UL>
        <li><Ic>id</Ic>: 데이터베이스 내부에서 사용자를 구분하는 고유 번호입니다.</li>
        <li><Ic>user_id</Ic>: 사용자가 로그인할 때 입력하는 ID입니다. 중복되지 않아야 합니다.</li>
      </UL>
      <H2>roles</H2>
      <DocTable
        head={["컬럼", "타입 예시", "설명"]}
        rows={[
          [<Ic key="1">id</Ic>, "BIGINT", "PK"],
          [<Ic key="2">name</Ic>, "VARCHAR(30)", "역할 이름"],
          [<Ic key="3">description</Ic>, "TEXT", "역할 설명"],
        ]}
      />
      <H2>Relationship</H2>
      <Tree>{`
┌──────────────────┐
│      roles       │
│ id (PK)          │
│ name             │
│ description      │
└────────┬─────────┘
         │ 1 : N
┌────────▼─────────┐
│      users       │
│ id (PK)          │
│ user_id (UNIQUE) │
│ password_hash    │
│ email, name      │
│ role_id (FK)     │
│ is_active        │
│ created_at       │
│ updated_at       │
│ deleted_at       │
└──────────────────┘
`}</Tree>
      <P>역할 하나에 여러 사용자가 연결됩니다. Viewer가 100명이어도 <Ic>roles</Ic>에는 VIEWER가 한 번만 있고, 사용자들이 그것을 참조합니다.</P>
      <H2>Frontend type</H2>
      <P>API가 돌려주는 사용자는 역할이 객체로 펼쳐진 형태입니다. <Ic>password_hash</Ic>는 포함되지 않습니다.</P>
      <CodeBlock title="src/meerkit/types.ts" code={`export interface User {\n  id: number;\n  user_id: string;\n  email: string;\n  name: string;\n  role: { id: number; name: RoleName };\n  is_active: boolean;\n  created_at: string;\n  updated_at: string;\n  deleted_at: string | null;\n}`} />
      <H2>Optional columns</H2>
      <P>가입 폼의 선택 항목(Signup Form 참고)을 켜면 <Ic>users</Ic>에 같은 컬럼이 필요합니다. 기본 스키마에는 포함되어 있지 않습니다.</P>
      <DocTable
        head={["컬럼", "타입 예시", "필수 여부", "설명"]}
        rows={[
          [<Ic key="0">nickname</Ic>, "VARCHAR(30)", <Badge key="n" variant="secondary">선택</Badge>, "닉네임 (UNIQUE 권장). 있으면 이름 대신 표시"],
          [<Ic key="1">phone</Ic>, "VARCHAR(20)", <Badge key="a" variant="secondary">선택</Badge>, "전화번호"],
          [<Ic key="6">postcode</Ic>, "VARCHAR(10)", <Badge key="p" variant="secondary">선택</Badge>, "우편번호 (addressType이 postcode일 때)"],
          [<Ic key="2">address</Ic>, "VARCHAR(255)", <Badge key="b" variant="secondary">선택</Badge>, "주소 (검색으로 채워짐)"],
          [<Ic key="7">address_detail</Ic>, "VARCHAR(255)", <Badge key="d2" variant="secondary">선택</Badge>, "상세 주소 (동·호수 등 직접 입력)"],
          [<Ic key="3">birth_date</Ic>, "DATE", <Badge key="c" variant="secondary">선택</Badge>, "생년월일"],
          [<Ic key="5">gender</Ic>, "VARCHAR(10)", <Badge key="e" variant="secondary">선택</Badge>, "성별 (male, female, none)"],
          [<Ic key="4">email_verified_at</Ic>, "TIMESTAMPTZ", <Badge key="d" variant="secondary">선택</Badge>, "이메일 인증 완료 시각 (인증 기능 도입 시)"],
        ]}
      />
      <H2>Terms agreements</H2>
      <P>
        약관 동의는 <strong>누가 어떤 약관에 언제 동의했는지</strong> 남겨야 분쟁 때 증빙할 수 있습니다. 가입 요청의 <Ic>agreed_terms</Ic>를 받아 서버가 별도 테이블에 저장하는 방식을 권장합니다.
      </P>
      <DocTable
        head={["컬럼", "타입 예시", "설명"]}
        rows={[
          [<Ic key="1">user_id</Ic>, "BIGINT", "users.id 참조"],
          [<Ic key="2">term_id</Ic>, "VARCHAR(30)", "약관 식별자 (terms, privacy, marketing …)"],
          [<Ic key="3">agreed_at</Ic>, "TIMESTAMPTZ", "동의한 시각"],
          [<Ic key="4">version</Ic>, "VARCHAR(20)", "동의 당시 약관 버전 (약관 개정 대응)"],
        ]}
      />
      <H2>Email verifications</H2>
      <P>이메일 인증(<Ic>signup.emailVerification</Ic>)을 켰다면 인증번호와 증표를 저장할 곳이 필요합니다.</P>
      <DocTable
        head={["컬럼", "타입 예시", "설명"]}
        rows={[
          [<Ic key="1">email</Ic>, "VARCHAR(255)", "인증 대상 이메일"],
          [<Ic key="2">code_hash</Ic>, "VARCHAR(255)", "인증번호의 해시"],
          [<Ic key="3">expires_at</Ic>, "TIMESTAMPTZ", "인증번호 만료 시각 (예: 3분)"],
          [<Ic key="4">verified_token_hash</Ic>, "VARCHAR(255)", "인증 성공 시 발급한 증표의 해시 (가입 때 확인)"],
          [<Ic key="5">attempts</Ic>, "INT", "확인 시도 횟수 (무차별 대입 방지)"],
        ]}
      />
      <H2>Password reset tokens</H2>
      <DocTable
        head={["컬럼", "타입 예시", "설명"]}
        rows={[
          [<Ic key="1">user_id</Ic>, "BIGINT", "users.id 참조"],
          [<Ic key="2">token_hash</Ic>, "VARCHAR(255)", "토큰의 해시 (원본은 저장하지 않음)"],
          [<Ic key="3">expires_at</Ic>, "TIMESTAMPTZ", "만료 시각"],
          [<Ic key="4">used_at</Ic>, "TIMESTAMPTZ", "사용된 시각 (단일 사용)"],
        ]}
      />
      <H2>AI usage (planned)</H2>
      <P>
        멤버 AI 사용량 화면(Member AI Usage, Member AI Usage History)은 현재 <strong>프론트 UI만 작업된 상태</strong>입니다. 사용량을 기록·집계하는 테이블과 API는 <strong>추후 적용 예정</strong>입니다.
      </P>
      <H2>Future extensions</H2>
      <UL>
        <li><Ic>permissions</Ic>, <Ic>role_permissions</Ic>: 세부 기능별 권한이 필요할 때 추가합니다.</li>
        <li><Ic>projects</Ic>: Owner가 여러 프로젝트를 소유하는 구조가 필요할 때 추가합니다.</li>
        <li><Ic>refresh_tokens</Ic>: 토큰 해시, 만료, 폐기 시각을 저장합니다.</li>
      </UL>
    </>
  );
}

export function ApiReference() {
  return (
    <>
      <P>프론트는 <Ic>/api</Ic> 아래로 호출하고, Next.js 프록시가 백엔드(<Ic>localhost:8000</Ic>)로 전달합니다. 아래 경로는 <Ic>/api</Ic>를 뺀 값입니다.</P>
      <H2>Conventions</H2>
      <DocTable
        head={["항목", "규칙"]}
        rows={[
          ["Base URL", <Ic key="1">/api</Ic>],
          ["인증", <Ic key="2">Authorization: Bearer &lt;access_token&gt;</Ic>],
          ["본문 형식", "JSON (Content-Type: application/json)"],
          ["리프레시 토큰", "httpOnly 쿠키. 요청에 자동 포함 (withCredentials)"],
          ["오류 응답", <Ic key="3">{`{ "detail": "메시지" }`}</Ic>],
          ["시간 형식", "ISO 8601 (UTC), 예: 2026-10-05T09:00:00Z"],
        ]}
      />
      <H2>Endpoints</H2>
      <DocTable
        head={["Method", "Path", "기능", "권한"]}
        rows={[
          [<Badge key="1" variant="outline">POST</Badge>, <Ic key="a">/auth/signup</Ic>, "회원가입", "비로그인"],
          [<Badge key="2" variant="outline">POST</Badge>, <Ic key="b">/auth/login</Ic>, "로그인", "비로그인"],
          [<Badge key="3" variant="outline">POST</Badge>, <Ic key="c">/auth/refresh</Ic>, "액세스 토큰 갱신", "리프레시 쿠키"],
          [<Badge key="4" variant="outline">POST</Badge>, <Ic key="d">/auth/logout</Ic>, "로그아웃", "로그인"],
          [<Badge key="14" variant="outline">POST</Badge>, <Ic key="n">/auth/email/send-code</Ic>, "이메일 인증번호 발송 (선택 기능)", "비로그인"],
          [<Badge key="15" variant="outline">POST</Badge>, <Ic key="o">/auth/email/verify-code</Ic>, "인증번호 확인, 증표 발급 (선택 기능)", "비로그인"],
          [<Badge key="11" variant="outline">POST</Badge>, <Ic key="k">/auth/password/forgot</Ic>, "비밀번호 재설정 메일 요청", "비로그인"],
          [<Badge key="12" variant="outline">POST</Badge>, <Ic key="l">/auth/password/reset</Ic>, "토큰으로 새 비밀번호 설정", "비로그인 (토큰)"],
          [<Badge key="5" variant="outline">GET</Badge>, <Ic key="e">/users/me</Ic>, "내 정보 조회", "로그인"],
          [<Badge key="6" variant="outline">PATCH</Badge>, <Ic key="f">/users/me</Ic>, "내 정보 수정", "로그인"],
          [<Badge key="13" variant="outline">PATCH</Badge>, <Ic key="m">/users/me/password</Ic>, "비밀번호 변경", "로그인"],
          [<Badge key="7" variant="outline">GET</Badge>, <Ic key="g">/users</Ic>, "사용자 목록 (검색·필터·페이지)", "관리자"],
          [<Badge key="8" variant="outline">GET</Badge>, <Ic key="h">/users/&#123;id&#125;</Ic>, "특정 사용자 조회", "관리자 등"],
          [<Badge key="9" variant="outline">PATCH</Badge>, <Ic key="i">/users/&#123;id&#125;/role</Ic>, "역할 변경", "관리자"],
          [<Badge key="10" variant="outline">DELETE</Badge>, <Ic key="j">/users/&#123;id&#125;</Ic>, "삭제·탈퇴 처리", "정책에 따름"],
        ]}
      />
      <H2>Sign up</H2>
      <CodeBlock title="POST /auth/signup" code={`// request\n{\n  "user_id": "writer01",\n  "name": "이작성",\n  "email": "writer@example.com",\n  "password": "min-8-chars",\n  "agreed_terms": ["terms", "privacy"],\n  "nickname": "미어캣",                 // 켠 선택 항목만\n  "postcode": "06236",\n  "address": "서울특별시 강남구 테헤란로 152",\n  "address_detail": "12층 1201호",\n  "email_verification_token": "..."      // 이메일 인증을 켠 경우\n}\n\n// response 201\n{ "id": 2, "user_id": "writer01", "name": "이작성", ... }`} />
      <H2>Login</H2>
      <CodeBlock title="POST /auth/login" code={`// request\n{ "user_id": "writer01", "password": "min-8-chars" }\n\n// response 200 (+ Set-Cookie: refresh_token=...; HttpOnly)\n{ "access_token": "eyJhbGciOi..." }`} />
      <H2>Login errors</H2>
      <DocTable
        head={["Status", "의미", "화면 동작"]}
        rows={[
          ["401 / 400", "아이디·비밀번호 틀림", "실패 횟수 +1, 남은 시도 안내"],
          ["429 / 423", "서버가 잠금 (Retry-After 초)", "그 시간만큼 폼 잠금"],
          ["403", "비활성·삭제된 계정", "오류 문구 표시 (실패로 세지 않음)"],
          ["5xx / 네트워크", "서버 문제", "오류 표시 (실패로 세지 않음)"],
        ]}
      />
      <H2>Member list</H2>
      <CodeBlock title="GET /users" code={`GET /users?q=kim&role_id=3&status=active&page=2&size=10\n\n// response 200\n{ "items": [ ...User ], "total": 27, "page": 2, "size": 10 }`} />
      <H2>Current user</H2>
      <CodeBlock title="GET /users/me" code={`// response 200\n{\n  "id": 2,\n  "user_id": "writer01",\n  "email": "writer@example.com",\n  "name": "이작성",\n  "role": { "id": 4, "name": "WRITER" },\n  "is_active": true,\n  "created_at": "2026-10-05T09:00:00Z",\n  "updated_at": "2026-10-05T09:00:00Z",\n  "deleted_at": null\n}`} />
      <H2>Change role</H2>
      <CodeBlock title="PATCH /users/{id}/role" code={`// request (관리자만)\n{ "role_id": 3 }\n\n// response 200 → 갱신된 User`} />
      <H2>Errors</H2>
      <DocTable
        head={["Status", "의미", "프론트 동작"]}
        rows={[
          ["400 / 422", "입력값 오류", "폼 아래에 detail 메시지 표시"],
          ["401", "인증 필요 또는 만료", "토큰 자동 갱신 후 재시도, 실패 시 로그아웃 상태"],
          ["403", "권한 없음", "접근 권한이 없습니다 표시"],
          ["409", "아이디·이메일 중복", "폼 아래에 메시지 표시"],
        ]}
      />
      <H2>Profile &amp; password</H2>
      <CodeBlock title="PATCH /users/me" code={`// request (바꿀 항목만 또는 전체)\n{ "name": "김관리자", "email": "master@example.com" }\n\n// response 200 → 갱신된 User`} />
      <CodeBlock title="PATCH /users/me/password" code={`{ "current_password": "...", "new_password": "..." }\n// 204 | 400 { "detail": "현재 비밀번호가 올바르지 않습니다." }`} />
      <H2>Client functions</H2>
      <P>서비스의 API 주소 규칙이 다르다면 <Ic>src/meerkit/api/</Ic>의 함수만 고치면 됩니다. 화면 코드는 바꾸지 않아도 됩니다.</P>
      <CodeBlock title="src/meerkit/api/users.ts" code={`export const usersApi = {\n  list: () => api.get<User[]>("/users").then((r) => r.data),\n  updateRole: (id: number, role_id: number) =>\n    api.patch<User>(\`/users/\${id}/role\`, { role_id }).then((r) => r.data),\n  remove: (id: number) => api.delete(\`/users/\${id}\`),\n};`} />
    </>
  );
}
