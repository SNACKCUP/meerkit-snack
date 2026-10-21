"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/ui/file-dropzone";

import { MemberTable } from "../../admin/components/MemberTable";
import { RoleAssignDialog } from "../../admin/components/RoleAssignDialog";
import { AddressField, type AddressValue } from "../../auth/components/AddressField";
import { EmailVerificationField } from "../../auth/components/EmailVerificationField";
import type { User } from "../../types";
import { Callout, CodeBlock, DocLinks, DocTable, H2, H3, Ic, links, P, Preview, PreviewWide, PropsTable, Tree, UL } from "../ui";
import { demoAddressSearch, demoEmailHandlers, mockUsers, roleOf } from "./mock";

/* ─────────────────────────── Role Manager ─────────────────────────── */

export function RoleManagerDoc() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<string | null>(null);

  const change = (id: number, roleId: number) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: roleOf(roleId) } : u)));
    const who = users.find((u) => u.id === id);
    setLast(`${who?.name}님의 역할을 ${roleOf(roleId).name}(으)로 변경 요청`);
  };

  return (
    <>
      <DocLinks items={[links.component("dialog", "Dialog"), links.component("radio-group", "Radio Group")]} />
      <P>
        <strong>관리자가 한 사용자에게 권한(역할)을 부여하거나 바꾸는</strong> 확인 창입니다. 단순한 선택 상자와 달리, 역할마다 <strong>무엇을 할 수 있는지(C·R·U·D)</strong>를 보여 주고,
        위험한 변경(본인의 관리자 권한 해제, MASTER 부여)은 확인 전에 경고합니다.
      </P>

      <H2>Preview</H2>
      <P>표에서 사용자 옆의 <Ic>변경</Ic>을 눌러 보세요. 첫 번째 사용자(MASTER)는 &quot;현재 로그인한 관리자 본인&quot;으로 가정했습니다 — 이 사용자의 역할을 낮춰 보면 경고가 나옵니다.</P>
      <PreviewWide code={`<MemberTable\n  members={members}\n  roleEditor="dialog"        // 기본값\n  currentUserId={me.id}      // 본인 권한 하향 경고용\n  onRoleChange={(id, roleId) => updateRole.mutate({ id, roleId })}\n  onRemove={(id) => removeMember.mutate(id)}\n/>`}>
        <MemberTable members={users} currentUserId={1} onRoleChange={change} onRemove={() => {}} />
      </PreviewWide>
      {last && <p className="mk-swap text-xs text-muted-foreground">마지막 변경: {last}</p>}

      <H2>What admins can do</H2>
      <DocTable
        head={["단계", "관리자가 하는 일", "화면 동작"]}
        rows={[
          ["1. 열기", "멤버 표에서 역할 옆 [변경] 클릭", "사용자 정보(아바타, 아이디, 이메일, 현재 역할)가 있는 확인 창이 열립니다."],
          ["2. 비교", "역할 카드들을 살펴봄", "역할마다 설명과 C·R·U·D 칩이 보입니다. 색이 진한 글자가 허용되는 작업입니다."],
          ["3. 선택", "원하는 역할 카드를 클릭", "선택한 카드가 강조되고, 위쪽에 \"현재 역할 → 새 역할\"이 나타납니다."],
          ["4. 확인", "[역할 변경] 클릭", "새 역할 id로 onSubmit이 호출되고 창이 닫힙니다."],
        ]}
      />
      <UL>
        <li>현재 역할과 같으면 <strong>[역할 변경] 버튼이 잠겨</strong> 있어 의미 없는 요청을 막습니다.</li>
        <li>삭제된 사용자는 [변경] 버튼이 비활성화됩니다.</li>
        <li>창을 닫았다가 다른 사용자를 열면 선택 상태가 새로 시작됩니다.</li>
      </UL>

      <H2>Warnings</H2>
      <DocTable
        head={["상황", "화면"]}
        rows={[
          ["본인(currentUserId)의 MASTER를 다른 역할로 낮춤", "빨간 경고 \"본인의 관리자 권한을 내리려 하고 있습니다\"와 빨간 확인 버튼"],
          ["다른 사용자에게 MASTER 부여", "\"모든 사용자와 데이터를 관리할 수 있습니다\" 안내"],
          ["그 외 변경", "경고 없이 변경 내용만 표시"],
        ]}
      />
      <Callout tone="warn">
        이 경고는 실수를 줄이는 <strong>안내</strong>일 뿐입니다. 서버는 반드시 (1) 요청자가 MASTER인지, (2) 마지막 MASTER를 낮추는 요청이 아닌지, (3) 대상 사용자와 역할이 유효한지를 다시 검사해야 합니다.
      </Callout>

      <H2>Inline select vs dialog</H2>
      <P>같은 <Ic>MemberTable</Ic>이 두 방식을 모두 지원합니다. 기본은 확인 창이고, 목록에서 빠르게 바꾸고 싶다면 인라인으로 바꿀 수 있습니다.</P>
      <DocTable
        head={["roleEditor", "모양", "이럴 때"]}
        rows={[
          [<Ic key="1">&quot;dialog&quot;</Ic>, "역할 배지 + [변경] → 확인 창", "역할 설명을 보고 신중히 바꿔야 할 때 (기본, 권장)"],
          [<Ic key="2">&quot;inline&quot;</Ic>, "표 안의 선택 상자", "역할이 단순하고 빠른 변경이 중요할 때 (Role Select 참고)"],
        ]}
      />

      <H2>Use the dialog on its own</H2>
      <P>표 밖(사용자 상세 화면 등)에서도 단독으로 쓸 수 있습니다.</P>
      <Preview code={`const [open, setOpen] = useState(false);\n\n<Button onClick={() => setOpen(true)}>역할 변경</Button>\n<RoleAssignDialog\n  user={user}\n  open={open}\n  onOpenChange={setOpen}\n  currentUserId={me.id}\n  pending={updateRole.isPending}\n  onSubmit={(roleId) => updateRole.mutate({ id: user.id, roleId })}\n/>`}>
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setOpen(true)}>역할 변경 열기</Button>
          <RoleAssignDialog user={users[1]} open={open} onOpenChange={setOpen} currentUserId={1} onSubmit={(roleId) => change(users[1].id, roleId)} />
        </div>
      </Preview>

      <H2>Where the roles come from</H2>
      <P>
        선택지, 설명, C·R·U·D 칩은 모두 <Ic>src/meerkit/roles.ts</Ic>의 <Ic>ROLES</Ic>에서 만들어집니다. 역할을 추가하거나 설명을 바꾸면 이 창에 그대로 반영됩니다 (Add a role 가이드 참고).
      </P>

      <H2>Server rules (planned)</H2>
      <Tree>{`
PATCH /users/{id}/role  { "role_id": 3 }
   │
   ├─ 요청자가 MASTER가 아님 ─────────────► 403
   ├─ 대상이 없거나 role_id가 유효하지 않음 ► 404 / 422
   ├─ 마지막 MASTER를 낮추려 함 ──────────► 409 (최소 1명 유지)
   └─ 통과 ──────────────────────────────► 200 + 갱신된 User (+ 변경 기록)
`}</Tree>
      <UL>
        <li>역할 변경 기록(누가, 누구를, 언제, 무엇에서 무엇으로)을 남기는 것을 권장합니다.</li>
        <li>역할이 바뀐 사용자의 기존 토큰은 새 역할이 즉시 반영되도록 갱신하거나 다음 요청에서 다시 확인하세요.</li>
      </UL>

      <H2>Accessibility</H2>
      <UL>
        <li>Radix Dialog 기반: 포커스가 창 안에 갇히고 <Ic>Esc</Ic>로 닫을 수 있으며, 닫으면 포커스가 [변경] 버튼으로 돌아옵니다.</li>
        <li>역할 선택은 라디오 그룹이라 방향키로 이동하고, 각 카드는 라벨로 묶여 있어 어디를 눌러도 선택됩니다.</li>
        <li>C·R·U·D 칩은 <Ic>title</Ic>과 <Ic>aria-label</Ic>로 의미(Create 등)를 전달합니다.</li>
      </UL>

      <H2>Props</H2>
      <H3>RoleAssignDialog</H3>
      <PropsTable
        rows={[
          ["user", "User | null", "역할을 바꿀 사용자. null이면 아무것도 그리지 않습니다.", true],
          ["open", "boolean", "열림 여부.", true],
          ["onOpenChange", "(open: boolean) => void", "열림 상태가 바뀔 때 호출합니다.", true],
          ["onSubmit", "(roleId: number) => void", "[역할 변경]을 누르면 새 역할 id와 함께 호출합니다. 호출 뒤 창은 닫힙니다.", true],
          ["currentUserId", "number", "지금 로그인한 관리자의 id. 본인 권한을 낮추는 변경을 경고하는 데 씁니다."],
          ["pending", "boolean", "요청 중이면 버튼을 잠그고 \"변경 중…\"을 보여 줍니다."],
        ]}
      />
      <H3>MemberTable (추가된 props)</H3>
      <PropsTable
        rows={[
          ["roleEditor", '"dialog" | "inline"', "역할 변경 방식. 기본 dialog."],
          ["currentUserId", "number", "본인 권한 하향 경고용."],
        ]}
      />
    </>
  );
}

