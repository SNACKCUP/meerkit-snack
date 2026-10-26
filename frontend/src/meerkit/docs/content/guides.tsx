"use client";

import { Badge } from "@/components/ui/badge";

import { Callout, CodeBlock, DocTable, H2, H3, Ic, OL, P, Tree, UL } from "../ui";

export function Security() {
  return (
    <>
      <P>
        인증 킷은 <strong>보안의 일부만</strong> 대신해 줍니다. 아래 표는 킷이 맡는 부분과, 내 서비스를 운영하기 전에 직접 확인해야 하는 부분을 나눈 것입니다.
      </P>
      <Callout tone="warn">
        백엔드는 아직 구현 전이라 서버 쪽 항목은 <strong>설계 기준(예정)</strong>입니다. 구현되는 대로 이 표를 실제 동작에 맞춰 갱신합니다.
      </Callout>

      <H2>Who is responsible</H2>
      <DocTable
        head={["항목", "킷이 하는 일", "내가 해야 할 일"]}
        rows={[
          ["비밀번호 저장", "서버가 Argon2 같은 해시로만 저장하도록 설계 (원문 저장 안 함)", "해시 알고리즘·비용 설정을 운영 환경에서 점검"],
          ["액세스 토큰", "메모리에만 보관. localStorage에 저장하지 않음", "토큰 수명을 서비스 성격에 맞게 조정"],
          ["리프레시 토큰", "httpOnly 쿠키로 전달 (자바스크립트에서 읽을 수 없음)", "운영에서 Secure, SameSite 옵션 확인, HTTPS 사용"],
          ["권한 검사", "화면 가드(RequireAuth, RequireRole)와 서버 검증 구조 제공", "내 API마다 서버에서 역할을 반드시 다시 검사"],
          ["입력 검증", "폼에서 형식·길이를 먼저 검사", "서버에서 같은 규칙으로 다시 검증"],
          ["가입 시 역할", "화면에서 역할을 고르지 않음. 서버가 기본 역할 부여", "기본 역할이 최소 권한(예: VIEWER)인지 확인"],
          ["로그인 잠금", "브라우저에서 n회 실패 시 m분 잠금, 새로고침해도 유지 (안내용)", "서버에서 같은 규칙으로 차단하고 429 + Retry-After 응답"],
          ["비밀번호 재설정", "메일 링크 화면과 안내 문구 제공", "토큰 해시 저장, 짧은 만료, 단일 사용, 메일 발송"],
          ["요청 횟수 제한", "포함되지 않음", "로그인·가입·재설정 메일 재발송에 레이트 리밋을 추가"],
          ["이메일 인증", "인증번호 받기·확인 화면, 재전송 대기(안내용)", "증표를 서버가 검증하고, 인증번호는 해시 저장·짧은 만료·시도 횟수 제한"],
          ["파일 첨부", "형식·크기·개수 사전 검사 (편의용)", "서버가 실제 내용·크기를 다시 검사하고 안전한 이름으로 저장"],
          ["권한 변경", "확인 창과 위험 변경 경고", "MASTER만 허용, 마지막 MASTER 보호, 변경 기록"],
          ["약관 동의 증빙", "필수 약관 미동의 시 가입 차단 (화면)", "서버도 필수 약관을 검증하고 동의 시각을 저장"],
          ["감사 로그", "포함되지 않음", "역할 변경, 탈퇴 처리 같은 관리 작업의 기록이 필요하면 추가"],
          ["HTTPS·CORS", "같은 도메인 프록시(/api)로 CORS 부담을 줄임", "운영에서 HTTPS 강제, 허용 출처 최소화"],
        ]}
      />

      <H2>Browser side</H2>
      <UL>
        <li>React는 기본적으로 출력값을 이스케이프합니다. <Ic>dangerouslySetInnerHTML</Ic>은 쓰지 마세요.</li>
        <li>액세스 토큰을 로그, URL, 쿼리 문자열에 남기지 마세요.</li>
        <li>화면에서 버튼을 숨기는 것은 사용자 편의입니다. 숨겼다고 접근이 막힌 것이 아닙니다.</li>
      </UL>

      <H2>Server side (planned)</H2>
      <UL>
        <li>모든 보호 API는 요청의 토큰에서 사용자를 확인하고, 역할이 허용되는지 검사합니다.</li>
        <li>사용자 정보를 돌려줄 때 <Ic>password_hash</Ic>를 절대 포함하지 않습니다.</li>
        <li>일반 사용자가 자신의 역할을 바꾸거나 다른 사용자의 데이터를 읽지 못하게 합니다.</li>
        <li>계정 삭제는 바로 지우지 않고 <Ic>deactivated_at</Ic>을 기록해 막고, 보관 기간 뒤 개인정보만 지웁니다(<Ic>deleted_at</Ic>).</li>
      </UL>

      <H2>Before going live</H2>
      <OL>
        <li>시드 관리자 계정의 비밀번호를 바꾸거나 계정을 삭제했는지</li>
        <li>JWT 비밀키가 운영용으로 새로 생성되었고 저장소에 없는지</li>
        <li><Ic>.env</Ic>가 커밋되지 않았는지</li>
        <li>운영 환경에서 HTTPS와 쿠키 <Ic>Secure</Ic> 옵션이 켜져 있는지</li>
        <li>내 모든 API에 서버 측 권한 검사가 있는지</li>
        <li>로그인 잠금과 요청 횟수 제한이 서버에도 있는지 (브라우저 잠금만으로는 부족)</li>
        <li>비밀번호 재설정 토큰이 해시로 저장되고 만료·단일 사용인지</li>
        <li>샘플 약관(<Ic>/terms</Ic>, <Ic>/privacy</Ic>)을 실제 약관으로 교체했는지</li>
        <li>개발용 안내(<Ic>/docs</Ic> 라우트)를 끄거나 별도 주소로 옮겼는지</li>
      </OL>
    </>
  );
}

