"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { MemberTable } from "../../admin/components/MemberTable";
import { RoleSelect } from "../../admin/components/RoleSelect";
import { AuthDialog } from "../../auth/components/AuthDialog";
import { LoginForm } from "../../auth/components/LoginForm";
import { SignupForm } from "../../auth/components/SignupForm";
import { UserAvatar } from "../../auth/components/UserAvatar";
import { UserMenu } from "../../auth/components/UserMenu";
import { useAuthDialog } from "../../auth/dialog-store";
import { Badge } from "@/components/ui/badge";

import type { AddressType, SignupOptionalField } from "../../define-config";
import type { RoleName } from "../../roles";
import { Callout, CodeBlock, DocLinks, DocTable, H2, H3, Ic, links, P, Preview, PreviewWide, PropsTable, UL } from "../ui";
import { demoAddressProvider, demoCheckUserId, demoEmailHandlers, mockUsers } from "./mock";

const noop = () => {};

export function LoginFormDoc() {
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <DocLinks items={[links.component("input", "Input"), links.component("label", "Label"), links.component("button", "Button")]} />
      <P>아이디와 비밀번호를 입력받는 폼입니다. 서버 호출은 하지 않고 입력값만 <Ic>onSubmit</Ic>으로 넘기므로 어떤 곳에서도 재사용할 수 있습니다.</P>
      <H2>When to use</H2>
      <UL>
        <li>로그인 전용 페이지(<Ic>/login</Ic>)를 만들 때 폼 자체를 그대로 배치합니다.</li>
        <li>모달이 아니라 페이지 안에 넣고 싶을 때. 모달로 쓰려면 Auth Dialog가 이미 이 폼을 쓰고 있습니다.</li>
        <li>서버 호출 방식을 바꾸고 싶을 때. 폼은 입력만 받고 <Ic>onSubmit</Ic>으로 넘기므로 호출 방법을 자유롭게 바꿀 수 있습니다.</li>
      </UL>
      <H2>Preview</H2>
      <Preview code={`<LoginForm\n  onSubmit={(input) => login.mutate(input)}\n  pending={login.isPending}\n  error={message}\n/>`}>
        <LoginForm onSubmit={() => setError("아이디 또는 비밀번호가 올바르지 않습니다.")} error={error} />
      </Preview>
      <H2>States</H2>
      <UL>
        <li><strong>기본:</strong> 두 입력이 모두 필수입니다.</li>
        <li><strong>진행 중:</strong> <Ic>pending</Ic>이 true면 버튼이 비활성화되고 &quot;로그인 중…&quot;으로 바뀝니다.</li>
        <li><strong>오류:</strong> <Ic>error</Ic> 문자열이 있으면 버튼 위에 빨간 글씨로 표시됩니다.</li>
      </UL>
      <Preview>
        <LoginForm onSubmit={noop} pending />
      </Preview>
      <H2>Props</H2>
      <PropsTable
        rows={[
          ["onSubmit", "(input: LoginInput) => void", "제출 시 { user_id, password }를 전달합니다.", true],
          ["pending", "boolean", "요청 중 여부. 버튼을 잠급니다."],
          ["error", "string | null", "표시할 오류 메시지."],
          ["lockedUntil", "number | null", "잠금이 풀리는 시각(ms). 미래 값이면 폼이 잠깁니다."],
          ["attemptsLeft", "number | null", "잠기기까지 남은 시도 횟수. null이면 표시하지 않습니다."],
          ["onForgotPassword", "() => void", "있으면 \"비밀번호를 잊으셨나요?\" 링크를 보여 줍니다."],
        ]}
      />
      <H2>Usage</H2>
      <CodeBlock title="tsx" code={`import { LoginForm } from "@/meerkit/auth/components/LoginForm";\nimport { useLogin } from "@/meerkit/auth/mutations";\n\nexport function MyLogin() {\n  const login = useLogin();\n  return <LoginForm onSubmit={login.mutate} pending={login.isPending} />;\n}`} />
      <H2>Lockout &amp; forgot password</H2>
      <P>연속으로 실패하면 폼이 잠기고, 비밀번호를 잊은 사용자를 위한 링크도 붙일 수 있습니다. 둘 다 props로 켭니다.</P>
      <Preview code={`<LoginForm\n  onSubmit={login.mutate}\n  lockedUntil={lock.lockedUntil}\n  attemptsLeft={lock.attemptsLeft}\n  onForgotPassword={() => setMode("forgot")}\n/>`}>
        <LoginForm onSubmit={noop} error="아이디 또는 비밀번호가 올바르지 않습니다." attemptsLeft={2} onForgotPassword={noop} />
      </Preview>
      <UL>
        <li><Ic>attemptsLeft</Ic>를 주면 오류 옆에 <Ic>(남은 시도 N회)</Ic>가 붙습니다.</li>
        <li><Ic>lockedUntil</Ic>(잠금이 풀리는 시각)이 미래면 입력과 버튼이 잠기고 남은 시간이 줄어듭니다. 설정과 동작은 Login Lockout 페이지를 보세요.</li>
        <li><Ic>onForgotPassword</Ic>를 주면 비밀번호 입력 위에 <Ic>비밀번호를 잊으셨나요?</Ic> 링크가 생깁니다.</li>
      </UL>
      <H2>Accessibility</H2>
      <UL>
        <li>모든 입력에 <Ic>Label</Ic>이 <Ic>htmlFor</Ic>로 연결되어 있어 라벨을 눌러도 입력창에 포커스가 갑니다.</li>
        <li>브라우저·비밀번호 관리자가 인식하도록 <Ic>autoComplete</Ic>(<Ic>username</Ic>, <Ic>current-password</Ic>)를 지정했습니다.</li>
        <li>오류 메시지는 <Ic>role=&quot;alert&quot;</Ic>라 스크린리더가 바로 읽어 줍니다.</li>
        <li>Enter 키로 제출됩니다.</li>
      </UL>
      <H2>Customization</H2>
      <P>폼의 모양은 <Ic>LoginForm.tsx</Ic> 한 파일에서만 정의합니다. 입력을 추가하려면 상태와 <Ic>onSubmit</Ic> 인자를 함께 늘리세요.</P>
      <CodeBlock title="LoginForm.tsx" code={`const [remember, setRemember] = useState(false);

onSubmit({ user_id: userId.trim(), password, remember });`} />
      <H2>Related</H2>
      <UL>
        <li><Ic>useLogin</Ic>: 서버 호출과 토큰 저장 (Hooks &amp; State 참고)</li>
        <li><Ic>AuthDialog</Ic>: 이 폼을 모달로 감싼 컴포넌트</li>
      </UL>
    </>
  );
}