/* ─────────────────────────── Address Field ─────────────────────────── */

const emptyAddress: AddressValue = { postcode: "", address: "", address_detail: "" };

export function AddressFieldDoc() {
  const [basic, setBasic] = useState<AddressValue>(emptyAddress);
  const [post, setPost] = useState<AddressValue>(emptyAddress);

  return (
    <>
      <DocLinks items={[links.component("input", "Input"), links.component("button", "Button")]} />
      <P>
        <strong>주소 검색 버튼을 눌러 고르면 우편번호와 주소가 함께 채워지고</strong>, 상세 주소만 직접 입력하는 컴포넌트입니다. 서비스에 맞게 <strong>두 가지 입력 방식</strong>을 고를 수 있습니다.
      </P>

      <H2>Types</H2>
      <DocTable
        head={["타입", "구성", "이럴 때"]}
        rows={[
          [<Ic key="1">&quot;basic&quot;</Ic>, "주소 · 상세 주소", "우편번호를 따로 저장하지 않아도 되는 서비스"],
          [<Ic key="2">&quot;postcode&quot;</Ic>, "우편번호 · 주소 · 상세 주소", "배송, 결제처럼 우편번호가 필요한 서비스"],
        ]}
      />

      <H2>Type A — basic</H2>
      <P>주소 입력칸 옆의 <Ic>주소 검색</Ic>을 누르거나 주소칸을 눌러 검색합니다. 아래에 상세 주소칸이 이어집니다.</P>
      <Preview code={`<AddressField\n  variant="basic"\n  value={value}\n  onChange={setValue}\n/>`}>
        <div className="grid gap-3">
          <AddressField variant="basic" idPrefix="doc-a" value={basic} onChange={setBasic} onSearch={demoAddressSearch} />
          <p className="text-xs text-muted-foreground">값: <code className="font-mono">{JSON.stringify(basic)}</code></p>
        </div>
      </Preview>

      <H2>Type B — postcode</H2>
      <P>우편번호칸과 검색 버튼이 위에, 그 아래 주소칸, 상세 주소칸 순서입니다. 검색하면 우편번호와 주소가 <strong>한 번에</strong> 들어갑니다.</P>
      <Preview code={`<AddressField\n  variant="postcode"\n  value={value}\n  onChange={setValue}\n/>`}>
        <div className="grid gap-3">
          <AddressField variant="postcode" idPrefix="doc-b" value={post} onChange={setPost} onSearch={demoAddressSearch} />
          <p className="text-xs text-muted-foreground">값: <code className="font-mono">{JSON.stringify(post)}</code></p>
        </div>
      </Preview>
      <Callout>미리보기는 실제 팝업 대신 고정된 샘플 주소(06236, 테헤란로 152)를 돌려줍니다. 실제 화면에서는 카카오(다음) 우편번호 팝업이 열립니다.</Callout>

      <H2>How users enter an address</H2>
      <UL>
        <li><strong>검색 버튼</strong>(또는 읽기 전용 주소칸)을 누르면 주소 검색 팝업이 열립니다.</li>
        <li>팝업에서 주소를 고르면 <strong>우편번호와 주소가 자동으로 채워집니다.</strong> 이 칸들은 직접 고치지 못하게 읽기 전용이라 잘못된 우편번호가 들어가지 않습니다.</li>
        <li>이어서 <strong>상세 주소</strong>(동·호수 등)를 직접 입력합니다.</li>
        <li>검색 스크립트를 불러오지 못하면 <strong>직접 입력으로 자동 전환</strong>되고 안내 문구가 나옵니다. 네트워크 문제로 가입이 막히지 않게 하기 위해서입니다.</li>
      </UL>

      <H2>Use it in signup &amp; profile</H2>
      <P>가입·내 정보 수정 폼에서는 설정만 바꾸면 됩니다.</P>
      <CodeBlock title="meerkit.config.ts" code={`export default defineMeerkitConfig({\n  signup: {\n    optionalFields: ["address"],\n    addressType: "postcode", // "basic" | "postcode"\n  },\n});`} />
      <DocTable
        head={["addressType", "서버로 가는 필드"]}
        rows={[
          [<Ic key="1">basic</Ic>, <Ic key="a">address, address_detail</Ic>],
          [<Ic key="2">postcode</Ic>, <Ic key="b">postcode, address, address_detail</Ic>],
        ]}
      />
      <CodeBlock title="POST /auth/signup" code={`{\n  "user_id": "newbie",\n  "postcode": "06236",\n  "address": "서울특별시 강남구 테헤란로 152",\n  "address_detail": "12층 1201호",\n  ...\n}`} />
      <Callout tone="warn">주소를 받으려면 백엔드 <Ic>users</Ic> 테이블에 <Ic>postcode</Ic>(basic은 불필요), <Ic>address</Ic>, <Ic>address_detail</Ic> 컬럼이 있어야 합니다 (Data Model 참고).</Callout>

      <H2>Use a different search service</H2>
      <P>기본 검색은 카카오(다음) 우편번호입니다. 다른 서비스(도로명주소 API 등)를 쓰려면 같은 모양의 함수를 <Ic>onSearch</Ic>로 넘기세요. 반환값은 <Ic>{"{ postcode, address }"}</Ic>이고, 사용자가 그냥 닫으면 <Ic>null</Ic>을 돌려주면 됩니다.</P>
      <CodeBlock title="tsx" code={`async function mySearch() {\n  const picked = await openMyAddressPopup();   // 내 서비스의 검색 UI\n  return picked ? { postcode: picked.zip, address: picked.road } : null;\n}\n\n<AddressField variant="postcode" value={v} onChange={setV} onSearch={mySearch} />`} />

      <H2>Props</H2>
      <PropsTable
        rows={[
          ["value", "{ postcode, address, address_detail }", "현재 값. 세 칸 모두 문자열입니다.", true],
          ["onChange", "(value) => void", "검색하거나 상세 주소를 입력하면 바뀐 전체 값을 전달합니다.", true],
          ["variant", '"basic" | "postcode"', "입력 방식. 기본 basic."],
          ["onSearch", "() => Promise<{ postcode, address } | null>", "주소 검색 방법. 없으면 카카오 우편번호 팝업."],
          ["idPrefix", "string", "입력창 id 접두사. 한 화면에 둘 이상 둘 때 겹치지 않게 지정합니다."],
          ["disabled", "boolean", "모두 잠급니다."],
        ]}
      />
      <H2>Accessibility</H2>
      <UL>
        <li>각 입력에 <Ic>aria-label</Ic>(우편번호, 주소, 상세 주소)이 있고, 검색 실패 안내는 <Ic>role=&quot;status&quot;</Ic>로 읽힙니다.</li>
        <li>상세 주소는 <Ic>autoComplete=&quot;address-line2&quot;</Ic>를 지정했습니다.</li>
      </UL>
    </>
  );
}