export function GuideProtectPage() {
  return (
    <>
      <P>
        내 서비스에 <Ic>/reports</Ic> 화면을 만들고, <strong>로그인한 사람만</strong> 볼 수 있게 한 뒤 <strong>관리자(MASTER)만</strong> 보는 영역을 나누는 과정입니다.
      </P>
      <Callout>
        서비스 화면은 <Ic>src/app/(service)/</Ic>에 만듭니다. 킷 폴더(<Ic>src/meerkit</Ic>)는 수정하지 않습니다.
      </Callout>

      <H2>1. Create the page</H2>
      <P>라우트 파일은 얇게 두고, 화면 본체는 클라이언트 컴포넌트로 분리합니다.</P>
      <Tree>{`
src/app/(service)/reports/
├── page.tsx          라우트 연결 (서버 컴포넌트)
└── ReportsPage.tsx   화면 본체 ("use client")
`}</Tree>
      <CodeBlock title="app/(service)/reports/page.tsx" code={`import { ReportsPage } from "./ReportsPage";\n\nexport default function Page() {\n  return <ReportsPage />;\n}`} />

      <H2>2. Require login</H2>
      <CodeBlock title="ReportsPage.tsx" code={`"use client";\n\nimport { RequireAuth } from "@/meerkit";\n\nexport function ReportsPage() {\n  return (\n    <RequireAuth>\n      <h1>리포트</h1>\n    </RequireAuth>\n  );\n}`} />
      <P>로그인하지 않은 사용자에게는 안내 문구와 로그인 버튼이 보입니다. 로그인하면 같은 자리에 내용이 나타납니다.</P>

      <H2>3. Split by role</H2>
      <P>같은 화면 안에서 일부만 관리자에게 보여 주려면 <Ic>useAuth</Ic>의 <Ic>isAdmin</Ic>을 씁니다. 화면 전체를 막으려면 <Ic>RequireRole</Ic>로 감쌉니다.</P>
      <CodeBlock title="tsx" code={`import { RequireAuth, RequireRole, ADMIN_ROLE, useAuth } from "@/meerkit";\n\nfunction ReportsContent() {\n  const { isAdmin } = useAuth();\n  return (\n    <>\n      <h1>리포트</h1>\n      {isAdmin && <button>전체 삭제</button>}   {/* 편의용 숨김 */}\n    </>\n  );\n}\n\nexport function ReportsPage() {\n  return (\n    <RequireAuth>\n      <ReportsContent />\n    </RequireAuth>\n  );\n}\n\n// 관리자 전용 화면\nexport function ReportsAdminPage() {\n  return (\n    <RequireRole role={ADMIN_ROLE}>\n      <ReportsContent />\n    </RequireRole>\n  );\n}`} />

      <H2>4. Hide the link too</H2>
      <P>접근할 수 없는 메뉴를 보여 주지 않는 것이 좋습니다. 사용자 메뉴에 바로가기를 추가할 때도 역할로 걸러 주세요.</P>
      <CodeBlock title="tsx" code={`const { user, isAdmin } = useAuth();\nconst items = [\n  { label: "리포트", href: "/reports" },\n  ...(isAdmin ? [{ label: "전체 리포트", href: "/reports/all" }] : []),\n];\n\n<UserMenu user={user} items={items} onLogout={() => logout.mutate()} />`} />

      <H2>5. Verify on the server</H2>
      <Callout tone="warn">
        위 가드는 화면만 보호합니다. 리포트 데이터를 주는 <strong>API도 서버에서 로그인과 역할을 검사해야</strong> 합니다. 그렇지 않으면 주소를 직접 호출해 데이터를 볼 수 있습니다.
      </Callout>

      <H2>Checklist</H2>
      <UL>
        <li>로그아웃 상태에서 <Ic>/reports</Ic>를 열면 로그인 안내가 보인다</li>
        <li>VIEWER로 로그인하면 관리자 전용 영역이 보이지 않는다</li>
        <li>MASTER로 로그인하면 모두 보인다</li>
        <li>VIEWER 토큰으로 관리자 API를 직접 호출하면 403이 나온다 (서버 검증)</li>
      </UL>
    </>
  );
}