const signupTerms = [
  { id: "terms", label: "이용약관 동의", required: true, href: "/terms" },
  { id: "privacy", label: "개인정보 수집 및 이용 동의", required: true, href: "/privacy" },
  { id: "marketing", label: "마케팅 정보 수신 동의", required: false },
];

const optionalSamples: { key: SignupOptionalField; label: string }[] = [
  { key: "nickname", label: "닉네임" },
  { key: "phone", label: "전화번호" },
  { key: "address", label: "주소" },
  { key: "birth_date", label: "생년월일" },
  { key: "gender", label: "성별" },
];

export function SignupFormDoc() {
  const [confirm, setConfirm] = useState(false);
  const [withTerms, setWithTerms] = useState(true);
  const [withEmail, setWithEmail] = useState(false);
  const [addressType, setAddressType] = useState<AddressType>("basic");
  const [fields, setFields] = useState<SignupOptionalField[]>([]);
  const toggle = (key: SignupOptionalField) =>
    setFields((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  return (
    <>
      <DocLinks items={[links.component("input", "Input"), links.component("label", "Label"), links.component("button", "Button")]} />
      <P>
        아이디, 이름, 이메일, 비밀번호를 받는 가입 폼입니다. 이 네 가지는 <strong>항상 필수</strong>이고, 비밀번호 확인과 주소·전화번호·생년월일 같은 항목은
        설정으로 <strong>켜고 끌 수 있습니다.</strong>
      </P>

      <H2>Preview</H2>
      <P>아래 버튼으로 항목을 켜 보세요. 폼이 부드럽게 늘어납니다.</P>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={confirm ? "default" : "outline"} onClick={() => setConfirm((v) => !v)}>비밀번호 확인</Button>
        <Button size="sm" variant={withTerms ? "default" : "outline"} onClick={() => setWithTerms((v) => !v)}>약관 동의</Button>
        <Button size="sm" variant={withEmail ? "default" : "outline"} onClick={() => setWithEmail((v) => !v)}>이메일 인증</Button>
        {optionalSamples.map((f) => (
          <Button key={f.key} size="sm" variant={fields.includes(f.key) ? "default" : "outline"} onClick={() => toggle(f.key)}>
            {f.label}
          </Button>
        ))}
      </div>
      {fields.includes("address") && (
        <div className="mk-swap flex items-center gap-2 text-xs text-muted-foreground">
          주소 입력 방식
          <Button size="sm" variant={addressType === "basic" ? "default" : "outline"} onClick={() => setAddressType("basic")}>A · 주소 + 상세</Button>
          <Button size="sm" variant={addressType === "postcode" ? "default" : "outline"} onClick={() => setAddressType("postcode")}>B · 우편번호 + 주소 + 상세</Button>
        </div>
      )}
      <Preview code={`<SignupForm\n  onSubmit={(input) => signup.mutate(input)}\n  pending={signup.isPending}\n  passwordConfirm={${confirm}}\n  optionalFields={${JSON.stringify(fields)}}\n  addressType="${addressType}"\n  terms={${withTerms ? "terms" : "[]"}}${withEmail ? "\n  emailVerification={{ sendCode, verifyCode }}" : ""}\n/>`}>
        <SignupForm
          onSubmit={noop}
          passwordConfirm={confirm}
          optionalFields={fields}
          addressType={addressType}
          terms={withTerms ? signupTerms : []}
          checkUserId={demoCheckUserId}
          emailVerification={withEmail ? demoEmailHandlers : undefined}
          addressSearch="dialog"
          addressSearchProvider={demoAddressProvider}
          nickname={{ generator: true }}
        />
      </Preview>

      <H2>Required fields</H2>
      <P>가입에 꼭 필요한 기본 항목입니다. 설정으로 끌 수 없습니다.</P>
      <DocTable
        head={["필드", "라벨", "필수 여부", "검증"]}
        rows={[
          [<Ic key="1">user_id</Ic>, "아이디", <Badge key="a" variant="brand">필수</Badge>, "공백 제거 후 전달. 중복은 서버가 확인"],
          [<Ic key="2">name</Ic>, "이름", <Badge key="b" variant="brand">필수</Badge>, "공백 제거 후 전달"],
          [<Ic key="3">email</Ic>, "이메일", <Badge key="c" variant="brand">필수</Badge>, "이메일 형식이 아니면 오류 표시"],
          [<Ic key="4">password</Ic>, "비밀번호", <Badge key="d" variant="brand">필수</Badge>, "8자 미만이면 오류 표시"],
        ]}
      />
      <Callout>역할 필드는 없습니다. 가입한 사용자의 기본 역할은 서버가 부여합니다.</Callout>

      <H2>Optional fields</H2>
      <P>
        필요한 서비스만 골라 쓰는 선택 항목입니다. 켜면 라벨 옆에 <Ic>(선택)</Ic>이 붙고, 값을 비워 두면 서버로 보내지 않습니다.
        아래는 샘플이며, 직접 만든 항목도 같은 방식으로 추가할 수 있습니다.
      </P>
      <DocTable
        head={["필드", "라벨", "필수 여부", "입력 타입", "DB 컬럼 예시"]}
        rows={[
          [<Ic key="0">nickname</Ic>, "닉네임", <Badge key="n" variant="secondary">선택</Badge>, <Ic key="tn">text</Ic>, <Ic key="dn">VARCHAR(30)</Ic>],
          [<Ic key="1">phone</Ic>, "전화번호", <Badge key="a" variant="secondary">선택</Badge>, <Ic key="ta">tel</Ic>, <Ic key="da">VARCHAR(20)</Ic>],
          [<Ic key="2">address</Ic>, "주소 (검색 버튼 + 상세 주소)", <Badge key="b" variant="secondary">선택</Badge>, <Ic key="tb">address</Ic>, <Ic key="db">address, address_detail (+ postcode)</Ic>],
          [<Ic key="3">birth_date</Ic>, "생년월일", <Badge key="c" variant="secondary">선택</Badge>, <Ic key="tc">date</Ic>, <Ic key="dc">DATE</Ic>],
          [<Ic key="4">gender</Ic>, "성별", <Badge key="d" variant="secondary">선택</Badge>, <Ic key="td">radio</Ic>, <Ic key="dd">VARCHAR(10)</Ic>],
        ]}
      />
      <Callout tone="warn">
        선택 항목을 켜려면 백엔드의 <Ic>users</Ic> 테이블과 가입 스키마에도 같은 컬럼이 있어야 합니다. 프론트만 켜면 서버가 알 수 없는 필드로 거절할 수 있습니다.
      </Callout>

      <H2>Enable with config</H2>
      <P>폼을 직접 고치지 않고 <Ic>meerkit.config.ts</Ic>에서 켭니다. <Ic>AuthDialog</Ic>가 이 값을 그대로 폼에 넘깁니다.</P>
      <CodeBlock title="meerkit.config.ts" code={`export default defineMeerkitConfig({\n  signup: {\n    passwordConfirm: true,\n    optionalFields: ["nickname", "phone", "address", "birth_date", "gender"],\n    addressType: "postcode",   // "basic" | "postcode"  (Address Field 참고)\n    emailVerification: true,   // 이메일 인증 (Email Verification 참고)\n    // 약관 동의는 Terms Agreement 페이지를 보세요\n  },\n});`} />

      <H2>Terms agreement</H2>
      <P>
        약관 동의 영역이 폼 아래에 붙습니다. 약관 목록은 <Ic>signup.terms</Ic>로 정하고, <strong>필수 약관에 동의하지 않으면 가입할 수 없습니다.</strong>
        체크한 약관의 id 목록이 <Ic>agreed_terms</Ic>로 서버에 전달됩니다. 자세한 내용은 Terms Agreement 페이지를 보세요.
      </P>
      <H2>Password confirmation</H2>
      <UL>
        <li>두 입력이 다르면 &quot;비밀번호가 일치하지 않습니다.&quot;를 보여 주고 제출하지 않습니다.</li>
        <li><Ic>password_confirm</Ic>은 <strong>서버로 보내지 않습니다.</strong> 오타를 막는 클라이언트 전용 검사입니다.</li>
        <li>서버는 이 값을 몰라도 됩니다. 비밀번호 규칙은 서버가 따로 검사합니다.</li>
      </UL>

      <H2>Email verification</H2>
      <P>
        이메일 옆에 <strong>[인증번호 받기]</strong> 버튼을 붙이고 인증을 마쳐야 가입할 수 있게 합니다. 서비스마다 필요 여부가 다르므로 <Ic>signup.emailVerification</Ic>으로 켜고 끄며 기본은 꺼져 있습니다.
        위 미리보기의 <Ic>이메일 인증</Ic> 버튼을 눌러 보세요 (인증번호는 <Ic>123456</Ic>). 자세한 흐름과 API는 Email Verification 페이지를 보세요.
      </P>
      <H2>Address</H2>
      <P>
        주소는 <strong>검색 버튼으로 고르면 우편번호와 주소가 함께 채워지는</strong> 전용 입력입니다. 검색은 카카오 우편번호 팝업(기본) 또는 결과 목록이 있는 검색 창 중에서 고릅니다. <Ic>addressType</Ic>으로 두 가지 방식을 고릅니다: <strong>A(basic)</strong> 주소 + 상세 주소, <strong>B(postcode)</strong> 우편번호 + 주소 + 상세 주소.
        자세한 내용은 Address Field 페이지를 보세요.
      </P>
      <H2>Nickname</H2>
      <P>
        <Ic>optionalFields</Ic>에 <Ic>&quot;nickname&quot;</Ic>을 켜면 가입 때 닉네임(2~12자)을 받습니다. 입력칸 옆의 <strong>[자동 생성]</strong> 버튼으로 &quot;용감한미어캣482&quot; 같은 이름을 받아 쓸 수 있고,
        <Ic>nickname.autoFill</Ic>을 켜면 폼을 열 때 미리 채워 둡니다. 닉네임이 있는 사용자는 메뉴와 아바타에 이름 대신 닉네임이 보이며, 마이페이지에서 바꿀 수 있습니다.
        닉네임 <strong>중복 검사는 서버</strong>가 합니다. 자세한 내용은 Nickname 페이지를 보세요.
      </P>
      <H2>Add your own field</H2>
      <P>샘플에 없는 항목은 폼 상태, 입력, 타입, 백엔드 스키마를 함께 바꿉니다.</P>
      <CodeBlock title="types.ts" code={`export interface SignupInput extends LoginInput {\n  email: string;\n  name: string;\n  phone?: string;\n  address?: string;\n  birth_date?: string;\n  company?: string; // 추가한 필드\n}`} />

      <H2>Validation</H2>
      <UL>
        <li>클라이언트 검사는 사용자 편의용입니다. 같은 규칙을 서버가 반드시 다시 검사합니다.</li>
        <li>아이디·이메일 중복은 서버만 알 수 있으므로, 서버 오류의 <Ic>detail</Ic>을 <Ic>error</Ic>로 전달해 표시합니다.</li>
        <li>비밀번호 최소 길이는 <Ic>SignupForm.tsx</Ic>의 한 줄(<Ic>password.length &lt; 8</Ic>)에서 바꿉니다.</li>
      </UL>
      <Preview>
        <SignupForm onSubmit={noop} error="이미 사용 중인 아이디입니다." />
      </Preview>

      <H2>Accessibility</H2>
      <UL>
        <li>라벨과 입력이 연결되어 있고, <Ic>autoComplete</Ic>로 <Ic>username</Ic>, <Ic>name</Ic>, <Ic>email</Ic>, <Ic>new-password</Ic>, <Ic>tel</Ic>, <Ic>bday</Ic> 등을 지정했습니다.</li>
        <li>검증 오류는 <Ic>role=&quot;alert&quot;</Ic>로 안내합니다.</li>
      </UL>

      <H2>Props</H2>
      <PropsTable
        rows={[
          ["onSubmit", "(input: SignupInput) => void", "검증을 통과하면 입력값을 전달합니다. 켠 선택 항목 중 값이 있는 것만 포함됩니다.", true],
          ["pending", "boolean", "요청 중 여부."],
          ["error", "string | null", "서버 오류 메시지. 클라이언트 검증 오류가 있으면 그것이 우선 표시됩니다."],
          ["passwordConfirm", "boolean", "비밀번호 확인 입력을 추가합니다. 서버로는 보내지 않습니다."],
          ["optionalFields", '("nickname" | "phone" | "address" | "birth_date" | "gender")[]', "추가로 받을 선택 항목. address는 검색 버튼 입력, gender는 라디오 버튼으로 나옵니다."],
          ["addressType", '"basic" | "postcode"', "주소 입력 방식. basic은 주소 + 상세, postcode는 우편번호 + 주소 + 상세."],
          ["emailVerification", "{ sendCode, verifyCode }", "주면 이메일 옆에 인증번호 받기·확인 버튼이 생기고 인증해야 가입할 수 있습니다."],
          ["checkUserId", "(userId: string) => Promise<boolean>", "주면 아이디 옆에 [중복 확인] 버튼이 생기고, 사용 가능 확인을 받아야 가입할 수 있습니다 (GET /auth/check-user-id). 아이디를 고치면 다시 확인합니다."],
          ["onSearchAddress", "() => Promise<{ postcode, address } | null>", "주소 검색 방법을 바꿉니다. 기본은 카카오 우편번호 팝업."],
          ["terms", "TermsItem[]", "동의받을 약관. 비어 있으면 약관 영역이 없습니다."],
        ]}
      />
    </>
  );
}

function DialogDemo() {
  const openDialog = useAuthDialog((s) => s.openDialog);
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button variant="outline" onClick={() => openDialog("login")}>로그인 모달 열기</Button>
      <Button variant="outline" onClick={() => openDialog("signup")}>가입 모달 열기</Button>
      <Button variant="outline" onClick={() => openDialog("forgot")}>비밀번호 찾기 열기</Button>
    </div>
  );
}

export function AuthDialogDoc() {
  return (
    <>
      <DocLinks items={[links.component("dialog", "Dialog")]} />
      <P>로그인과 가입 폼을 하나의 모달로 묶은 컴포넌트입니다. 모달 안에서 두 모드를 오갈 수 있고, 성공하면 자동으로 닫힙니다.</P>
      <Callout><Ic>AuthDialog</Ic>는 <Ic>MeerkitProvider</Ic>가 이미 한 번 렌더링합니다. 직접 또 렌더링하지 마세요.</Callout>
      <H2>When to use</H2>
      <UL>
        <li>사용자를 현재 페이지에서 벗어나게 하지 않고 로그인·가입을 받고 싶을 때</li>
        <li>보호된 화면의 &quot;로그인이 필요합니다&quot; 안내에서 바로 로그인시키고 싶을 때 (<Ic>RequireAuth</Ic>가 이 모달을 엽니다)</li>
        <li>헤더, 웰컴 페이지, 버튼 어디서든 <Ic>openDialog</Ic> 한 줄로 열고 싶을 때</li>
      </UL>
      <H2>Preview</H2>
      <Preview code={`const openDialog = useAuthDialog((s) => s.openDialog);\n\n<Button onClick={() => openDialog("login")}>로그인</Button>\n<Button onClick={() => openDialog("signup")}>회원가입</Button>`}>
        <DialogDemo />
      </Preview>
      <H2>Store</H2>
      <PropsTable
        rows={[
          ["open", "boolean", "모달이 열려 있는지."],
          ["mode", '"login" | "signup" | "forgot"', "현재 보여 주는 폼. forgot은 비밀번호 찾기."],
          ["openDialog", "(mode) => void", "모드를 지정해 모달을 엽니다."],
          ["closeDialog", "() => void", "모달을 닫습니다."],
          ["setMode", "(mode) => void", "열린 상태에서 모드만 바꿉니다."],
        ]}
      />
      <H2>Behavior</H2>
      <UL>
        <li>로그인에 성공하면 액세스 토큰을 저장하고 모달을 닫습니다.</li>
        <li>가입에 성공하면 같은 아이디와 비밀번호로 이어서 로그인합니다.</li>
        <li>로그인에서 <Ic>비밀번호를 잊으셨나요?</Ic>를 누르면 같은 모달 안에서 비밀번호 찾기 폼으로 바뀌고, 메일 발송 후 안내 화면이 나옵니다.</li>
        <li>로그인 연속 실패 잠금 상태를 폼에 전달합니다 (Login Lockout 참고).</li>
        <li>가입 폼에는 <Ic>meerkit.config.ts</Ic>의 비밀번호 확인, 선택 항목, 약관 설정이 그대로 적용됩니다.</li>
        <li>서버가 돌려준 <Ic>detail</Ic> 메시지를 폼 아래에 표시합니다.</li>
      </UL>
      <AuthDialog />
      <H2>Usage</H2>
      <P>어디서든 스토어의 <Ic>openDialog</Ic>만 호출하면 됩니다. 웰컴 페이지의 버튼도 같은 방식입니다.</P>
      <CodeBlock title="tsx" code={`"use client";

import { useAuthDialog } from "@/meerkit/auth/dialog-store";

export function LoginButton() {
  const openDialog = useAuthDialog((s) => s.openDialog);
  return <button onClick={() => openDialog("login")}>로그인</button>;
}`} />
      <H2>Accessibility</H2>
      <UL>
        <li>Radix Dialog 기반이라 열리면 포커스가 모달 안에 갇히고, <Ic>Esc</Ic>로 닫을 수 있습니다.</li>
        <li>제목과 설명이 <Ic>aria-labelledby</Ic>, <Ic>aria-describedby</Ic>로 연결됩니다.</li>
        <li>닫으면 포커스가 모달을 연 버튼으로 돌아갑니다.</li>
      </UL>
      <H2>Customization</H2>
      <UL>
        <li>문구(제목, 설명, 전환 링크)는 <Ic>AuthDialog.tsx</Ic>에 있습니다.</li>
        <li>폭과 모서리는 <Ic>components/ui/dialog.tsx</Ic>의 <Ic>DialogContent</Ic> 클래스를 바꿉니다.</li>
        <li>소셜 로그인 같은 버튼은 폼 아래에 추가하면 됩니다.</li>
      </UL>
    </>
  );
}

const sampleAvatar =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#2c63fb"/><stop offset="1" stop-color="#c4b5fd"/></linearGradient></defs><rect width="80" height="80" fill="url(#g)"/></svg>',
  );

