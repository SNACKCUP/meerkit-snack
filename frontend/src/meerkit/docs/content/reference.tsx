"use client";

import { useContext, useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { IndexingContext } from "../indexing";
import { Callout, CodeBlock, DocTable, H2, H3, Ic, P } from "../ui";

export function Hooks() {
  return (
    <>
      <P>킷의 상태는 두 갈래입니다. <strong>서버 데이터</strong>는 TanStack Query, <strong>토큰과 모달 상태</strong>는 Zustand입니다. 내 정보를 Zustand에 복사하지 않고 항상 <Ic>useMe()</Ic>로 가져옵니다.</P>
      <H2>useAuth</H2>
      <P>가장 자주 쓰는 훅입니다. 로그인 상태와 내 정보를 한 번에 줍니다.</P>
      <CodeBlock title="tsx" code={`const { user, isAuthenticated, isLoading, isAdmin } = useAuth();`} />
      <DocTable
        head={["값", "타입", "설명"]}
        rows={[
          [<Ic key="1">user</Ic>, "User | undefined", "내 정보. 로그인 전이면 undefined"],
          [<Ic key="2">isAuthenticated</Ic>, "boolean", "액세스 토큰이 있는지"],
          [<Ic key="3">isLoading</Ic>, "boolean", "내 정보를 불러오는 중인지"],
          [<Ic key="4">isAdmin</Ic>, "boolean", "역할이 MASTER인지"],
        ]}
      />
      <H2>Examples</H2>
      <H3>로그인한 사용자 이름 보여 주기</H3>
      <CodeBlock title="tsx" code={`const { user, isLoading } = useAuth();\nif (isLoading) return <p>불러오는 중…</p>;\nreturn <p>{user ? \`\${user.name}님\` : "로그인이 필요합니다"}</p>;`} />
      <H3>역할에 따라 버튼 보이기</H3>
      <CodeBlock title="tsx" code={`const { user } = useAuth();\nconst canWrite = ["MASTER", "OWNER", "WRITER"].includes(user?.role.name ?? "");\n\n{canWrite && <Button>새 글 쓰기</Button>}`} />
      <H3>로그아웃 버튼 직접 만들기</H3>
      <CodeBlock title="tsx" code={`const logout = useLogout();\n<Button onClick={() => logout.mutate()} disabled={logout.isPending}>로그아웃</Button>`} />
      <H2>Queries</H2>
      <DocTable
        head={["훅", "반환", "쿼리 키"]}
        rows={[
          [<Ic key="1">useMe()</Ic>, "내 정보 (토큰이 있을 때만 실행)", <Ic key="a">[&quot;meerkit&quot;, &quot;me&quot;]</Ic>],
          [<Ic key="2">useMembers(query)</Ic>, "조건에 맞는 한 페이지 { items, total, page, size } (관리자)", <Ic key="b">[&quot;meerkit&quot;, &quot;admin&quot;, &quot;members&quot;, query]</Ic>],
        ]}
      />
      <H2>Mutations</H2>
      <DocTable
        head={["훅", "호출", "성공 시"]}
        rows={[
          [<Ic key="1">useLogin()</Ic>, "mutate({ user_id, password })", "토큰 저장, 모달 닫기"],
          [<Ic key="2">useSignup()</Ic>, "mutate({ user_id, name, email, password })", "가입 후 자동 로그인"],
          [<Ic key="3">useLogout()</Ic>, "mutate()", "토큰 제거, 내 정보 캐시 삭제"],
          [<Ic key="4">useUpdateRoles()</Ic>, "mutate({ id, roles })", "멤버 목록 다시 불러오기 (PUT /users/{id}/roles)"],
          [<Ic key="4b">useUpdateActive()</Ic>, "mutate({ id, isActive })", "활성/비활성·잠금 해제·탈퇴 취소 후 목록 다시 불러오기 (PATCH /users/{id}/active)"],
          [<Ic key="5">useRemoveMember()</Ic>, "mutate(id)", "멤버 목록 다시 불러오기"],
          [<Ic key="6">useForgotPassword()</Ic>, "mutate({ email })", "isSuccess가 true가 되면 안내 화면"],
          [<Ic key="a">useSendEmailCode()</Ic>, "mutate({ email })", "인증번호 발송 (이메일 인증 사용 시)"],
          [<Ic key="b">useVerifyEmailCode()</Ic>, "mutate({ email, code })", "성공하면 { token } 반환"],
          [<Ic key="7">useResetPassword()</Ic>, "mutate({ token, password })", "isSuccess가 true가 되면 완료 화면"],
          [<Ic key="8">useUpdateProfile()</Ic>, "mutate({ name, email, ... })", "내 정보 캐시 갱신, 토스트"],
          [<Ic key="9">useChangePassword()</Ic>, "mutate({ current_password, new_password })", "토스트"],
        ]}
      />
      <H2>Stores</H2>
      <H3>useAuthStore</H3>
      <CodeBlock title="tsx" code={`const accessToken = useAuthStore((s) => s.accessToken);\nconst setAccessToken = useAuthStore((s) => s.setAccessToken);`} />
      <Callout tone="warn">토큰 스토어에 <Ic>persist</Ic>를 쓰지 마세요. 액세스 토큰은 메모리에만 있어야 합니다.</Callout>
      <H3>useAuthDialog</H3>
      <CodeBlock title="tsx" code={`const { open, mode, openDialog, closeDialog, setMode } = useAuthDialog();\n// mode: "login" | "signup" | "forgot"`} />
      <H3>useLockoutStore · useLoginLockout</H3>
      <P>로그인 실패 횟수와 잠금 시각입니다. <Ic>sessionStorage</Ic>에 저장되어 새로고침해도 유지됩니다 (Login Lockout 참고).</P>
      <CodeBlock title="tsx" code={`const { lockedUntil, attemptsLeft } = useLoginLockout();`} />
      <Callout>액세스 토큰 스토어에는 <Ic>persist</Ic>를 쓰지 않지만, 잠금 스토어는 의도적으로 <Ic>sessionStorage</Ic>에 저장합니다. 토큰과 달리 민감하지 않은 값이기 때문입니다.</Callout>
      <H2>Config</H2>
      <P>사용자가 고치는 설정은 프로젝트 루트의 <Ic>meerkit.config.ts</Ic>이고, 코드에서 읽는 값은 <Ic>meerkitConfig</Ic>입니다.</P>
      <DocTable
        head={["키", "타입", "기본값", "설명"]}
        rows={[
          [<Ic key="1">theme</Ic>, '"meerkit" | "shadcn"', "meerkit", "스타일 모드 (Theming 참고)"],
          [<Ic key="2">motion</Ic>, "boolean", "true", "false면 Meerkit 애니메이션 끄기"],
          [<Ic key="3">signup.passwordConfirm</Ic>, "boolean", "false", "가입 폼에 비밀번호 확인 추가"],
          [<Ic key="4">signup.optionalFields</Ic>, "SignupOptionalField[]", "[]", "가입 폼의 선택 항목 (nickname, phone, address, birth_date, gender)"],
          [<Ic key="a1">signup.addressType</Ic>, '"basic" | "postcode"', "basic", "주소 입력 방식 (주소+상세 / 우편번호+주소+상세)"],
          [<Ic key="a3">signup.addressSearch</Ic>, '"popup" | "dialog"', "popup", "주소 검색 방식 (카카오 팝업 / 검색 창)"],
          [<Ic key="a4">signup.nickname</Ic>, "{ generator, autoFill }", "{ true, false }", "닉네임 [자동 생성] 버튼, 가입 폼 미리 채우기"],
          [<Ic key="a2">signup.emailVerification</Ic>, "boolean", "false", "이메일 인증번호 받기·확인 사용 여부"],
          [<Ic key="5">signup.terms</Ic>, "TermsItem[]", "약관 3종", "가입 시 동의받을 약관. 빈 배열이면 숨김"],
          [<Ic key="l1">loading.variant</Ic>, "LoaderVariant", '"ring"', "불러오는 중 표시 스타일 9종 중 하나"],
          [<Ic key="v1">ai.voice.colors</Ic>, "string[]", "파랑·보라·분홍·청록", "음성 입력 파동 색 (2개 이상)"],
          [<Ic key="6">login.maxAttempts</Ic>, "number", "5", "연속 실패 허용 횟수. 0이면 잠금 끄기"],
          [<Ic key="7">login.lockMinutes</Ic>, "number", "5", "잠금 시간(분)"],
        ]}
      />
      <CodeBlock title="tsx" code={`import { meerkitConfig } from "@/meerkit";\n\nmeerkitConfig.routes.adminMembers; // "/admin/members"\nmeerkitConfig.docsUrl;            // 웰컴 페이지 Docs 링크`} />
    </>
  );
}

type FaqCategory = "general" | "account" | "signup" | "admin" | "style" | "deploy";

const FAQ_CATEGORIES: { id: FaqCategory | "all"; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "general", label: "일반" },
  { id: "account", label: "계정·로그인" },
  { id: "signup", label: "가입" },
  { id: "admin", label: "권한·관리자" },
  { id: "style", label: "스타일·설정" },
  { id: "deploy", label: "배포·보안" },
];

