"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { MemberDirectory } from "../../admin/components/MemberDirectory";
import { defaultMemberQuery, filterMembers } from "../../admin/members-filter";
import { ChangePasswordForm } from "../../auth/components/ChangePasswordForm";
import { ForgotPasswordForm } from "../../auth/components/ForgotPasswordForm";
import { LoginForm } from "../../auth/components/LoginForm";
import { ProfileForm } from "../../auth/components/ProfileForm";
import { ResetPasswordForm } from "../../auth/components/ResetPasswordForm";
import { TermsAgreement } from "../../auth/components/TermsAgreement";
import type { TermsItem } from "../../define-config";
import type { MemberQuery } from "../../types";
import { Callout, CodeBlock, DocLinks, DocTable, H2, H3, Ic, links, P, Preview, PreviewWide, PropsTable, Tree, UL } from "../ui";
import { demoAddressProvider, mockMembers, mockUsers } from "./mock";

const noop = () => {};

/* ─────────────────────────── Login Lockout ─────────────────────────── */

function LockoutDemo() {
  const MAX = 3;
  const LOCK_MS = 10_000;
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  function fail() {
    const next = attempts + 1;
    if (next >= MAX) {
      setLockedUntil(Date.now() + LOCK_MS);
      setAttempts(0);
    } else {
      setAttempts(next);
    }
  }

  return (
    <div className="grid gap-4">
      <p className="text-xs text-muted-foreground">데모 설정: {MAX}회 실패 시 10초 잠금 (아무 값이나 입력하고 로그인을 눌러 보세요)</p>
      <LoginForm
        onSubmit={fail}
        error={attempts > 0 ? "아이디 또는 비밀번호가 올바르지 않습니다." : null}
        attemptsLeft={attempts > 0 ? MAX - attempts : null}
        lockedUntil={lockedUntil}
      />
    </div>
  );
}

export function LoginLockoutDoc() {
  return (
    <>
      <P>
        로그인에 <strong>n번 연속 실패</strong>하면 <strong>m분 동안 로그인을 잠그는</strong> 기능입니다. n과 m은 개발자가 <Ic>meerkit.config.ts</Ic>에서 정합니다.
        실패 횟수와 잠금 시각은 <strong>sessionStorage</strong>에 저장되어, 새로고침해도 유지됩니다.
      </P>
      <Callout tone="warn">
        이 잠금은 <strong>사용자 안내용</strong>입니다. 브라우저 저장소는 사용자가 지우거나 다른 탭·다른 기기에서 우회할 수 있습니다. 실제로 공격을 막으려면 <strong>서버가 같은 규칙으로 차단</strong>해야 합니다 (아래 Server side 참고).
      </Callout>

      <H2>Preview</H2>
      <P>3번 틀리면 10초 동안 잠기고, 시간이 지나면 자동으로 풀립니다.</P>
      <Preview>
        <LockoutDemo />
      </Preview>

      <H2>Configure</H2>
      <P>n과 m을 코드 수정 없이 설정 파일에서 바꿉니다.</P>
      <CodeBlock title="meerkit.config.ts" code={`export default defineMeerkitConfig({\n  login: {\n    maxAttempts: 5, // 연속 5회 실패하면 잠근다 (0이면 잠금 기능 끄기)\n    lockMinutes: 5, // 5분 동안 잠근다\n  },\n});`} />
      <DocTable
        head={["키", "기본값", "설명"]}
        rows={[
          [<Ic key="1">login.maxAttempts</Ic>, "5", "연속 실패 허용 횟수. 이 횟수에 도달하면 잠깁니다. 0이면 기능을 끕니다."],
          [<Ic key="2">login.lockMinutes</Ic>, "5", "잠금 시간(분)."],
        ]}
      />

      <H2>How it works</H2>
      <Tree>{`
로그인 시도
   │
   ├─ 성공 ───────────────► 실패 횟수 0으로 초기화, 모달 닫힘
   │
   ├─ 400 / 401 (틀림) ───► 실패 횟수 +1
   │                          ├─ 한도 미만 ► "남은 시도 N회" 안내
   │                          └─ 한도 도달 ► 잠금 시각 저장, 폼 잠김 + 카운트다운
   │
   ├─ 429 / 423 (서버 잠금) ► 서버가 준 Retry-After(초)만큼 잠금
   │
   └─ 네트워크 오류, 5xx ─► 실패로 세지 않음 (사용자 잘못이 아니므로)
`}</Tree>
      <DocTable
        head={["상황", "화면 동작"]}
        rows={[
          ["아이디·비밀번호 틀림", "오류 메시지와 함께 (남은 시도 N회)를 보여 줍니다."],
          ["한도 도달", "입력창과 버튼이 잠기고 \"로그인이 잠겼습니다 mm:ss\"가 줄어듭니다."],
          ["시간 경과", "자동으로 풀리고 실패 횟수가 0으로 돌아갑니다."],
          ["새로고침", "남은 시간이 이어서 줄어듭니다."],
          ["탭을 닫음", "sessionStorage가 지워지므로 잠금도 사라집니다."],
        ]}
      />

      <H2>Where it is stored</H2>
      <P>상태는 <Ic>sessionStorage</Ic>의 <Ic>meerkit-login-lockout</Ic> 키에 저장됩니다.</P>
      <CodeBlock title="sessionStorage" code={`{\n  "state": { "attempts": 5, "lockedUntil": 1792558347706 },\n  "version": 0\n}`} />
      <UL>
        <li><Ic>attempts</Ic>: 연속 실패 횟수, <Ic>lockedUntil</Ic>: 잠금이 풀리는 시각(밀리초 타임스탬프)</li>
        <li>같은 탭에서는 새로고침해도 유지되고, <strong>탭을 닫거나 다른 탭을 열면 따로 계산</strong>됩니다.</li>
        <li>브라우저 개발자 도구의 Application → Session Storage에서 직접 확인할 수 있습니다.</li>
      </UL>
      <Callout>
        탭을 닫아도 유지하고 싶다면 <Ic>auth/lockout.ts</Ic>의 <Ic>sessionStorage</Ic>를 <Ic>localStorage</Ic>로 바꾸면 됩니다. 다만 같은 브라우저의 모든 탭에 영향이 가는 점을 고려하세요.
      </Callout>

      <H2>Server side</H2>
      <P>안전한 잠금은 서버의 몫입니다. 브라우저 화면은 서버가 알려 준 결과를 사용자에게 보여 줄 뿐입니다.</P>
      <UL>
        <li>서버는 <strong>아이디(와 IP) 기준</strong>으로 실패 횟수를 세고, 한도에 닿으면 <Ic>429</Ic>와 <Ic>Retry-After</Ic>(초)를 돌려줍니다.</li>
        <li>화면은 이 응답을 받으면 서버가 알려 준 시간만큼 잠급니다.</li>
        <li>잠금 중에는 <strong>비밀번호가 맞아도 거절</strong>해야 합니다. 그렇지 않으면 잠금이 의미가 없습니다.</li>
        <li>가입되지 않은 아이디도 같은 방식으로 세어, 아이디 존재 여부를 알려 주지 않습니다.</li>
      </UL>

      <H2>Use it in your own form</H2>
      <P>직접 만든 로그인 화면에서도 같은 훅을 쓸 수 있습니다.</P>
      <CodeBlock title="tsx" code={`import { useLoginLockout } from "@/meerkit/auth/lockout";\n\nconst { lockedUntil, attemptsLeft } = useLoginLockout();\n\n<LoginForm\n  onSubmit={login.mutate}\n  lockedUntil={lockedUntil}\n  attemptsLeft={attemptsLeft}\n/>`} />
      <PropsTable
        rows={[
          ["lockedUntil", "number | null", "LoginForm: 잠금이 풀리는 시각(ms). 미래 시각이면 폼이 잠깁니다."],
          ["attemptsLeft", "number | null", "LoginForm: 잠기기까지 남은 횟수. null이면 표시하지 않습니다."],
        ]}
      />
    </>
  );
}