export function UserAvatarDoc() {
  const [withImage, plain, english] = [
    { ...mockUsers[0], avatar_url: sampleAvatar },
    mockUsers[1],
    { ...mockUsers[2], name: "Jane Doe" },
  ];
  return (
    <>
      <DocLinks items={[links.component("avatar", "Avatar")]} />
      <P>
        사용자를 <strong>작은 동그라미 하나</strong>로 나타내는 컴포넌트입니다. 프로필 이미지가 있으면 이미지를, 없으면 이름의 첫 글자(이니셜)를 보여 줍니다.
        shadcn/ui의 <Ic>Avatar</Ic>를 그대로 감싼 것이라 기본 동작과 스타일은 shadcn을 따릅니다.
      </P>

      <H2>Where it is used</H2>
      <UL>
        <li><Ic>UserMenu</Ic>: 로그인 후 오른쪽 위 계정 버튼과 메뉴 머리말</li>
        <li><Ic>/me</Ic> 내 정보 화면의 큰 프로필</li>
        <li>내 서비스의 댓글, 작성자 표시, 멤버 목록 등 어디든 사용자를 표시할 곳</li>
      </UL>

      <H2>Preview</H2>
      <Preview code={`<UserAvatar user={user} />\n<UserAvatar user={user} size="lg" />`}>
        <div className="flex items-center justify-center gap-4">
          <UserAvatar user={withImage} />
          <UserAvatar user={plain} />
          <UserAvatar user={english} />
        </div>
      </Preview>

      <H2>Sizes</H2>
      <Preview code={`<UserAvatar user={user} size="sm" />  // 28px\n<UserAvatar user={user} size="md" />  // 36px (기본)\n<UserAvatar user={user} size="lg" />  // 48px\n<UserAvatar user={user} size="xl" />  // 80px`}>
        <div className="flex items-end justify-center gap-4">
          {(["sm", "md", "lg", "xl"] as const).map((size) => (
            <UserAvatar key={size} user={withImage} size={size} />
          ))}
        </div>
      </Preview>

      <H2>Image and fallback</H2>
      <DocTable
        head={["상황", "보이는 것"]}
        rows={[
          [<Ic key="1">avatar_url</Ic>, "있으면 그 이미지를 보여 줍니다."],
          ["이미지 주소가 없거나 불러오지 못함", "이니셜로 자동 대체됩니다."],
          ["한글 이름 (예: 김관리)", "첫 글자 → 김"],
          ["영문 이름 두 단어 이상 (Jane Doe)", "단어 앞글자 두 개 → JD"],
          ["영문 이름 한 단어 (Jane)", "첫 글자 → J"],
          ["이름이 비어 있음", "?"],
        ]}
      />
      <Callout>
        킷에는 <strong>이미지 업로드 기능이 없습니다.</strong> 서버가 <Ic>User.avatar_url</Ic>에 이미지 주소를 담아 주면 표시만 합니다. 업로드가 필요하면 파일 저장소와 업로드 API를 서비스에서 추가하세요.
      </Callout>

      <H2>Props</H2>
      <PropsTable
        rows={[
          ["user", "Pick<User, 'name' | 'avatar_url'>", "표시할 사용자. name과 avatar_url만 읽습니다.", true],
          ["size", '"sm" | "md" | "lg" | "xl"', "크기. 기본은 md."],
          ["className", "string", "추가 클래스. 테두리나 그림자를 더할 때 씁니다."],
        ]}
      />

      <H2>Customization</H2>
      <UL>
        <li><strong>크기 추가:</strong> <Ic>UserAvatar.tsx</Ic>의 <Ic>sizes</Ic> 객체에 항목을 더합니다.</li>
        <li><strong>이니셜 규칙:</strong> 같은 파일의 <Ic>initialsOf</Ic> 함수를 고치면 됩니다.</li>
        <li><strong>배경색:</strong> 이니셜 배경은 <Ic>bg-muted</Ic> 토큰이라 Theming에서 바꾼 색을 따릅니다.</li>
        <li><strong>저수준 컴포넌트:</strong> 더 많은 제어가 필요하면 <Ic>components/ui/avatar.tsx</Ic>의 shadcn <Ic>Avatar</Ic>를 직접 쓰세요.</li>
      </UL>
      <CodeBlock title="tsx" code={`// 테두리를 더한 아바타\n<UserAvatar user={user} className="ring-2 ring-brand/30" />`} />

      <H2>Accessibility</H2>
      <UL>
        <li>이미지에는 <Ic>alt=&quot;이름 프로필&quot;</Ic>이 자동으로 들어갑니다.</li>
        <li>이니셜은 텍스트라 스크린리더가 읽을 수 있습니다. 이름을 함께 보여 주는 곳(메뉴 등)에서는 중복 낭독이 없도록 주변 텍스트를 확인하세요.</li>
      </UL>
    </>
  );
}