const FAQ_ITEMS: { id: string; category: FaqCategory; q: string; a: React.ReactNode }[] = [
  { id: "stack", category: "general", q: "서비스 화면은 어디에 만드나요?", a: <><Ic>src/app/(service)/</Ic>에 만들고, 필요한 기능은 <Ic>@/meerkit</Ic>에서 가져옵니다.</> },
  { id: "api-call", category: "general", q: "내 서비스 API는 어떻게 호출하나요?", a: <><Ic>api</Ic> 클라이언트를 쓰세요. 토큰이 자동으로 붙습니다. Call your own API 가이드를 보세요.</> },
  { id: "not-included", category: "general", q: "소셜 로그인이나 2단계 인증은 있나요?", a: "아직 포함되지 않았습니다. Introduction의 \"What is not included\"에 제공하지 않는 기능을 정리해 두었습니다." },
  { id: "avatar", category: "general", q: "아바타에 프로필 이미지를 넣고 싶어요.", a: <>서버가 <Ic>User.avatar_url</Ic>에 이미지 주소를 담아 주면 자동으로 보입니다. 업로드는 File Dropzone으로 파일을 고르게 하고, 올리는 부분은 서비스에서 만드세요.</> },
  { id: "attachment", category: "general", q: "첨부파일은 어떻게 받나요?", a: <>File Dropzone으로 끌어다 놓거나 눌러서 파일을 고르게 합니다. 파일을 서버로 올리는 일은 서비스가 하며, 서버에서 형식·크기·내용을 다시 검사해야 합니다.</> },

  { id: "login-id", category: "account", q: "로그인이 아이디인가요, 이메일인가요?", a: <>아이디(<Ic>user_id</Ic>)입니다. 이메일은 가입 시 별도로 받습니다.</> },
  { id: "refresh", category: "account", q: "새로고침하면 로그아웃되나요?", a: "아니요. 액세스 토큰은 메모리에만 있지만, 새로고침 시 리프레시 쿠키로 자동으로 복원합니다." },
  { id: "lock-n", category: "account", q: "로그인을 몇 번 틀리면 잠기나요? 바꿀 수 있나요?", a: <>기본은 5번 연속 실패 시 5분 잠금입니다. <Ic>meerkit.config.ts</Ic>의 <Ic>login.maxAttempts</Ic>, <Ic>login.lockMinutes</Ic>로 바꾸고, 0이면 끕니다.</> },
  { id: "lock-reload", category: "account", q: "새로고침하면 잠금이 풀리나요?", a: "아니요. 실패 횟수와 잠금 시각을 sessionStorage에 저장해서 새로고침해도 유지됩니다. 탭을 닫으면 사라집니다." },
  { id: "lock-secure", category: "account", q: "브라우저 잠금만 있으면 안전한가요?", a: "아니요. 사용자가 저장소를 지우거나 다른 기기로 우회할 수 있습니다. 서버에서도 같은 규칙으로 차단해야 합니다." },
  { id: "reset-mail", category: "account", q: "비밀번호 찾기 메일은 누가 보내나요?", a: "서버가 보냅니다. 킷은 화면과 API 규약만 제공합니다. 로컬 테스트에는 메일 캐처를 쓰는 것을 권장합니다." },
  { id: "profile-edit", category: "account", q: "내 정보 수정이나 비밀번호 변경 화면이 있나요?", a: <>있습니다. <Ic>/me</Ic>에서 프로필 수정과 비밀번호 변경 탭을 제공합니다 (Profile &amp; Password 참고).</> },
  { id: "nickname-change", category: "account", q: "닉네임은 어디서 바꾸나요?", a: <><Ic>signup.optionalFields</Ic>에 <Ic>&quot;nickname&quot;</Ic>을 켜면 가입 때 입력받고, 마이페이지(<Ic>/me</Ic>) 요약 카드의 [변경]으로 바꿀 수 있습니다. 닉네임이 있으면 메뉴와 아바타에 이름 대신 닉네임이 보입니다.</> },
  { id: "forgot-text", category: "account", q: "비밀번호 찾기 화면의 문구는 어떻게 바꾸나요?", a: <>해당 컴포넌트 파일의 글자를 직접 고칩니다. 모달 제목·설명은 <Ic>AuthDialog.tsx</Ic>의 <Ic>copy.forgot</Ic>, 안내와 버튼은 <Ic>ForgotPasswordForm.tsx</Ic>에 있습니다. 파일별 위치는 Password Reset 페이지의 &quot;Change the text&quot;에 정리했습니다. 메일 본문은 서버 템플릿에서 바꿉니다.</> },

  { id: "role-signup", category: "signup", q: "가입할 때 역할을 고를 수 있나요?", a: "아니요. 일반 사용자가 스스로 MASTER를 지정하면 안 되므로, 기본 역할은 서버가 부여합니다. 역할 변경은 관리자 화면에서만 합니다." },
  { id: "terms-edit", category: "signup", q: "약관을 바꾸거나 없애고 싶어요.", a: <><Ic>signup.terms</Ic>를 고치세요. 빈 배열이면 약관 영역이 사라집니다. 약관 문구(/terms, /privacy)는 샘플이므로 교체해야 합니다.</> },
  { id: "more-fields", category: "signup", q: "가입 폼에 항목을 더 받고 싶어요.", a: <><Ic>signup.optionalFields</Ic>에 <Ic>nickname</Ic>, <Ic>phone</Ic>, <Ic>address</Ic>, <Ic>birth_date</Ic>, <Ic>gender</Ic>를 넣으세요. 백엔드 컬럼도 필요합니다.</> },
  { id: "address-type", category: "signup", q: "주소 입력은 어떤 방식이 있나요?", a: <>두 가지입니다. <Ic>basic</Ic>은 주소 + 상세 주소, <Ic>postcode</Ic>는 우편번호 + 주소 + 상세 주소입니다. <Ic>signup.addressType</Ic>으로 고릅니다. 주소 검색 버튼으로 고르면 우편번호와 주소가 함께 채워집니다.</> },
  { id: "address-search", category: "signup", q: "주소 검색은 무엇을 쓰나요?", a: <>두 가지입니다. 기본은 카카오(다음) 우편번호 팝업(서버 불필요)이고, <Ic>signup.addressSearch: &quot;dialog&quot;</Ic>로 바꾸면 결과 목록과 [더 보기]가 있는 검색 창을 씁니다(서비스 서버의 <Ic>/address/search</Ic> 필요). 팝업을 불러오지 못하면 직접 입력할 수 있게 열립니다.</> },
  { id: "address-many", category: "signup", q: "주소 검색 결과가 너무 많으면 어떻게 되나요?", a: "검색 창은 10건씩 보여 주고 [더 보기]로 이어서 불러옵니다. 결과가 아주 많으면 번지나 건물명을 더해 좁히도록 안내하며, 카카오 API처럼 가져올 수 있는 개수에 상한이 있는 서비스에서는 검색어를 좁히는 것이 가장 좋습니다." },
  { id: "nickname-auto", category: "signup", q: "닉네임을 자동으로 만들어 줄 수 있나요?", a: <>네. 닉네임을 켜면 입력칸 옆에 [자동 생성] 버튼이 생기고(<Ic>용감한미어캣482</Ic> 형태), <Ic>signup.nickname.autoFill: true</Ic>이면 가입 폼을 열 때 미리 채워 둡니다.</> },
  { id: "email-verify", category: "signup", q: "이메일 인증을 켜고 끄려면?", a: <><Ic>meerkit.config.ts</Ic>의 <Ic>signup.emailVerification</Ic>을 true/false로 바꾸세요. 켜면 이메일 옆에 [인증번호 받기]가 생기고, 인증해야 가입할 수 있습니다. 서비스마다 필요 여부가 달라서 기본은 꺼져 있습니다.</> },

  { id: "multi-role", category: "admin", q: "한 사용자가 여러 역할을 가질 수 있나요?", a: "네. users와 roles를 user_roles 연결 테이블로 이어서 여러 역할을 가질 수 있습니다. 화면에서는 user.roles 배열을 보고, 변경은 PUT /users/{id}/roles로 역할 코드 목록을 보냅니다." },
  { id: "add-role", category: "admin", q: "역할을 하나 더 만들고 싶어요.", a: <>Add a role 가이드를 따라 <Ic>roles.ts</Ic>와 서버를 함께 고치세요.</> },
  { id: "role-change", category: "admin", q: "관리자가 역할을 바꾸는 화면은 어떻게 생겼나요?", a: <>멤버 표의 역할 옆 [변경]을 누르면 확인 창이 열립니다. 역할별로 할 수 있는 일(C·R·U·D)을 보고 고르며, 본인의 관리자 권한을 내리거나 MASTER를 부여할 때는 경고가 나옵니다 (Role Manager 참고).</> },
  { id: "admin-slow", category: "admin", q: "관리자 목록이 느려요 / 멤버가 많아요.", a: "검색·필터·페이지 나누기를 서버에서 처리하세요. 화면은 GET /users의 q, role_id, status, page, size를 그대로 보냅니다." },

  { id: "color", category: "style", q: "색을 바꾸고 싶어요.", a: <><Ic>src/meerkit/styles/tokens.css</Ic>의 <Ic>--mk-blue</Ic>, <Ic>--mk-primary</Ic> 등을 바꾸세요. Theming 페이지를 보세요.</> },
  { id: "no-meerkit", category: "style", q: "Meerkit 스타일을 쓰고 싶지 않아요.", a: <><Ic>meerkit.config.ts</Ic>에서 <Ic>theme: &quot;shadcn&quot;</Ic>으로 바꾸세요. 자세한 내용은 Theming 페이지에 있습니다.</> },
  { id: "motion-off", category: "style", q: "애니메이션을 끄고 싶어요.", a: <><Ic>meerkit.config.ts</Ic>에서 <Ic>motion: false</Ic>로 설정하세요. OS의 &quot;동작 줄이기&quot;를 켠 사용자에게는 자동으로 꺼집니다.</> },

  { id: "hide-docs", category: "deploy", q: "이 문서(/docs) 페이지를 내 서비스에서 숨기고 싶어요.", a: <><Ic>NEXT_PUBLIC_SHOW_DOCS_PAGE=false</Ic>로 설정하면 404가 됩니다. Deployment 페이지를 보세요.</> },
  { id: "go-live", category: "deploy", q: "운영에 올리기 전에 꼭 확인할 것은?", a: "Security 페이지의 체크리스트를 확인하세요. 시드 관리자 비밀번호, JWT 비밀키, HTTPS, 서버 측 권한 검사, 로그인 잠금, 샘플 약관 교체가 핵심입니다." },
];