/* ─────────────────────────── Terms Agreement ─────────────────────────── */

const demoTerms: TermsItem[] = [
  { id: "terms", label: "이용약관 동의", required: true, href: "/terms" },
  { id: "privacy", label: "개인정보 수집 및 이용 동의", required: true, href: "/privacy" },
  { id: "marketing", label: "마케팅 정보 수신 동의", required: false },
];

export function TermsAgreementDoc() {
  const [agreed, setAgreed] = useState<string[]>([]);
  const [checked, setChecked] = useState<boolean | "indeterminate">(true);
  const [gender, setGender] = useState("none");

  return (
    <>
      <DocLinks items={[links.component("checkbox", "Checkbox"), links.component("radio-group", "Radio Group")]} />
      <P>
        가입 폼에서 <strong>약관 동의</strong>를 받는 영역입니다. <Ic>전체 동의</Ic> 체크박스와 약관별 체크박스, 필수/선택 표시, 약관 전문 링크로 구성됩니다.
        이 페이지는 약관 동의에 쓰는 shadcn <strong>Checkbox</strong>와 <strong>Radio Group</strong> 컴포넌트도 함께 설명합니다.
      </P>

      <H2>Preview</H2>
      <Preview code={`<TermsAgreement\n  terms={terms}\n  value={agreed}\n  onChange={setAgreed}\n/>`}>
        <TermsAgreement terms={demoTerms} value={agreed} onChange={setAgreed} />
      </Preview>

      <H2>Behavior</H2>
      <UL>
        <li><strong>전체 동의</strong>를 누르면 모든 약관이 한 번에 켜지고, 다시 누르면 모두 꺼집니다.</li>
        <li>일부만 체크하면 전체 동의가 <strong>중간 상태(−)</strong>로 보입니다.</li>
        <li>필수 약관이 하나라도 빠지면 가입 버튼을 눌러도 <Ic>필수 약관에 모두 동의해 주세요.</Ic> 오류가 나오고 요청은 나가지 않습니다.</li>
        <li><Ic>보기</Ic> 링크는 약관 전문을 새 창으로 엽니다.</li>
      </UL>

      <H2>Configure the terms</H2>
      <P>동의받을 약관은 <Ic>meerkit.config.ts</Ic>에서 정합니다. 개발자가 약관을 추가·삭제하거나 필수 여부를 바꿀 수 있습니다.</P>
      <CodeBlock title="meerkit.config.ts" code={`export default defineMeerkitConfig({\n  signup: {\n    terms: [\n      { id: "terms", label: "이용약관 동의", required: true, href: "/terms" },\n      { id: "privacy", label: "개인정보 수집 및 이용 동의", required: true, href: "/privacy" },\n      { id: "marketing", label: "마케팅 정보 수신 동의", required: false },\n      { id: "age14", label: "만 14세 이상입니다", required: true },\n    ],\n  },\n});`} />
      <PropsTable
        rows={[
          ["id", "string", "서버로 전달되는 식별자. 동의한 약관의 id 목록이 agreed_terms로 갑니다.", true],
          ["label", "string", "화면에 보이는 문구.", true],
          ["required", "boolean", "true면 동의하지 않으면 가입할 수 없습니다.", true],
          ["href", "string", "약관 전문 주소. 있으면 \"보기\" 링크가 생깁니다."],
        ]}
      />
      <Callout>빈 배열(<Ic>terms: []</Ic>)로 두면 약관 영역이 통째로 사라집니다.</Callout>

      <H2>What the server receives</H2>
      <CodeBlock title="POST /auth/signup" code={`{\n  "user_id": "newbie",\n  "name": "신입",\n  "email": "newbie@example.com",\n  "password": "••••••••",\n  "agreed_terms": ["terms", "privacy"]\n}`} />
      <UL>
        <li>체크한 약관의 <Ic>id</Ic>만 배열로 갑니다. 체크하지 않은 선택 약관(<Ic>marketing</Ic>)은 빠집니다.</li>
        <li><strong>필수 약관 동의 여부는 서버도 다시 확인</strong>해야 합니다. 화면 검사는 우회할 수 있습니다.</li>
        <li>동의 시각을 증빙해야 한다면 서버가 <Ic>agreed_at</Ic>을 함께 저장하세요 (Data Model 참고).</li>
      </UL>

      <H2>Legal pages</H2>
      <P>
        킷에는 샘플 약관 페이지 <Ic>/terms</Ic>, <Ic>/privacy</Ic>가 들어 있어 <Ic>보기</Ic> 링크가 바로 동작합니다.
        <strong> 샘플 문구이므로 실제 서비스에서는 반드시 법무 검토를 거친 내용으로 교체</strong>하세요. 이미 약관 페이지가 있다면 <Ic>href</Ic>를 그 주소로 바꾸면 됩니다.
      </P>

      <H2>Checkbox</H2>
      <P>shadcn Checkbox 기반입니다. 체크, 해제, 중간 상태(<Ic>indeterminate</Ic>)를 지원합니다.</P>
      <Preview code={`<div className="flex items-center gap-3">\n  <Checkbox id="agree" checked={checked} onCheckedChange={setChecked} />\n  <Label htmlFor="agree">동의합니다</Label>\n</div>`}>
        <div className="grid gap-3">
          <div className="flex items-center gap-3">
            <Checkbox id="doc-check" checked={checked} onCheckedChange={setChecked} />
            <Label htmlFor="doc-check" className="cursor-pointer font-normal">동의합니다</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="doc-check-i" checked="indeterminate" />
            <Label htmlFor="doc-check-i" className="font-normal">중간 상태</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="doc-check-d" disabled />
            <Label htmlFor="doc-check-d" className="font-normal text-muted-foreground">비활성</Label>
          </div>
        </div>
      </Preview>
      <UL>
        <li>항상 <Ic>Label</Ic>과 <Ic>htmlFor</Ic>/<Ic>id</Ic>로 묶어, 글자를 눌러도 체크되게 하세요.</li>
        <li>키보드: <Ic>Space</Ic>로 토글, <Ic>Tab</Ic>으로 이동합니다.</li>
        <li>오류 상태는 <Ic>aria-invalid</Ic>를 주면 테두리가 빨갛게 바뀝니다.</li>
      </UL>

      <H2>Radio Group</H2>
      <P>여러 선택지 중 <strong>하나만</strong> 고를 때 씁니다. 가입 폼의 선택 항목 <Ic>성별</Ic>이 이 컴포넌트를 사용합니다.</P>
      <Preview code={`<RadioGroup value={gender} onValueChange={setGender}>\n  <div className="flex items-center gap-2">\n    <RadioGroupItem id="g-male" value="male" />\n    <Label htmlFor="g-male">남성</Label>\n  </div>\n  ...\n</RadioGroup>`}>
        <RadioGroup className="grid-flow-col justify-start gap-5" value={gender} onValueChange={setGender}>
          {[["male", "남성"], ["female", "여성"], ["none", "선택 안 함"]].map(([v, l]) => (
            <div key={v} className="flex items-center gap-2">
              <RadioGroupItem id={`doc-g-${v}`} value={v} />
              <Label htmlFor={`doc-g-${v}`} className="cursor-pointer font-normal">{l}</Label>
            </div>
          ))}
        </RadioGroup>
      </Preview>
      <DocTable
        head={["언제", "무엇을"]}
        rows={[
          ["여러 개를 동시에 고를 수 있다", "Checkbox"],
          ["하나만 고른다 (보기가 적다)", "Radio Group"],
          ["하나만 고른다 (보기가 많다)", "Select (RoleSelect 참고)"],
          ["켜기/끄기 한 가지", "Checkbox 한 개"],
        ]}
      />
      <UL>
        <li>키보드: 방향키로 선택지를 이동하며 고르고, <Ic>Tab</Ic>은 그룹 전체를 한 번에 지나갑니다.</li>
        <li>가입 폼에서 켜려면 <Ic>signup.optionalFields</Ic>에 <Ic>&quot;gender&quot;</Ic>를 넣으세요.</li>
      </UL>

      <H2>Props</H2>
      <PropsTable
        rows={[
          ["terms", "TermsItem[]", "동의받을 약관 목록. 비어 있으면 아무것도 그리지 않습니다.", true],
          ["value", "string[]", "동의한 약관의 id 목록.", true],
          ["onChange", "(ids: string[]) => void", "체크가 바뀔 때 새 id 목록을 전달합니다.", true],
          ["invalid", "boolean", "true면 테두리를 빨갛게 강조합니다."],
        ]}
      />
    </>
  );
}