export function UserMenuDoc() {
  const [admin, member] = [mockUsers[0], mockUsers[1]];
  return (
    <>
      <DocLinks items={[links.component("dropdown-menu", "Dropdown Menu"), links.component("avatar", "Avatar")]} />
      <P>
        <strong>로그인한 사용자가 자기 계정을 다루는 메뉴</strong>입니다. 헤더 오른쪽 위에 아바타 버튼으로 놓고, 누르면 내 정보 확인, 페이지 이동, 로그아웃을 할 수 있는 드롭다운이 열립니다.
        로그인 전에는 보이지 않고, 대신 로그인·회원가입 버튼을 보여 주는 것이 일반적입니다.
      </P>

      <H2>Preview</H2>
      <P>아래 버튼을 눌러 보세요. 관리자(MASTER)와 일반 사용자는 메뉴 항목이 다릅니다.</P>
      <Preview code={`<UserMenu user={user} onLogout={() => logout.mutate()} />`}>
        <div className="grid justify-items-center gap-6">
          <div className="grid justify-items-center gap-2">
            <span className="text-xs text-muted-foreground">관리자 (MASTER)</span>
            <UserMenu user={admin} onLogout={noop} align="center" />
          </div>
          <div className="grid justify-items-center gap-2">
            <span className="text-xs text-muted-foreground">일반 사용자 (WRITER)</span>
            <UserMenu user={member} onLogout={noop} align="center" />
          </div>
        </div>
      </Preview>

      <H2>What users can do</H2>
      <DocTable
        head={["메뉴 영역", "누가 보나", "할 수 있는 것"]}
        rows={[
          ["아바타 버튼", "로그인한 모든 사용자", "누르면 메뉴가 열리고, 한 번 더 누르거나 바깥을 누르면 닫힙니다."],
          ["프로필 머리말", "로그인한 모든 사용자", "내 이름, 이메일, 역할 배지를 한눈에 확인합니다."],
          ["내 정보", "로그인한 모든 사용자", "/me 화면으로 이동해 내 계정 정보를 봅니다."],
          ["멤버 관리", "MASTER만", "/admin/members로 이동해 유저 목록, 역할 변경, 탈퇴 처리를 합니다."],
          ["바로가기", "내가 추가한 항목", "내 서비스의 화면으로 이동합니다. (items로 추가)"],
          ["로그아웃", "로그인한 모든 사용자", "세션을 끝내고 로그인 전 상태로 돌아갑니다."],
        ]}
      />
      <Callout>
        &quot;멤버 관리&quot; 항목은 편의를 위해 숨기는 것입니다. 실제 접근 제어는 <Ic>RequireRole</Ic>과 서버가 합니다.
      </Callout>

      <H2>When it appears</H2>
      <P>로그인 여부에 따라 헤더의 오른쪽을 바꿔 줍니다. 로그인 전에는 모달을 여는 버튼, 후에는 이 메뉴입니다.</P>
      <CodeBlock title="tsx" code={`const { user, isAuthenticated } = useAuth();\nconst logout = useLogout();\nconst openDialog = useAuthDialog((s) => s.openDialog);\n\n{isAuthenticated && user ? (\n  <UserMenu user={user} onLogout={() => logout.mutate()} />\n) : (\n  <>\n    <Button variant="ghost" onClick={() => openDialog("login")}>로그인</Button>\n    <Button onClick={() => openDialog("signup")}>회원가입</Button>\n  </>\n)}`} />

      <H2>Customization</H2>
      <H3>메뉴에 바로가기 추가</H3>
      <P><Ic>items</Ic>에 링크를 넘기면 &quot;바로가기&quot; 영역에 나타납니다.</P>
      <Preview code={`<UserMenu\n  user={user}\n  onLogout={logout}\n  items={[\n    { label: "내 리포트", href: "/reports" },\n    { label: "설정", href: "/settings" },\n  ]}\n/>`}>
        <div className="flex justify-center">
          <UserMenu
            user={admin}
            onLogout={noop}
            align="center"
            items={[
              { label: "내 리포트", href: "/reports" },
              { label: "설정", href: "/settings" },
            ]}
          />
        </div>
      </Preview>
      <H3>아바타만 보여 주기</H3>
      <P>좁은 헤더에서는 이름을 숨길 수 있습니다.</P>
      <Preview code={`<UserMenu user={user} onLogout={logout} showName={false} />`}>
        <div className="flex justify-center">
          <UserMenu user={admin} onLogout={noop} showName={false} align="center" />
        </div>
      </Preview>
      <H3>기본 항목 바꾸기</H3>
      <UL>
        <li>&quot;내 정보&quot;, &quot;멤버 관리&quot;, &quot;로그아웃&quot; 같은 기본 항목은 <Ic>UserMenu.tsx</Ic>에서 직접 고칩니다.</li>
        <li>이동 경로는 <Ic>meerkitConfig.routes</Ic>에 모여 있어 한 곳에서 바꿀 수 있습니다.</li>
        <li>프로필 이미지는 <Ic>User.avatar_url</Ic>을 채우면 아바타에 나타납니다 (User Avatar 참고).</li>
        <li>색과 모서리는 Theming의 토큰을 따릅니다.</li>
      </UL>

      <H2>Accessibility</H2>
      <UL>
        <li>아바타 버튼에 <Ic>aria-label=&quot;계정 메뉴&quot;</Ic>가 있습니다.</li>
        <li>키보드: <Ic>Enter</Ic>/<Ic>Space</Ic>로 열고, 방향키로 이동하고, <Ic>Esc</Ic>로 닫습니다. (Radix Dropdown Menu 기본 동작)</li>
        <li>닫으면 포커스가 아바타 버튼으로 돌아옵니다.</li>
      </UL>

      <H2>Props</H2>
      <PropsTable
        rows={[
          ["user", "User", "표시할 로그인 사용자. role.name으로 관리자 여부를 판단합니다.", true],
          ["onLogout", "() => void", "로그아웃을 눌렀을 때 호출합니다. 보통 useLogout().mutate", true],
          ["items", "{ label, href, icon? }[]", "기본 메뉴 아래에 추가할 바로가기."],
          ["showName", "boolean", "false면 아바타만 보여 줍니다. 기본 true."],
          ["align", '"start" | "center" | "end"', "메뉴가 열리는 정렬. 기본 end(오른쪽 맞춤)."],
        ]}
      />

      <H2>Related</H2>
      <UL>
        <li><Ic>UserAvatar</Ic>: 메뉴 안팎에서 쓰는 아바타</li>
        <li><Ic>useLogout</Ic>: 로그아웃 처리 (Hooks &amp; State)</li>
        <li><Ic>RequireRole</Ic>: 관리자 화면 접근 제어 (Route Guards)</li>
      </UL>
    </>
  );
}