/* ─────────────────────────── Email Verification ─────────────────────────── */

export function EmailVerificationDoc() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  return (
    <>
      <P>
        이메일 입력칸 옆에 <strong>[인증번호 받기]</strong> 버튼을 붙이고, 받은 인증번호를 확인해야 가입할 수 있게 하는 기능입니다. 이메일 인증이 필요한지는 서비스마다 다르므로 <strong>선택 사항(기본: 꺼짐)</strong>입니다.
      </P>

      <H2>Preview</H2>
      <P>
        아무 이메일이나 넣고 <Ic>인증번호 받기</Ic>를 누른 뒤, 인증번호에 <Ic>123456</Ic>을 입력해 보세요. 다른 번호를 넣으면 오류가 나옵니다.
      </P>
      <Preview code={`<EmailVerificationField\n  value={email}\n  onChange={setEmail}\n  verified={token !== null}\n  onVerifiedChange={setToken}\n  sendCode={(email) => api.post("/auth/email/send-code", { email })}\n  verifyCode={async (email, code) => (await verify(email, code)).token}\n/>`}>
        <div className="grid gap-3">
          <EmailVerificationField value={email} onChange={setEmail} verified={token !== null} onVerifiedChange={setToken} {...demoEmailHandlers} />
          <p className="text-xs text-muted-foreground">증표: <code className="font-mono">{token ?? "없음"}</code></p>
        </div>
      </Preview>

      <H2>Turn it on</H2>
      <CodeBlock title="meerkit.config.ts" code={`export default defineMeerkitConfig({\n  signup: {\n    emailVerification: true, // 기본 false\n  },\n});`} />
      <UL>
        <li>켜면 가입 폼의 이메일 칸이 이 컴포넌트로 바뀝니다. 끄면 기존의 단순한 이메일 입력입니다.</li>
        <li>인증을 마치지 않고 가입하면 <Ic>이메일 인증을 완료해 주세요.</Ic> 오류가 나오고 요청은 나가지 않습니다.</li>
      </UL>

      <H2>User flow</H2>
      <Tree>{`
① 이메일 입력 → [인증번호 받기]
        ↓  POST /auth/email/send-code
② 인증번호 입력칸과 남은 시간(03:00)이 나타남
        ↓  [확인]  POST /auth/email/verify-code
③ "인증 완료" 배지, 이메일 칸이 잠김  (바꾸려면 [변경])
        ↓
④ 나머지 항목 입력 후 가입 → 요청에 email_verification_token 포함
`}</Tree>
      <DocTable
        head={["상황", "화면"]}
        rows={[
          ["이메일 형식 오류", "이메일 형식이 올바르지 않습니다."],
          ["인증번호 발송 후", "버튼이 \"재전송 30s\"로 바뀌며 30초 동안 잠깁니다 (연속 발송 방지)."],
          ["남은 시간", "03:00부터 줄어들고, 0이 되면 \"인증번호가 만료되었습니다. 다시 받아 주세요.\""],
          ["번호가 6자리가 아님", "인증번호 6자리를 입력해 주세요."],
          ["번호가 틀림", "서버가 준 메시지를 표시합니다."],
          ["인증 성공", "\"인증 완료\" 배지와 함께 이메일 칸이 읽기 전용으로 잠깁니다."],
          ["이메일을 고치려 함", "[변경]을 누르면 인증이 풀리고 처음부터 다시 합니다."],
          ["발송 후 이메일 수정", "인증번호는 보낸 이메일에만 유효하므로 처음 단계로 돌아갑니다."],
        ]}
      />

      <H2>API</H2>
      <CodeBlock title="POST /auth/email/send-code" code={`// request\n{ "email": "user@example.com" }\n\n// response 204 | 429 { "detail": "잠시 후 다시 시도해 주세요." }`} />
      <CodeBlock title="POST /auth/email/verify-code" code={`// request\n{ "email": "user@example.com", "code": "123456" }\n\n// response 200\n{ "token": "서버가 발급한 인증 증표" }\n// 400 { "detail": "인증번호가 올바르지 않거나 만료되었습니다." }`} />
      <CodeBlock title="POST /auth/signup" code={`{\n  "user_id": "newbie",\n  "email": "user@example.com",\n  "email_verification_token": "서버가 발급한 인증 증표",\n  ...\n}`} />

      <H2>Server rules (planned)</H2>
      <UL>
        <li><strong>증표 검증:</strong> 가입 때 받은 <Ic>email_verification_token</Ic>이 <strong>그 이메일에 대해 발급된 유효한 증표</strong>인지 서버가 반드시 확인합니다. 화면의 &quot;인증 완료&quot;는 믿으면 안 됩니다.</li>
        <li><strong>인증번호:</strong> 6자리 숫자, 짧은 만료(예: 3분), 해시로 저장, 한 번 쓰면 폐기합니다.</li>
        <li><strong>횟수 제한:</strong> 같은 이메일·IP의 발송과 확인 시도를 제한해 메일 폭탄과 무차별 대입을 막습니다. 화면의 재전송 대기는 안내용입니다.</li>
        <li><strong>중복:</strong> 이미 가입된 이메일은 발송 단계에서 거절하거나, 가입 여부를 숨기려면 동일한 응답을 줍니다 (서비스 정책).</li>
        <li>가입 후에는 <Ic>users.email_verified_at</Ic>에 인증 시각을 기록합니다.</li>
      </UL>
      <Callout tone="warn">메일을 실제로 보내는 부분은 서비스가 준비해야 합니다. 로컬에서는 메일 캐처를 docker-compose에 두고 인증번호를 확인하는 방식을 권장합니다.</Callout>

      <H2>Customize</H2>
      <PropsTable
        rows={[
          ["value / onChange", "string / (email) => void", "이메일 값.", true],
          ["verified / onVerifiedChange", "boolean / (token | null) => void", "인증 여부와 증표. 성공하면 token, 풀면 null.", true],
          ["sendCode", "(email) => Promise<unknown>", "인증번호 발송. 실패하면 throw 하세요.", true],
          ["verifyCode", "(email, code) => Promise<string>", "번호 확인. 성공하면 증표 문자열을 돌려주고, 틀리면 throw 하세요.", true],
          ["expiresInSeconds", "number", "인증번호 유효 시간. 기본 180초."],
          ["resendAfterSeconds", "number", "재전송 대기 시간. 기본 30초."],
        ]}
      />
      <UL>
        <li>메시지 문구는 <Ic>EmailVerificationField.tsx</Ic>에서 바꿉니다.</li>
        <li>인증번호 자릿수(6자리)를 바꾸려면 같은 파일의 검사식과 <Ic>maxLength</Ic>를 함께 고치세요.</li>
        <li>링크 방식 인증(메일의 링크를 누르는 방식)은 가입 후 단계가 필요해서 이 컴포넌트가 아닌 별도 화면으로 만들어야 합니다.</li>
      </UL>
      <H2>Accessibility</H2>
      <UL>
        <li>인증번호 입력은 <Ic>autoComplete=&quot;one-time-code&quot;</Ic>와 숫자 키패드(<Ic>inputMode=&quot;numeric&quot;</Ic>)를 사용합니다. 모바일에서 문자로 온 번호를 바로 채울 수 있습니다.</li>
        <li>오류는 <Ic>role=&quot;alert&quot;</Ic>, 안내는 <Ic>role=&quot;status&quot;</Ic>로 읽힙니다.</li>
      </UL>
    </>
  );
}