export function GuideAddRole() {
  return (
    <>
      <P>기본 역할(MASTER, OWNER, VIEWER, WRITER) 외에 <Ic>AUDITOR</Ic>(감사 조회 전용) 역할을 추가한다고 가정하고 따라 합니다.</P>

      <H2>1. Add it to the database</H2>
      <P>역할은 <Ic>roles</Ic> 테이블의 한 행입니다. 마이그레이션으로 추가합니다.</P>
      <DocTable
        head={["id", "name", "description"]}
        rows={[[5, <Badge key="b" variant="brand">AUDITOR</Badge>, "감사 로그 조회 전용"]]}
      />
      <Callout>백엔드는 아직 구현 전이라, 실제 마이그레이션 명령은 구현 후 이 가이드에 맞춰 채웁니다.</Callout>

      <H2>2. Add it to the frontend</H2>
      <P>프론트의 역할 목록은 <Ic>src/meerkit/roles.ts</Ic> 한 곳입니다. 한 줄만 추가하면 타입, 역할 선택 상자, 문서 표가 모두 따라옵니다.</P>
      <CodeBlock title="src/meerkit/roles.ts" code={`export const ROLES = [\n  { id: 1, name: "MASTER", description: "시스템 전체 관리자", crud: "CRUD" },\n  { id: 2, name: "OWNER", description: "자신이 소유한 데이터 관리", crud: "CRUD" },\n  { id: 3, name: "VIEWER", description: "조회 전용 사용자", crud: "R" },\n  { id: 4, name: "WRITER", description: "데이터 작성 및 수정 사용자", crud: "CRU" },\n  { id: 5, name: "AUDITOR", description: "감사 로그 조회 전용", crud: "R" }, // 추가\n] as const;`} />
      <UL>
        <li><Ic>RoleName</Ic> 타입이 자동으로 <Ic>&quot;AUDITOR&quot;</Ic>를 포함합니다.</li>
        <li><Ic>RoleSelect</Ic>와 <Ic>MemberTable</Ic>이 새 역할을 선택지로 보여 줍니다.</li>
      </UL>

      <H2>3. Use it in guards</H2>
      <CodeBlock title="tsx" code={`<RequireRole role="AUDITOR">\n  <AuditLogPage />\n</RequireRole>`} />
      <P><Ic>RequireRole</Ic>는 역할 <strong>하나</strong>와 일치하는지 검사합니다. 여러 역할을 허용하려면 <Ic>useAuth</Ic>로 직접 비교하세요.</P>
      <CodeBlock title="tsx" code={`const { user } = useAuth();\nconst allowed = ["MASTER", "AUDITOR"].includes(user?.role.name ?? "");`} />

      <H2>4. Enforce on the server</H2>
      <P>서버의 해당 API가 새 역할을 허용 목록에 포함하는지 확인합니다. 화면만 바꾸면 새 역할은 아직 아무 것도 할 수 없습니다.</P>

      <H2>Naming tips</H2>
      <UL>
        <li>이름은 대문자 영문(<Ic>AUDITOR</Ic>)으로 고정합니다. 코드에서 비교하는 키이기 때문입니다.</li>
        <li>설명(<Ic>description</Ic>)은 사람이 읽는 문구라 한글로 써도 됩니다.</li>
        <li>역할이 많아지면 역할 대신 세부 권한(permissions 테이블)을 도입하는 것을 검토하세요.</li>
      </UL>
    </>
  );
}