export function MemberTableDoc() {
  return (
    <>
      <DocLinks items={[links.component("table", "Table"), links.component("badge", "Badge")]} />
      <P>관리자 화면에서 쓰는 유저 목록 테이블입니다. 역할 변경과 탈퇴 처리를 한 줄에서 할 수 있습니다.</P>
      <H2>When to use</H2>
      <UL>
        <li>관리자가 가입한 사용자 목록을 보고 역할을 바꾸거나 탈퇴 처리를 해야 할 때</li>
        <li>같은 모양의 목록을 내 서비스(예: 팀원 목록)에서 재사용하고 싶을 때. 데이터와 동작은 props로 주입합니다.</li>
      </UL>
      <H2>Preview</H2>
      <PreviewWide code={`<MemberTable\n  members={data}\n  onRoleChange={(id, roles) => updateRoles.mutate({ id, roles })}\n  onRemove={(id) => removeMember.mutate(id)}\n/>`}>
        <MemberTable members={mockUsers} onRoleChange={noop} onRemove={noop} />
      </PreviewWide>
      <Callout>
        역할 옆의 <Ic>변경</Ic> 버튼은 <strong>Role Manager</strong> 확인 창을 엽니다 (<Ic>roleEditor=&quot;inline&quot;</Ic>이면 표 안의 선택 상자). 자세한 내용은 Role Manager 페이지를 보세요.
      </Callout>
      <Callout>
        멤버가 많아 <strong>검색·필터·페이지 나누기</strong>가 필요하다면 이 표를 감싼 Member Directory를 쓰세요. <Ic>/admin/members</Ic>가 그것을 사용합니다.
      </Callout>
      <H2>Columns</H2>
      <DocTable
        head={["컬럼", "내용"]}
        rows={[
          ["ID", "users.id"],
          ["아이디", "user_id"],
          ["이름 · 이메일", "name, email"],
          ["역할", "RoleSelect로 변경 (삭제된 유저는 잠김)"],
          ["상태", "활성 · 비활성 · 삭제됨 배지"],
          ["가입일", "created_at의 날짜 부분"],
          ["", "탈퇴 처리 버튼"],
        ]}
      />
      <H2>Empty state</H2>
      <PreviewWide>
        <MemberTable members={[]} onRoleChange={noop} onRemove={noop} />
      </PreviewWide>
      <H2>Props</H2>
      <PropsTable
        rows={[
          ["members", "User[]", "표시할 사용자 목록. 비어 있으면 안내 문구를 보여 줍니다.", true],
          ["onRoleChange", "(id: number, roleId: number) => void", "역할 선택이 바뀌면 호출합니다.", true],
          ["onRemove", "(id: number) => void", "탈퇴 처리 버튼을 누르면 호출합니다.", true],
          ["onActiveChange", "(id: number, isActive: boolean) => void", "주면 상태에 맞는 버튼 하나가 생깁니다: 활성 → 비활성화, 비활성 → 활성화, 잠김 → 잠금 해제, 탈퇴 → 복구 (PATCH /users/{id}/active)."],
          ["roleEditor", '"dialog" | "inline"', "역할 변경 방식. 기본 dialog(확인 창), inline은 표 안의 선택 상자."],
          ["currentUserId", "number", "로그인한 관리자의 id. 본인 행은 역할 변경·탈퇴 처리를 잠급니다 (서버도 막음)."],
        ]}
      />
      <H2>Usage</H2>
      <P>데이터 조회와 변경은 훅이 맡고, 테이블은 표시만 합니다. 실제 관리자 페이지는 아래처럼 구성되어 있습니다.</P>
      <CodeBlock title="AdminMembersPage.tsx" code={`function Members() {
  const { data, isLoading, isError } = useMembers(query); // query: 검색·필터·페이지 조건
  const updateRoles = useUpdateRoles();
  const removeMember = useRemoveMember();

  if (isLoading) return <p>불러오는 중…</p>;
  if (isError) return <p>목록을 불러오지 못했습니다.</p>;
  return (
    <MemberTable
      members={data.items}
      currentUserId={me.id}
      onRoleChange={(id, roles) => updateRoles.mutate({ id, roles })}
      onRemove={(id) => removeMember.mutate(id)}
    />
  );
}

<RequireRole role={ADMIN_ROLE}><Members /></RequireRole>`} />
      <H2>Status badge</H2>
      <DocTable
        head={["조건", "배지"]}
        rows={[
          [<Ic key="1">deactivated_at</Ic>, "삭제됨 (빨강). 탈퇴한 계정이라 역할 변경과 탈퇴 처리가 잠깁니다"],
          [<Ic key="2">is_active = true</Ic>, "활성 (파랑)"],
          [<Ic key="3">is_active = false</Ic>, "비활성 (회색)"],
        ]}
      />
      <H2>Customization</H2>
      <UL>
        <li>컬럼을 추가하려면 <Ic>TableHead</Ic>와 <Ic>TableCell</Ic>을 한 쌍으로 추가합니다.</li>
        <li>페이지네이션이나 검색이 필요하면 shadcn <Ic>Data Table</Ic> 패턴으로 바꿀 수 있습니다.</li>
        <li>폭이 좁으면 가로 스크롤이 생기며, 셀은 줄바꿈하지 않습니다.</li>
      </UL>
      <Callout tone="warn">역할 변경과 탈퇴 처리는 서버가 관리자 권한을 다시 확인해야 합니다. 이 테이블은 요청을 보낼 뿐 권한을 판단하지 않습니다.</Callout>
    </>
  );
}