/* ─────────────────────────── Password Reset ─────────────────────────── */

export function PasswordResetDoc() {
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <>
      <P>
        비밀번호를 잊은 사용자가 <strong>이메일로 받은 링크</strong>를 통해 새 비밀번호를 정하는 기능입니다. 두 화면으로 이루어집니다:
        이메일을 입력받는 <Ic>ForgotPasswordForm</Ic>(로그인 모달 안)과, 메일 링크로 들어오는 <Ic>ResetPasswordForm</Ic>(<Ic>/reset-password</Ic> 페이지).
      </P>

      <H2>Flow</H2>
      <Tree>{`
① 로그인 화면에서 "비밀번호를 잊으셨나요?" 클릭
        ↓
② 이메일 입력 → POST /auth/password/forgot
        ↓
③ "메일을 확인해 주세요" 안내 (가입 여부와 관계없이 같은 화면)
        ↓
④ 사용자가 메일의 링크 클릭 → /reset-password?token=...
        ↓
⑤ 새 비밀번호 입력 → POST /auth/password/reset { token, password }
        ↓
⑥ "비밀번호를 변경했습니다" → 로그인
`}</Tree>

      <H2>Forgot password</H2>
      <P>로그인 모달에서 <Ic>비밀번호를 잊으셨나요?</Ic>를 누르면 이 폼으로 바뀝니다.</P>
      <Preview code={`<ForgotPasswordForm\n  onSubmit={forgot.mutate}\n  pending={forgot.isPending}\n  sent={forgot.isSuccess}\n  onBack={() => setMode("login")}\n/>`}>
        <div className="grid gap-4">
          <ForgotPasswordForm onSubmit={() => setSent(true)} sent={sent} onBack={() => setSent(false)} />
        </div>
      </Preview>
      <UL>
        <li>이메일을 보내면 입력한 주소와 함께 <strong>&quot;메일을 확인해 주세요&quot;</strong> 안내로 부드럽게 바뀝니다.</li>
        <li>가입된 이메일인지 여부는 <strong>알려 주지 않습니다.</strong> 서버가 항상 같은 응답을 주기 때문에 화면도 항상 같은 안내를 보여 줍니다 (계정 존재 여부 노출 방지).</li>
      </UL>

      <H2>Reset password</H2>
      <P>메일 링크로 들어오는 <Ic>/reset-password?token=...</Ic> 페이지에서 쓰는 폼입니다.</P>
      <Preview code={`<ResetPasswordForm\n  onSubmit={({ password }) => reset.mutate({ token, password })}\n  pending={reset.isPending}\n  done={reset.isSuccess}\n  onLogin={() => openDialog("login")}\n/>`}>
        <div className="grid gap-4">
          <ResetPasswordForm onSubmit={() => setDone(true)} done={done} onLogin={() => setDone(false)} />
          {done && <Button size="sm" variant="ghost" onClick={() => setDone(false)}>다시 보기</Button>}
        </div>
      </Preview>
      <DocTable
        head={["상황", "화면"]}
        rows={[
          ["8자 미만", "비밀번호는 8자 이상이어야 합니다."],
          ["두 입력이 다름", "비밀번호가 일치하지 않습니다."],
          ["서버가 거절 (만료·이미 사용한 토큰)", "서버의 detail 메시지를 그대로 보여 줍니다."],
          ["성공", "\"비밀번호를 변경했습니다\"와 로그인 버튼으로 바뀝니다."],
          ["주소에 token이 없음", "\"유효하지 않은 링크입니다\" 안내만 보여 줍니다."],
        ]}
      />

      <H2>API</H2>
      <CodeBlock title="POST /auth/password/forgot" code={`// request\n{ "email": "user@example.com" }\n\n// response 202 (가입 여부와 관계없이 항상 동일)`} />
      <CodeBlock title="POST /auth/password/reset" code={`// request\n{ "token": "메일 링크의 토큰", "password": "새 비밀번호" }\n\n// response 204 | 400 { "detail": "링크가 만료되었거나 이미 사용되었습니다." }`} />

      <H2>Server rules (planned)</H2>
      <UL>
        <li><strong>토큰:</strong> 추측할 수 없는 긴 난수. DB에는 <strong>해시만</strong> 저장하고, 메일에는 원본을 보냅니다.</li>
        <li><strong>만료:</strong> 짧게(예: 15~30분). 만료된 토큰은 거절합니다.</li>
        <li><strong>단일 사용:</strong> 한 번 쓰면 폐기합니다. 새 요청 시 이전 토큰도 폐기하는 것을 권장합니다.</li>
        <li><strong>횟수 제한:</strong> 같은 이메일·IP의 재요청을 제한해 메일 폭탄을 막습니다.</li>
        <li><strong>변경 후:</strong> 기존 로그인 세션(리프레시 토큰)을 폐기하고, 가능하면 변경 알림 메일을 보냅니다.</li>
      </UL>
      <Callout tone="warn">메일을 실제로 보내는 부분은 서비스가 준비해야 합니다. 로컬에서는 메일 캐처(예: Mailpit)를 docker-compose에 두고 확인하는 방식을 권장합니다.</Callout>

      <H2>Change the text</H2>
      <P>화면의 문구(제목, 안내, 버튼, 메시지)는 컴포넌트 파일 안에 그대로 적혀 있어서 <strong>해당 파일을 열어 글자만 바꾸면</strong> 됩니다. 어디에 무엇이 있는지 정리했습니다.</P>
      <DocTable
        head={["바꾸고 싶은 문구", "파일", "찾는 방법"]}
        rows={[
          ["모달 제목과 설명 (\"비밀번호 찾기\", \"가입한 이메일로 재설정 링크를…\")", <Ic key="1">auth/components/AuthDialog.tsx</Ic>, <><Ic>copy.forgot</Ic>의 <Ic>title</Ic>, <Ic>desc</Ic></>],
          ["이메일 입력 라벨·안내, [재설정 링크 받기] 버튼, \"메일을 확인해 주세요\" 안내", <Ic key="2">auth/components/ForgotPasswordForm.tsx</Ic>, "화면에 보이는 한글을 그대로 검색"],
          ["로그인 화면의 \"비밀번호를 잊으셨나요?\" 링크", <Ic key="3">auth/components/LoginForm.tsx</Ic>, <><Ic>onForgotPassword</Ic> 근처의 버튼 글자</>],
          ["재설정 화면의 제목·설명 (\"비밀번호 재설정\", \"새로 사용할 비밀번호를…\"), 잘못된 링크 안내", <Ic key="4">auth/ResetPasswordPage.tsx</Ic>, <><Ic>h1</Ic>과 안내 문단</>],
          ["새 비밀번호 입력 라벨, 8자·불일치 오류, \"변경했습니다\" 완료 안내", <Ic key="5">auth/components/ResetPasswordForm.tsx</Ic>, "오류 문구와 완료 화면의 글자"],
          ["서버가 돌려주는 오류 문구 (링크 만료 등)", "서버", <>응답의 <Ic>detail</Ic> 값을 그대로 보여 줍니다</>],
          ["받는 사람이 보는 메일의 제목·본문", "서버 (메일 템플릿)", "메일은 서버가 만들어 보냅니다"],
        ]}
      />
      <CodeBlock title="auth/components/AuthDialog.tsx" code={`const copy = {\n  login: { title: "로그인", desc: "아이디와 비밀번호를 입력하세요." },\n  signup: { title: "회원가입", desc: "정보를 입력해 계정을 만드세요." },\n  forgot: { title: "비밀번호 찾기", desc: "가입한 이메일로 재설정 링크를 보내 드립니다." }, // ← 여기를 고칩니다\n} as const;`} />
      <CodeBlock title="auth/components/ForgotPasswordForm.tsx" code={`<p className="text-sm font-semibold">메일을 확인해 주세요</p>      // 안내 제목\n...\n<Button type="submit">{pending ? "보내는 중…" : "재설정 링크 받기"}</Button>  // 버튼 글자`} />
      <Callout>킷 폴더 안의 파일을 직접 고치면 킷을 업데이트할 때 충돌할 수 있습니다. 문구를 많이 바꿔야 한다면 해당 컴포넌트를 복사해 서비스 폴더(<Ic>app/(service)/</Ic>)에 두고 쓰는 것을 권장합니다.</Callout>

      <H2>Customization</H2>
      <UL>
        <li>메일 링크 주소는 <Ic>meerkitConfig.routes.resetPassword</Ic>(<Ic>/reset-password</Ic>)입니다. 서버가 메일 본문에 이 주소를 만들 때 같은 값을 쓰세요.</li>
        <li>비밀번호 최소 길이(8자)는 <Ic>ResetPasswordForm.tsx</Ic>에서 바꿉니다. 서버 정책과 같게 유지하세요.</li>
        <li>로그인 화면의 &quot;비밀번호를 잊으셨나요?&quot; 링크를 없애려면 <Ic>LoginForm</Ic>에 <Ic>onForgotPassword</Ic>를 넘기지 않으면 됩니다.</li>
      </UL>

      <H2>Props</H2>
      <H3>ForgotPasswordForm</H3>
      <PropsTable
        rows={[
          ["onSubmit", "(input: { email }) => void", "이메일을 제출할 때 호출합니다.", true],
          ["sent", "boolean", "true면 \"메일을 확인해 주세요\" 안내로 바뀝니다."],
          ["pending", "boolean", "요청 중 여부."],
          ["error", "string | null", "서버 오류 메시지."],
          ["onBack", "() => void", "안내 화면의 \"로그인으로 돌아가기\" 동작."],
        ]}
      />
      <H3>ResetPasswordForm</H3>
      <PropsTable
        rows={[
          ["onSubmit", "(input: { password }) => void", "검증을 통과하면 새 비밀번호를 전달합니다. 토큰은 부모가 붙입니다.", true],
          ["done", "boolean", "true면 \"변경했습니다\" 안내로 바뀝니다."],
          ["pending", "boolean", "요청 중 여부."],
          ["error", "string | null", "서버 오류 메시지."],
          ["onLogin", "() => void", "완료 화면의 로그인 버튼 동작."],
        ]}
      />
    </>
  );
}