export function GuideCallApi() {
  return (
    <>
      <P>
        내 서비스의 백엔드 API를 호출할 때는 킷의 <Ic>api</Ic> 클라이언트를 그대로 씁니다. 로그인 토큰이 자동으로 붙고, 토큰이 만료되면 알아서 갱신한 뒤 다시 시도합니다.
      </P>

      <H2>What the client does</H2>
      <UL>
        <li>모든 요청에 <Ic>Authorization: Bearer ...</Ic>를 자동으로 붙입니다.</li>
        <li>401이 오면 리프레시 쿠키로 토큰을 한 번 갱신하고 요청을 재시도합니다.</li>
        <li>갱신에도 실패하면 로그아웃 상태가 되어 로그인 안내가 나옵니다.</li>
        <li>주소는 <Ic>/api</Ic> 아래로 나가고, Next.js 프록시가 백엔드로 전달합니다.</li>
      </UL>

      <H2>1. Write the API function</H2>
      <Tree>{`
src/app/(service)/reports/
├── api.ts            서버 호출 함수
├── queries.ts        TanStack Query 훅
└── ReportsPage.tsx
`}</Tree>
      <CodeBlock title="app/(service)/reports/api.ts" code={`import { api } from "@/meerkit";\n\nexport interface Report {\n  id: number;\n  title: string;\n}\n\nexport const reportsApi = {\n  list: () => api.get<Report[]>("/reports").then((r) => r.data),\n  create: (title: string) => api.post<Report>("/reports", { title }).then((r) => r.data),\n};`} />

      <H2>2. Wrap it in a hook</H2>
      <P>서버 데이터는 TanStack Query에 맡깁니다. 쿼리 키는 <Ic>[&quot;meerkit&quot;, ...]</Ic>와 겹치지 않게 서비스 이름으로 시작하세요.</P>
      <CodeBlock title="queries.ts" code={`import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";\nimport { reportsApi } from "./api";\n\nconst key = ["reports"] as const;\n\nexport const useReports = () => useQuery({ queryKey: key, queryFn: reportsApi.list });\n\nexport function useCreateReport() {\n  const queryClient = useQueryClient();\n  return useMutation({\n    mutationFn: reportsApi.create,\n    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),\n  });\n}`} />

      <H2>3. Use it in the screen</H2>
      <CodeBlock title="ReportsPage.tsx" code={`"use client";\n\nimport { RequireAuth } from "@/meerkit";\nimport { useReports } from "./queries";\n\nfunction List() {\n  const { data, isLoading, isError } = useReports();\n  if (isLoading) return <p>불러오는 중…</p>;\n  if (isError) return <p>목록을 불러오지 못했습니다.</p>;\n  return <ul>{data?.map((r) => <li key={r.id}>{r.title}</li>)}</ul>;\n}\n\nexport const ReportsPage = () => (\n  <RequireAuth>\n    <List />\n  </RequireAuth>\n);`} />

      <H2>Handling errors</H2>
      <DocTable
        head={["Status", "의미", "권장 처리"]}
        rows={[
          ["400 / 422", "입력값 오류", "서버가 준 detail을 폼 아래에 표시"],
          ["401", "로그인 필요 (갱신도 실패)", "클라이언트가 이미 처리. 화면은 RequireAuth가 안내"],
          ["403", "역할이 허용되지 않음", "접근 권한 없음 안내"],
          ["404", "대상 없음", "빈 상태 또는 안내 표시"],
          ["5xx", "서버 오류", "재시도 안내"],
        ]}
      />
      <H3>오류 메시지 꺼내기</H3>
      <CodeBlock title="tsx" code={`import { isAxiosError } from "axios";\n\nfunction message(error: unknown) {\n  if (isAxiosError(error)) return error.response?.data?.detail ?? "요청에 실패했습니다.";\n  return "알 수 없는 오류가 발생했습니다.";\n}`} />
      <Callout tone="warn">
        <Ic>axios</Ic>를 직접 만들어 쓰면 토큰이 붙지 않습니다. 서비스 API는 항상 킷의 <Ic>api</Ic>를 사용하세요.
      </Callout>
    </>
  );
}