const countOf = (id: FaqCategory | "all") => (id === "all" ? FAQ_ITEMS.length : FAQ_ITEMS.filter((i) => i.category === id).length);

export function Faq() {
  const indexing = useContext(IndexingContext);
  const [tab, setTab] = useState<FaqCategory | "all">("all");
  const items = tab === "all" ? FAQ_ITEMS : FAQ_ITEMS.filter((i) => i.category === tab);
  const label = (id: string) => FAQ_CATEGORIES.find((c) => c.id === id)?.label;

  return (
    <>
      <P>궁금한 주제를 골라 보세요. 기본은 <strong>전체</strong>입니다. 질문을 누르면 답이 부드럽게 펼쳐집니다.</P>

      <Tabs value={tab} onValueChange={(v) => setTab(v as FaqCategory | "all")}>
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <TabsList className="h-auto flex-wrap justify-start gap-1 p-1">
            {FAQ_CATEGORIES.map((c) => (
              <TabsTrigger key={c.id} value={c.id} className="gap-1.5 px-3 py-1.5">
                {c.label}
                <span className="rounded-full bg-background/70 px-1.5 text-[10px] tabular-nums text-muted-foreground">{countOf(c.id)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {/* 탭이 바뀌면 목록이 부드럽게 교체된다. 검색 인덱스를 만들 때는 전부 펼쳐서 읽는다 */}
      <div key={indexing ? "index" : tab} className="mk-swap mt-2">
        <Accordion
          {...(indexing
            ? { type: "multiple" as const, value: FAQ_ITEMS.map((i) => i.id) }
            : { type: "single" as const, collapsible: true })}
          className="grid gap-2"
        >
          {(indexing ? FAQ_ITEMS : items).map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger>
                <span className="flex flex-wrap items-center gap-2">
                  {item.q}
                  {tab === "all" && <Badge variant="secondary" className="font-normal">{label(item.category)}</Badge>}
                </span>
              </AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <H2>Common errors</H2>
      <DocTable
        head={["증상", "확인할 것"]}
        rows={[
          ["항상 로그인 모달이 뜸", "백엔드가 실행 중인지, /api 프록시 주소(API_PROXY_TARGET)가 맞는지"],
          ["401이 계속 반복됨", "리프레시 쿠키가 전달되는지(같은 도메인, withCredentials)"],
          ["관리자 화면이 접근 권한 없음", "내 역할이 MASTER인지"],
          ["가입 시 409", "이미 사용 중인 아이디 또는 이메일"],
          ["주소 검색 버튼이 동작하지 않음", "주소 검색 스크립트(카카오 우편번호)를 불러올 수 있는 네트워크인지. 실패하면 직접 입력으로 열립니다"],
          ["인증번호를 받지 못함", "서버의 메일 발송 설정과 스팸함 확인. 로컬에서는 메일 캐처 확인"],
        ]}
      />
    </>
  );
}