/* ─────────────────────────── Profile ─────────────────────────── */

export function ProfileDoc() {
  const user = { ...mockUsers[1], phone: "010-1234-5678" };
  return (
    <>
      <DocLinks items={[links.component("tabs", "Tabs"), links.component("sonner", "Sonner")]} />
      <P>
        로그인한 사용자가 <strong>자신의 정보를 보고 고치는</strong> 화면입니다. <Ic>/me</Ic> 페이지에서 큰 아바타와 요약 카드 아래에
        <strong> 프로필 수정</strong>과 <strong>비밀번호 변경</strong> 두 탭으로 제공됩니다.
      </P>
      <Callout>두 폼은 <Ic>/me</Ic>에서 쓰이지만 서로 독립적인 컴포넌트라, 내 서비스의 설정 화면 등 다른 곳에도 그대로 가져다 쓸 수 있습니다.</Callout>

      <H2>What users can do</H2>
      <DocTable
        head={["탭", "할 수 있는 것", "할 수 없는 것"]}
        rows={[
          ["프로필 수정", "이름, 이메일, (켠 경우) 닉네임·전화번호·주소·생년월일·성별 수정", "아이디 변경, 역할 변경"],
          ["비밀번호 변경", "현재 비밀번호를 확인한 뒤 새 비밀번호로 변경", "현재 비밀번호 없이 변경"],
        ]}
      />

      <H2>Profile form</H2>
      <Preview code={`<ProfileForm\n  user={user}\n  onSubmit={update.mutate}\n  pending={update.isPending}\n  optionalFields={["nickname", "phone", "address"]}\n  addressType="postcode"\n/>`}>
        <ProfileForm user={user} onSubmit={noop} optionalFields={["nickname", "phone", "address"]} addressType="postcode" addressSearch="dialog" addressSearchProvider={demoAddressProvider} />
      </Preview>
      <H3>Nickname</H3>
      <UL>
        <li>닉네임을 켜 두면 마이페이지 요약 카드에서 <strong>[변경] 한 번으로 바꿀</strong> 수 있습니다 (<Ic>NicknameForm</Ic>, Nickname 페이지 참고). 이 프로필 폼에서는 중복을 피하려고 닉네임을 따로 보여 주지 않습니다.</li>
        <li>폼 컴포넌트 단독으로 쓸 때(<Ic>optionalFields</Ic>에 nickname을 넣었을 때)는 이 폼 안에서도 입력하고 바꿀 수 있습니다 (2~12자). 비우고 저장하면 닉네임이 지워지고 이름이 다시 보입니다.</li>
        <li>닉네임이 있으면 사용자 메뉴, 아바타의 이니셜, 내 정보 제목에 이름 대신 닉네임이 쓰입니다.</li>
        <li>중복 닉네임은 서버가 거절하고, 그 메시지가 폼 아래에 나옵니다.</li>
      </UL>
      <H3>Address</H3>
      <P>주소는 가입과 같은 <Ic>AddressField</Ic>를 씁니다. 검색 버튼으로 다시 고르면 우편번호와 주소가 함께 바뀌고, 상세 주소만 고칠 수도 있습니다 (Address Field 참고).</P>
      <UL>
        <li>처음에는 <strong>저장 버튼이 잠겨</strong> 있고, 값을 바꿔야 켜집니다. 바꾸지 않은 채 저장하는 일을 막습니다.</li>
        <li><strong>아이디는 수정할 수 없습니다</strong>(비활성 입력창). 로그인 식별자라 바꾸면 안 됩니다.</li>
        <li>저장에 성공하면 화면의 이름·이메일이 바로 갱신되고 <Ic>내 정보를 저장했습니다.</Ic> 토스트가 나타납니다.</li>
        <li>선택 항목은 가입 폼에서 켠 <Ic>signup.optionalFields</Ic>와 같은 목록을 씁니다. 가입에서 받는 항목은 여기서도 고칠 수 있어야 하기 때문입니다.</li>
      </UL>

      <H2>Change password</H2>
      <Preview code={`<ChangePasswordForm\n  onSubmit={change.mutate}\n  pending={change.isPending}\n  error={message}\n/>`}>
        <ChangePasswordForm onSubmit={noop} />
      </Preview>
      <DocTable
        head={["검사", "메시지"]}
        rows={[
          ["새 비밀번호 8자 미만", "새 비밀번호는 8자 이상이어야 합니다."],
          ["현재와 동일", "현재 비밀번호와 다른 비밀번호를 입력해 주세요."],
          ["새 비밀번호 두 입력이 다름", "새 비밀번호가 일치하지 않습니다."],
          ["현재 비밀번호가 틀림 (서버)", "서버의 detail 메시지를 그대로 표시"],
        ]}
      />
      <UL>
        <li>제출하면 입력창이 모두 비워집니다. 비밀번호를 화면에 남기지 않기 위해서입니다.</li>
        <li>성공하면 <Ic>비밀번호를 변경했습니다.</Ic> 토스트가 나타납니다.</li>
      </UL>

      <H2>API</H2>
      <CodeBlock title="PATCH /users/me" code={`// request\n{ "name": "김관리자", "email": "master@example.com", "phone": "010-1234-5678" }\n\n// response 200 → 갱신된 User`} />
      <CodeBlock title="PATCH /users/me/password" code={`// request\n{ "current_password": "••••••••", "new_password": "••••••••" }\n\n// response 204 | 400 { "detail": "현재 비밀번호가 올바르지 않습니다." }`} />
      <Callout tone="warn">
        서버는 <strong>본인 요청인지</strong>(토큰의 사용자)와 <strong>수정 가능한 필드만 받는지</strong>(role_id 같은 필드를 무시)를 반드시 확인해야 합니다. 일반 사용자가 자신의 역할을 바꾸는 요청을 보낼 수 없어야 합니다.
      </Callout>
      <UL>
        <li>비밀번호를 바꾼 뒤 다른 기기의 세션을 끊을지는 서버 정책입니다. 보안상 끊는 것을 권장합니다.</li>
      </UL>

      <H2>Props</H2>
      <H3>ProfileForm</H3>
      <PropsTable
        rows={[
          ["user", "User", "현재 사용자. 입력창의 초기값이 됩니다.", true],
          ["onSubmit", "(input: UpdateProfileInput) => void", "저장할 때 호출합니다.", true],
          ["optionalFields", "SignupOptionalField[]", "함께 수정할 선택 항목."],
          ["pending", "boolean", "요청 중 여부."],
          ["error", "string | null", "서버 오류 메시지."],
        ]}
      />
      <H3>ChangePasswordForm</H3>
      <PropsTable
        rows={[
          ["onSubmit", "(input: { current_password, new_password }) => void", "검증을 통과하면 호출합니다.", true],
          ["pending", "boolean", "요청 중 여부."],
          ["error", "string | null", "서버 오류 메시지."],
        ]}
      />
    </>
  );
}