/* ─────────────────────────── File Dropzone ─────────────────────────── */

export function FileDropzoneDoc() {
  const [files, setFiles] = useState<File[]>([]);
  const [image, setImage] = useState<File[]>([]);
  return (
    <>
      <P>
        파일을 <strong>끌어다 놓거나 눌러서 선택</strong>하는 첨부파일 영역입니다. 고른 파일을 목록으로 보여 주고(이미지는 미리보기), 형식·크기·개수를 검사하고, 개별 삭제를 지원합니다.
        <strong> 서버로 올리는 일은 하지 않고</strong>, 고른 파일 목록만 부모에게 알려 줍니다.
      </P>

      <H2>Preview</H2>
      <P>아무 파일이나 끌어다 놓아 보세요. (허용: 이미지와 PDF, 파일당 5MB, 최대 4개)</P>
      <Preview code={`const [files, setFiles] = useState<File[]>([]);\n\n<FileDropzone\n  value={files}\n  onChange={setFiles}\n  accept="image/*,.pdf"\n  maxSizeMB={5}\n  maxFiles={4}\n/>`}>
        <FileDropzone value={files} onChange={setFiles} accept="image/*,.pdf" maxSizeMB={5} maxFiles={4} />
      </Preview>

      <H2>What users can do</H2>
      <UL>
        <li><strong>끌어다 놓기:</strong> 영역 위로 파일을 끌면 테두리가 파랗게 바뀌고 &quot;여기에 놓으세요&quot;가 나옵니다.</li>
        <li><strong>눌러서 선택:</strong> 영역을 누르거나 키보드로 <Ic>Enter</Ic>/<Ic>Space</Ic>를 누르면 파일 선택 창이 열립니다.</li>
        <li><strong>목록 확인:</strong> 파일 이름과 크기가 보이고, 이미지는 작은 미리보기가 함께 나옵니다.</li>
        <li><strong>삭제:</strong> 각 파일의 ✕로 하나씩 뺍니다.</li>
      </UL>

      <H2>Validation</H2>
      <P>조건에 맞지 않는 파일은 목록에 들어가지 않고, 이유가 빨간 글씨로 나옵니다. 맞는 파일은 그대로 추가됩니다.</P>
      <DocTable
        head={["조건", "메시지"]}
        rows={[
          ["형식이 accept와 다름", "파일이름: 허용되지 않는 형식입니다."],
          ["maxSizeMB 초과", "파일이름: 5MB를 넘습니다."],
          ["maxFiles 초과", "파일은 최대 4개까지 올릴 수 있습니다."],
        ]}
      />
      <Callout tone="warn">
        <strong>브라우저의 검사는 편의일 뿐입니다.</strong> 파일 이름이나 형식은 조작할 수 있으므로, 서버가 파일의 실제 내용(형식), 크기, 개수를 다시 검사하고 안전한 이름으로 저장해야 합니다.
      </Callout>

      <H2>Single file (image)</H2>
      <P><Ic>multiple=&#123;false&#125;</Ic>이면 파일을 하나만 받고, 새 파일을 고르면 기존 파일이 교체됩니다. 프로필 사진 같은 곳에 알맞습니다.</P>
      <Preview code={`<FileDropzone\n  value={image}\n  onChange={setImage}\n  multiple={false}\n  accept="image/*"\n  maxSizeMB={2}\n  label="프로필 이미지를 끌어다 놓으세요"\n/>`}>
        <FileDropzone value={image} onChange={setImage} multiple={false} accept="image/*" maxSizeMB={2} label="프로필 이미지를 끌어다 놓으세요" />
      </Preview>

      <H2>Upload to your server</H2>
      <P>올리는 부분은 서비스가 만듭니다. 킷의 <Ic>api</Ic> 클라이언트를 쓰면 로그인 토큰이 자동으로 붙습니다.</P>
      <CodeBlock title="tsx" code={`import { api } from "@/meerkit";\n\nasync function upload(files: File[]) {\n  const form = new FormData();\n  files.forEach((f) => form.append("files", f));\n  await api.post("/uploads", form); // Content-Type은 브라우저가 알아서 설정\n}`} />
      <UL>
        <li>올린 뒤 서버가 돌려준 주소를 <Ic>User.avatar_url</Ic> 같은 필드에 저장하면 <Ic>UserAvatar</Ic>가 바로 보여 줍니다.</li>
        <li>큰 파일은 진행률 표시와 업로드 취소를 서비스에서 추가하세요.</li>
        <li>서버는 저장 전에 형식·크기 검사, 파일 이름 정리, (필요하면) 바이러스 검사를 합니다.</li>
      </UL>

      <H2>Accept rules</H2>
      <DocTable
        head={["값", "뜻"]}
        rows={[
          [<Ic key="1">image/*</Ic>, "모든 이미지"],
          [<Ic key="2">image/png</Ic>, "PNG만"],
          [<Ic key="3">.pdf</Ic>, "확장자가 .pdf인 파일"],
          [<Ic key="4">image/*,.pdf</Ic>, "쉼표로 여러 규칙을 함께 허용"],
        ]}
      />

      <H2>Props</H2>
      <PropsTable
        rows={[
          ["value", "File[]", "현재 고른 파일 목록.", true],
          ["onChange", "(files: File[]) => void", "파일이 추가·삭제될 때 새 목록을 전달합니다.", true],
          ["accept", "string", "허용 형식. input의 accept와 같은 문법."],
          ["multiple", "boolean", "false면 한 개만 받고 교체합니다. 기본 true."],
          ["maxFiles", "number", "multiple일 때 최대 개수. 기본 5."],
          ["maxSizeMB", "number", "파일 하나의 최대 크기(MB). 기본 10."],
          ["label", "string", "영역 안의 안내 문구."],
          ["hint", "string", "작은 보조 문구. 없으면 형식·크기·개수를 자동으로 보여 줍니다."],
          ["disabled", "boolean", "잠금."],
        ]}
      />
      <H2>Accessibility</H2>
      <UL>
        <li>영역은 <Ic>role=&quot;button&quot;</Ic>이며 <Ic>Tab</Ic>으로 포커스가 가고 <Ic>Enter</Ic>/<Ic>Space</Ic>로 열립니다. 마우스가 없어도 쓸 수 있습니다.</li>
        <li>삭제 버튼에는 <Ic>aria-label=&quot;파일이름 삭제&quot;</Ic>가 있고, 오류는 <Ic>role=&quot;alert&quot;</Ic>로 읽힙니다.</li>
        <li>같은 파일을 지웠다가 다시 고를 수 있습니다.</li>
      </UL>
      <Badge variant="secondary">Tip</Badge>
      <P>첨부가 필요한 폼(문의, 게시글 등)에서는 이 컴포넌트를 폼 안에 넣고, 제출할 때 <Ic>files</Ic>를 <Ic>FormData</Ic>에 담아 보내면 됩니다.</P>
    </>
  );
}