export function RoleSelectDoc() {
  const [roles, setRoles] = useState<RoleName[]>(["VIEWER", "WRITER"]);
  return (
    <>
      <DocLinks items={[links.component("checkbox", "Checkbox")]} />
      <Callout>역할의 의미와 위험한 변경을 확인시켜 주는 창이 필요하다면 <Ic>RoleAssignDialog</Ic>를 쓰세요 (Role Manager 페이지).</Callout>
      <P>역할 4종을 켜고 끄는 체크박스 묶음입니다. 한 사람이 여러 역할을 가질 수 있고, 값은 역할 이름 목록(<Ic>RoleName[]</Ic>)입니다. 마지막 하나는 끌 수 없습니다.</P>
      <H2>When to use</H2>
      <UL>
        <li>관리자 화면에서 한 사용자의 역할을 바꿀 때 (<Ic>MemberTable</Ic> 안에서 쓰입니다)</li>
        <li>초대, 사용자 생성 화면에서 역할을 고르게 할 때</li>
      </UL>
      <H2>Preview</H2>
      <Preview code={`<RoleSelect value={["VIEWER", "WRITER"]} onChange={(roles) => update(roles)} />`}>
        <div className="flex flex-wrap items-center gap-3">
          <RoleSelect idPrefix="doc-role" value={roles} onChange={setRoles} />
          <span className="text-sm text-muted-foreground">선택: {roles.join(", ")}</span>
        </div>
      </Preview>
      <H2>Disabled</H2>
      <Preview>
        <RoleSelect idPrefix="doc-role-off" value={["MASTER"]} onChange={noop} disabled />
      </Preview>
      <H2>Props</H2>
      <PropsTable
        rows={[
          ["value", "RoleName[]", "현재 가진 역할 이름 목록.", true],
          ["onChange", "(roles: RoleName[]) => void", "체크가 바뀌면 새 역할 목록을 전달합니다.", true],
          ["disabled", "boolean", "잠금 여부."],
          ["idPrefix", "string", "체크박스 id 앞부분. 한 화면에 여러 개를 둘 때 겹치지 않게 합니다."],
        ]}
      />
      <P>선택지는 <Ic>src/meerkit/roles.ts</Ic>의 <Ic>ROLES</Ic>에서 만들어지므로, 역할이 바뀌면 그 파일만 고치면 됩니다.</P>
      <H2>Usage</H2>
      <CodeBlock title="tsx" code={`<RoleSelect
  value={member.roles.map((r) => r.name)}
  disabled={!!member.deactivated_at}
  onChange={(roles) => updateRoles.mutate({ id: member.id, roles })}  // PUT /users/{id}/roles
/>`} />
      <H2>Options</H2>
      <DocTable
        head={["id", "value(이름)", "설명"]}
        rows={[
          ["1", "MASTER", "시스템 전체 관리자"],
          ["2", "OWNER", "자신이 소유한 데이터 관리"],
          ["3", "VIEWER", "조회 전용 사용자"],
          ["4", "WRITER", "데이터 작성 및 수정 사용자"],
        ]}
      />
      <H2>Customization</H2>
      <P>shadcn <Ic>Checkbox</Ic>로 만들었습니다. 역할 설명과 C·R·U·D를 함께 보여 주는 확인 창이 필요하면 <Ic>RoleAssignDialog</Ic>를 쓰세요.</P>
      <Callout>자기 자신의 역할을 낮추거나 마지막 관리자를 바꾸는 경우의 제한은 서버 정책으로 막는 것을 권장합니다.</Callout>
    </>
  );
}