/* ─────────────────────────── Member Directory ─────────────────────────── */

export function MemberDirectoryDoc() {
  const [query, setQuery] = useState<MemberQuery>(defaultMemberQuery);
  const onQueryChange = useCallback((patch: Partial<MemberQuery>) => setQuery((q) => ({ ...q, ...patch })), []);
  const [page, setPage] = useState(4);
  return (
    <>
      <DocLinks items={[links.component("table", "Table"), links.component("pagination", "Pagination"), links.component("input", "Input")]} />
      <P>
        멤버가 많아질 때 필요한 <strong>검색, 필터, 페이지 나누기</strong>를 한 덩어리로 묶은 관리자 목록입니다.
        <Ic>MemberTable</Ic>(표) 위에 <Ic>MemberFilters</Ic>(검색·필터)와 <Ic>Pagination</Ic>(페이지 이동)을 더했고, <Ic>/admin/members</Ic>가 이것을 씁니다.
      </P>

      <H2>Preview</H2>
      <P>27명의 목 데이터로 직접 시험해 보세요. 검색어를 입력하고, 역할·상태를 고르고, 페이지를 넘겨 보세요.</P>
      <PreviewWide code={`<MemberDirectory\n  query={query}\n  onQueryChange={(patch) => setQuery((q) => ({ ...q, ...patch }))}\n  data={data}            // { items, total, page, size }\n  loading={isFetching}\n  onRoleChange={(id, roles) => updateRoles.mutate({ id, roles })}\n  onRemove={(id) => removeMember.mutate(id)}\n/>`}>
        <div className="p-3">
          <MemberDirectory
            query={query}
            onQueryChange={onQueryChange}
            data={filterMembers(mockMembers, query)}
            onRoleChange={noop}
            onRemove={noop}
          />
        </div>
      </PreviewWide>

      <H2>What users can do</H2>
      <DocTable
        head={["기능", "동작"]}
        rows={[
          ["검색", "아이디, 이름, 이메일에서 찾습니다. 입력을 멈추고 0.3초 뒤에 반영되어 글자마다 서버를 부르지 않습니다."],
          ["역할 필터", "MASTER, OWNER, VIEWER, WRITER 중 하나만 보거나 전체를 봅니다."],
          ["상태 필터", "활성, 비활성, 삭제됨 중 하나만 보거나 전체를 봅니다."],
          ["페이지 이동", "이전/다음 버튼과 페이지 번호. 페이지가 많으면 현재 주변만 보이고 나머지는 …으로 줄입니다."],
          ["페이지당 개수", "10, 20, 50개 중에서 고릅니다."],
          ["초기화", "필터가 걸려 있을 때만 나타나는 버튼. 검색어와 필터를 한 번에 지웁니다."],
        ]}
      />
      <UL>
        <li>검색어나 필터를 바꾸면 <strong>자동으로 1페이지로</strong> 돌아갑니다. 3페이지를 보다가 검색했는데 빈 화면이 나오는 일을 막습니다.</li>
        <li>새 결과가 오는 동안 <strong>이전 목록을 흐리게 유지</strong>해서 화면이 깜빡이지 않습니다.</li>
        <li>결과가 없으면 안내 문구와 <Ic>필터 초기화</Ic> 버튼을 보여 줍니다.</li>
        <li>아래에는 &quot;전체 27명 중 1–10&quot;처럼 현재 범위를 표시합니다.</li>
      </UL>

      <H2>How data flows</H2>
      <Tree>{`
MemberFilters (입력)  ──►  query { q, roleId, status, page, size }
                               │
                               ▼
            GET /users?q=&role_id=&status=&page=&size=
                               │
                               ▼
        { items: User[], total, page, size }  ──►  MemberTable + Pagination
`}</Tree>
      <P>조건(<Ic>query</Ic>)은 부모가 들고 있고, <Ic>MemberDirectory</Ic>는 값을 받아 보여 주고 바뀐 부분만 <Ic>onQueryChange</Ic>로 알려 줍니다. 서버 조회든 목 데이터든 상관없이 쓸 수 있습니다.</P>
      <CodeBlock title="AdminMembersPage.tsx" code={`const [query, setQuery] = useState(defaultMemberQuery);\nconst onQueryChange = useCallback(\n  (patch) => setQuery((q) => ({ ...q, ...patch })),\n  [],\n);\nconst { data, isFetching } = useMembers(query);\n\n<MemberDirectory query={query} onQueryChange={onQueryChange} data={data} loading={isFetching} ... />`} />
      <Callout><Ic>onQueryChange</Ic>는 <Ic>useCallback</Ic>으로 감싸 같은 함수를 유지하세요. 매번 새 함수가 만들어지면 검색 입력의 지연 처리가 계속 초기화됩니다.</Callout>

      <H2>API</H2>
      <CodeBlock title="GET /users" code={`GET /users?q=kim&role_id=3&status=active&page=2&size=10\n\n// response 200\n{\n  "items": [ { "id": 11, "user_id": "user11", ... } ],\n  "total": 27,\n  "page": 2,\n  "size": 10\n}`} />
      <DocTable
        head={["파라미터", "타입", "설명"]}
        rows={[
          [<Ic key="1">q</Ic>, "string", "아이디·이름·이메일에 포함된 글자. 비어 있으면 보내지 않습니다."],
          [<Ic key="2">role_id</Ic>, "number", "역할 필터. 전체면 보내지 않습니다."],
          [<Ic key="3">status</Ic>, '"active" | "inactive" | "deleted"', "상태 필터. 전체면 보내지 않습니다."],
          [<Ic key="4">page</Ic>, "number", "1부터 시작하는 페이지 번호."],
          [<Ic key="5">size</Ic>, "number", "페이지당 개수 (10, 20, 50)."],
        ]}
      />
      <Callout tone="warn">검색·필터·페이지 나누기는 <strong>서버가 해야</strong> 합니다. 전체를 받아 브라우저에서 거르면 멤버가 많아질 때 느려지고 불필요한 데이터가 노출됩니다. 위 미리보기의 브라우저 필터는 서버 없이 화면을 보여 주기 위한 용도입니다.</Callout>

      <H2>Pagination</H2>
      <P>페이지 이동 버튼만 따로 쓸 수도 있는 shadcn 스타일 컴포넌트입니다. 현재 페이지 주변만 보여 주고 나머지는 <Ic>…</Ic>로 줄입니다.</P>
      <Preview code={`<Pagination page={page} pageCount={12} onPageChange={setPage} />`}>
        <div className="flex justify-center">
          <Pagination page={page} pageCount={12} onPageChange={setPage} />
        </div>
      </Preview>
      <UL>
        <li>7쪽 이하는 전부, 그보다 많으면 <Ic>1 … 4 5 [6] 7 8 … 12</Ic> 형태로 보여 줍니다.</li>
        <li>첫/마지막 페이지에서는 이전/다음 버튼이 잠깁니다. 페이지가 1개뿐이면 아무것도 그리지 않습니다.</li>
        <li>현재 페이지는 <Ic>aria-current=&quot;page&quot;</Ic>로 표시되어 스크린리더가 알립니다.</li>
      </UL>

      <H2>Props</H2>
      <H3>MemberDirectory props</H3>
      <PropsTable
        rows={[
          ["query", "MemberQuery", "현재 조건 { q, roleId, status, page, size }.", true],
          ["onQueryChange", "(patch: Partial<MemberQuery>) => void", "조건이 바뀌면 바뀐 부분만 전달합니다.", true],
          ["data", "Page<User>", "현재 조건에 맞는 한 페이지와 전체 개수 { items, total, page, size }."],
          ["loading", "boolean", "조회 중이면 이전 목록을 흐리게 보여 줍니다."],
          ["onRoleChange", "(id, roleId) => void", "역할이 바뀔 때.", true],
          ["onRemove", "(id) => void", "탈퇴 처리를 눌렀을 때.", true],
        ]}
      />
      <H3>Pagination props</H3>
      <PropsTable
        rows={[
          ["page", "number", "현재 페이지 (1부터).", true],
          ["pageCount", "number", "전체 페이지 수.", true],
          ["onPageChange", "(page: number) => void", "페이지를 고르면 호출합니다.", true],
        ]}
      />

      <H2>Customization</H2>
      <UL>
        <li>검색 지연 시간은 <Ic>{"<MemberFilters debounceMs={500} />"}</Ic>처럼 바꿉니다 (기본 300ms).</li>
        <li>페이지당 개수 선택지는 <Ic>admin/members-filter.ts</Ic>의 <Ic>SIZE_OPTIONS</Ic>입니다.</li>
        <li>상태 필터의 항목은 같은 파일의 <Ic>STATUS_OPTIONS</Ic>에서 고칩니다.</li>
        <li>컬럼을 더하려면 <Ic>MemberTable</Ic>에 <Ic>TableHead</Ic>·<Ic>TableCell</Ic> 한 쌍을 추가하세요.</li>
      </UL>
    </>
  );
}