export function RouteGuardsDoc() {
  return (
    <>
      <P>로그인 여부와 역할에 따라 화면을 보호하는 두 개의 래퍼입니다.</P>
      <H2>RequireAuth</H2>
      <P>로그인하지 않았다면 안내 문구와 로그인 버튼을 보여 줍니다. 세션을 복원하는 동안에는 &quot;불러오는 중…&quot;을 보여 줍니다.</P>
      <CodeBlock title="tsx" code={`import { RequireAuth } from "@/meerkit";\n\nexport default function Page() {\n  return (\n    <RequireAuth>\n      <MyPage />\n    </RequireAuth>\n  );\n}`} />
      <H2>RequireRole</H2>
      <P>로그인 확인 후 역할까지 검사합니다. 다른 역할이면 &quot;접근 권한이 없습니다.&quot;를 보여 줍니다.</P>
      <CodeBlock title="tsx" code={`import { RequireRole, ADMIN_ROLE } from "@/meerkit";\n\n<RequireRole role={ADMIN_ROLE}>\n  <AdminMembersPage />\n</RequireRole>`} />
      <H2>Props</H2>
      <PropsTable
        rows={[
          ["children", "ReactNode", "조건을 통과했을 때 보여 줄 내용.", true],
          ["role", "RoleName", "RequireRole 전용. 필요한 역할 이름.", true],
        ]}
      />
      <Callout tone="warn">가드는 화면 보호용입니다. 데이터 보호는 백엔드가 같은 규칙으로 다시 검증해야 합니다.</Callout>
      <H2>States</H2>
      <DocTable
        head={["상황", "RequireAuth", "RequireRole"]}
        rows={[
          ["세션 복원 중", "불러오는 중…", "불러오는 중…"],
          ["로그인 안 함", "안내 문구와 로그인 버튼", "RequireAuth와 동일"],
          ["로그인했지만 역할 다름", "내용 표시", "접근 권한이 없습니다."],
          ["조건 충족", "내용 표시", "내용 표시"],
        ]}
      />
      <H2>Where they are used</H2>
      <UL>
        <li><Ic>/me</Ic>: <Ic>RequireAuth</Ic></li>
        <li><Ic>/admin/members</Ic>: <Ic>RequireRole role=&quot;MASTER&quot;</Ic></li>
        <li>서비스 화면(<Ic>app/(service)/</Ic>)에서도 같은 방식으로 감싸면 됩니다.</li>
      </UL>
      <H2>Customization</H2>
      <P>안내 문구와 모양은 <Ic>auth/guards/</Ic> 안의 두 파일에서 바꿉니다. 로그인하지 않은 사용자를 다른 페이지로 보내고 싶다면 <Ic>RequireAuth</Ic>에서 <Ic>router.replace</Ic>를 호출하세요.</P>
    </>
  );
}
