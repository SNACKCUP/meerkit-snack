"use client";

import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { AiPromptInput, type AiAgent } from "../../ai/AiPromptInput";
import { ApiKeyInput } from "../../ai/ApiKeyInput";
import { ThinkingIndicator } from "../../ai/ThinkingIndicator";
import { ORB_STATES, ThinkingOrb, type OrbState } from "../../ai/ThinkingOrb";
import { Callout, CodeBlock, DocLinks, DocTable, H2, H3, Ic, links, P, Preview, PreviewWide, PropsTable, UL } from "../ui";

const agents: AiAgent[] = [
  { id: "auto", label: "Agent (auto)", description: "질문에 맞는 방식을 자동으로 고릅니다" },
  { id: "fast", label: "빠른 답변", description: "짧고 빠르게 답합니다" },
  { id: "deep", label: "깊은 분석", description: "시간이 걸려도 자세히 살펴봅니다" },
];

interface Message {
  role: "user" | "ai";
  text: string;
}

/* ─────────────────────────── AI Prompt Input ─────────────────────────── */

function ChatDemo() {
  const [messages, setMessages] = useState<Message[]>([{ role: "ai", text: "안녕하세요! 무엇을 도와드릴까요? 아래 입력창에 질문을 남겨 보세요." }]);
  const [pending, setPending] = useState(false);
  const [agent, setAgent] = useState("auto");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function ask(text: string, files: File[]) {
    const note = files.length > 0 ? ` (첨부 ${files.length}개)` : "";
    setMessages((m) => [...m, { role: "user", text: text + note }]);
    setPending(true);
    timer.current = setTimeout(() => {
      setMessages((m) => [...m, { role: "ai", text: `"${text}"에 대한 데모 답변입니다. 실제 서비스에서는 여기에 서버가 돌려준 답변이 나옵니다.` }]);
      setPending(false);
    }, 3200);
  }

  function stop() {
    if (timer.current) clearTimeout(timer.current);
    setPending(false);
    setMessages((m) => [...m, { role: "ai", text: "응답을 중지했습니다." }]);
  }

  return (
    <div className="mx-auto grid max-w-xl gap-4 p-2 pb-8">
      <div className="grid max-h-64 gap-2 overflow-y-auto px-1 mk-scroll">
        {messages.map((m, i) => (
          <p
            key={i}
            className={
              m.role === "user"
                ? "mk-swap ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground"
                : "mk-swap max-w-[90%] rounded-2xl rounded-bl-md border bg-card px-3.5 py-2 text-sm"
            }
          >
            {m.text}
          </p>
        ))}
        {pending && <div className="mk-swap px-1 py-1"><ThinkingIndicator /></div>}
      </div>
      <AiPromptInput onSubmit={ask} pending={pending} onStop={stop} agents={agents} agent={agent} onAgentChange={setAgent} />
    </div>
  );
}

export function AiPromptInputDoc() {
  const [agent, setAgent] = useState("auto");
  return (
    <>
      <DocLinks items={[links.component("textarea", "Textarea"), links.component("dropdown-menu", "Dropdown Menu"), links.component("button", "Button")]} />
      <Callout>
        <strong>UI만 제공합니다.</strong> AI 호출과 응답 생성은 들어 있지 않습니다. 입력한 내용은 <Ic>onSubmit</Ic>으로 넘겨 줄 뿐이니, 실제 AI 연결(요청 보내기, 응답 받기·스트리밍)은 서비스에서 구현해 주세요. 미리보기의 응답 대기는 화면을 보여 주기 위한 데모입니다. 서버의 <Ic>/api/llm/chat</Ic>까지 이어 둔 예는 <Ic>API Key Input</Ic> 문서의 <Ic>LlmPlayground</Ic>를 참고하세요.
      </Callout>

      <P>
        <strong>AI에게 질문하거나 코멘트를 남기는 입력 폼</strong>입니다. 여러 줄 입력, 파일 첨부, 에이전트(모델) 선택, 보내기와 응답 중지를 한 덩어리로 묶었고,
        입력창에 포커스가 있거나 응답을 기다리는 동안 아래쪽에 부드러운 컬러 글로우가 켜집니다. 서버 호출은 하지 않고 입력한 내용만 <Ic>onSubmit</Ic>으로 넘깁니다.
      </P>

      <H2>Preview</H2>
      <P>질문을 입력하고 <Ic>Enter</Ic>를 눌러 보세요. 3초 동안 &quot;생각 중&quot; 표시와 글로우가 나오고, 그 사이 중지 버튼을 누를 수 있습니다.</P>
      <PreviewWide code={`<AiPromptInput\n  onSubmit={(message, files) => ask(message, files)}\n  pending={isPending}\n  onStop={stop}\n  agents={agents}\n  agent={agent}\n  onAgentChange={setAgent}\n/>`}>
        <ChatDemo />
      </PreviewWide>

      <H2>What users can do</H2>
      <DocTable
        head={["동작", "방법"]}
        rows={[
          ["질문 입력", "입력창에 글을 쓰면 줄이 늘어납니다(최대 약 8줄까지, 그 이상은 안에서 스크롤)."],
          ["보내기", "Enter 또는 ↑ 버튼. 줄바꿈은 Shift + Enter."],
          ["파일 첨부", "클립 버튼으로 고르거나 입력창에 파일을 끌어다 놓습니다. 첨부한 파일은 입력창 위에 칩으로 나타나고 ✕로 뺄 수 있습니다."],
          ["에이전트 선택", "알약 모양 버튼을 눌러 목록에서 고릅니다. 각 항목에 설명이 함께 나옵니다."],
          ["응답 중지", "응답을 기다리는 동안 ↑ 버튼이 ■ 중지 버튼으로 바뀝니다."],
          ["글자 수 확인", "최대 글자 수의 80%를 넘으면 오른쪽에 \"1650/2000\"이 나타납니다."],
        ]}
      />

      <H2>Keyboard</H2>
      <UL>
        <li><Ic>Enter</Ic>: 보내기. 한글을 입력하는 중(글자 조합 중)에는 글자 확정이므로 보내지 않습니다.</li>
        <li><Ic>Shift + Enter</Ic>: 줄바꿈.</li>
        <li><Ic>Tab</Ic>: 첨부 버튼 → 에이전트 선택 → 보내기 순서로 이동합니다.</li>
      </UL>

      <H2>Attachments</H2>
      <P>첨부는 선택 기능입니다. 형식, 크기, 개수를 정해 둘 수 있고, 조건에 맞지 않는 파일은 담기지 않고 이유가 빨간 글씨로 나옵니다.</P>
      <Preview code={`<AiPromptInput\n  onSubmit={ask}\n  accept="image/*,.pdf"\n  maxSizeMB={5}\n  maxFiles={3}\n/>`}>
        <AiPromptInput onSubmit={() => {}} accept="image/*,.pdf" maxSizeMB={5} maxFiles={3} placeholder="이미지나 PDF를 첨부해 보세요" glow={false} />
      </Preview>
      <UL>
        <li>첨부를 쓰지 않으면 <Ic>{"attachments={false}"}</Ic>로 버튼을 숨깁니다.</li>
        <li>입력창 자체에 파일을 끌어다 놓을 수 있습니다. 끌어다 놓는 큰 첨부 영역이 따로 필요하다면 File Dropzone을 쓰세요.</li>
        <li><strong>브라우저의 검사는 편의일 뿐입니다.</strong> 서버가 형식·크기·내용을 다시 검사해야 합니다.</li>
      </UL>

      <H2>Agent select</H2>
      <P>에이전트(또는 모델)가 여러 개일 때 <Ic>agents</Ic>를 주면 선택 버튼이 나타납니다. 선택은 부모가 들고 있습니다(<Ic>agent</Ic>, <Ic>onAgentChange</Ic>).</P>
      <Preview code={`const agents = [\n  { id: "auto", label: "Agent (auto)", description: "질문에 맞는 방식을 자동으로 고릅니다" },\n  { id: "fast", label: "빠른 답변" },\n];\n\n<AiPromptInput agents={agents} agent={agent} onAgentChange={setAgent} onSubmit={ask} />`}>
        <AiPromptInput onSubmit={() => {}} agents={agents} agent={agent} onAgentChange={setAgent} attachments={false} placeholder="에이전트를 골라 보세요" glow={false} />
      </Preview>

      <H2>Pending &amp; stop</H2>
      <UL>
        <li><Ic>pending</Ic>이 true이면 보내기가 잠기고, 아래 글로우가 켜집니다.</li>
        <li><Ic>onStop</Ic>을 주면 보내기 버튼이 <strong>중지 버튼</strong>으로 바뀝니다. 누르면 요청을 취소하는 코드를 호출하세요(예: <Ic>AbortController.abort()</Ic>).</li>
        <li>응답을 기다리는 동안 대화 영역에는 Thinking Indicator를 함께 보여 주는 것을 권장합니다.</li>
      </UL>

      <H2>Glow</H2>
      <P>
        입력창 아래의 색 번짐은 <strong>포커스가 있을 때와 응답을 기다릴 때만</strong> 은은하게 켜지고, 7초 주기로 천천히 흘러갑니다. 색은 포인트 블루, 라일락, 피치, 민트를 섞었습니다.
        끄려면 <Ic>{"glow={false}"}</Ic>입니다. <Ic>meerkit.config.ts</Ic>의 <Ic>motion: false</Ic>이거나 OS에서 &quot;동작 줄이기&quot;를 켰다면 움직임은 멈춥니다.
      </P>

      <H2>Connect to your server</H2>
      <P>입력 폼은 서버를 모릅니다. 보낸 글을 받아 서버에 요청하고, 응답을 화면에 이어 붙이는 일은 서비스가 합니다. 스트리밍 응답을 받는 예시입니다.</P>
      <CodeBlock title="tsx" code={`const controller = useRef<AbortController | null>(null);\n\nasync function ask(message: string, files: File[]) {\n  const form = new FormData();\n  form.append("message", message);\n  files.forEach((f) => form.append("files", f));\n\n  controller.current = new AbortController();\n  setPending(true);\n  const res = await fetch("/api/chat", {\n    method: "POST",\n    body: form,\n    headers: { Authorization: \`Bearer \${useAuthStore.getState().accessToken}\` },\n    signal: controller.current.signal,\n  });\n  const reader = res.body!.getReader(); // 답이 오는 대로 읽어 화면에 이어 붙인다\n  // ...\n  setPending(false);\n}\n\n<AiPromptInput onSubmit={ask} pending={pending} onStop={() => controller.current?.abort()} />`} />
      <Callout tone="warn">AI 호출 키와 모델 설정은 <strong>서버에만</strong> 두세요. 브라우저에서 직접 AI 서비스를 호출하면 키가 노출됩니다. 사용자가 보낸 파일·글은 서버에서 검사하고 한도를 두어야 합니다.</Callout>

      <H2>Props</H2>
      <PropsTable
        rows={[
          ["onSubmit", "(message: string, files: File[]) => void", "보내기를 누르면 글(앞뒤 공백 제거)과 첨부파일을 전달합니다. 호출 뒤 입력창이 비워집니다.", true],
          ["pending", "boolean", "응답을 기다리는 중. 보내기를 잠그고 글로우를 켭니다."],
          ["onStop", "() => void", "주면 pending 중에 중지 버튼이 나타납니다."],
          ["placeholder", "string", "안내 문구. 기본 \"무엇이든 물어보세요\"."],
          ["agents", "{ id, label, description? }[]", "고를 수 있는 에이전트. 없으면 선택 버튼이 없습니다."],
          ["agent / onAgentChange", "string / (id) => void", "선택된 에이전트 id와 바뀔 때의 콜백."],
          ["maxLength", "number", "최대 글자 수. 기본 2000."],
          ["attachments", "boolean", "첨부 버튼 표시. 기본 true."],
          ["accept / maxFiles / maxSizeMB", "string / number / number", "첨부 형식, 최대 개수(기본 4), 파일당 최대 크기(기본 10MB)."],
          ["minFiles", "number", "보내려면 첨부해야 하는 최소 파일 수. 못 채우면 보내기가 잠깁니다. 기본 0."],
          ["requireText", "boolean", "false면 글 없이 파일만으로도 보낼 수 있습니다. 기본 true."],
          ["submitLabel", "string", "보내기 버튼에 화살표 대신 보여 줄 글자. 예: \"분류 시작\"."],
          ["glow", "boolean", "컬러 글로우. 기본 true."],
          ["disabled / autoFocus / className", "boolean / boolean / string", "잠금, 자동 포커스, 추가 클래스."],
        ]}
      />

      <H2>Accessibility</H2>
      <UL>
        <li>입력창에 <Ic>aria-label=&quot;AI에게 보낼 메시지&quot;</Ic>, 아이콘 버튼에는 <Ic>파일 첨부</Ic>, <Ic>보내기</Ic>, <Ic>응답 중지</Ic>, <Ic>에이전트 선택</Ic> 이름이 있습니다.</li>
        <li>글로우는 장식이라 스크린리더에서 숨겨지고, 첨부 오류는 <Ic>role=&quot;alert&quot;</Ic>로 읽힙니다.</li>
        <li>에이전트 목록은 Radix Dropdown Menu라 방향키, <Ic>Esc</Ic>가 동작합니다.</li>
      </UL>
    </>
  );
}

/* ─────────────────────────── Thinking Indicator ─────────────────────────── */

export function ThinkingIndicatorDoc() {
  const [variant, setVariant] = useState<"orb" | "dots" | "shimmer">("orb");
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const [orbState, setOrbState] = useState<OrbState>("working");

  return (
    <>
      <Callout>
        <strong>UI만 제공합니다.</strong> AI 호출과 응답 생성은 들어 있지 않습니다. 이 컴포넌트는 &quot;생각 중&quot; 표시만 그려 주며, 언제 보여 주고 숨길지(요청 시작·응답 도착)는 서비스에서 연결해 주세요. 미리보기의 상태 변화는 데모입니다.
      </Callout>

      <P>
        AI가 답을 준비하는 동안 보여 주는 <strong>&quot;생각 중&quot; 표시</strong>입니다. <strong>점으로 이루어진 구슬(Orb)</strong>, 물결치는 점, 빛이 지나가는 글자 중에서 고를 수 있고,
        문구는 &quot;생각하는 중 → 자료를 찾는 중 → 답변을 정리하는 중&quot;처럼 <strong>돌아가며 부드럽게</strong> 바뀝니다.
      </P>

      <H2>Preview</H2>
      <P>아래 버튼으로 모양, 크기, 구슬의 상태를 바꿔 보세요.</P>
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-12 text-xs text-muted-foreground">모양</span>
          {(["orb", "dots", "shimmer"] as const).map((v) => (
            <Button key={v} size="sm" variant={variant === v ? "default" : "outline"} onClick={() => setVariant(v)}>{v}</Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-12 text-xs text-muted-foreground">크기</span>
          {(["sm", "md", "lg"] as const).map((s) => (
            <Button key={s} size="sm" variant={size === s ? "default" : "outline"} onClick={() => setSize(s)}>{s}</Button>
          ))}
        </div>
        {variant === "orb" && (
          <div className="mk-swap flex flex-wrap items-center gap-2">
            <span className="w-12 text-xs text-muted-foreground">상태</span>
            {(Object.keys(ORB_STATES) as OrbState[]).map((st) => (
              <Button key={st} size="sm" variant={orbState === st ? "default" : "outline"} onClick={() => setOrbState(st)}>{st}</Button>
            ))}
          </div>
        )}
      </div>
      <Preview code={`<ThinkingIndicator variant="${variant}" size="${size}"${variant === "orb" ? ` orbState="${orbState}"` : ""} />`}>
        <div className="flex min-h-20 items-center justify-center">
          <ThinkingIndicator variant={variant} size={size} orbState={orbState} />
        </div>
      </Preview>

      <H2>Variants</H2>
      <div className="grid gap-3 sm:grid-cols-3">
        {([
          ["orb", "구슬", "점으로 이루어진 구슬이 돌고, 문구 뒤에는 ...만 붙습니다. 가장 AI다운 표시"],
          ["dots", "점", "문구 옆에서 점 세 개가 물결칩니다. 채팅 말풍선처럼 작은 자리에"],
          ["shimmer", "반짝이는 글자", "글자 위로 빛이 지나갑니다. 아이콘 없이 문구만 쓰고 싶을 때"],
        ] as const).map(([v, name, hint]) => (
          <div key={v} className="grid gap-3 rounded-2xl border bg-card p-4 shadow-soft">
            <div className="flex min-h-12 items-center"><ThinkingIndicator variant={v} /></div>
            <div>
              <p className="text-sm font-medium">{name} <code className="font-mono text-xs text-muted-foreground">{v}</code></p>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{hint}</p>
            </div>
          </div>
        ))}
      </div>
      <Callout>구슬(<Ic>orb</Ic>)에는 물결치는 점이 함께 나오지 않습니다. 구슬이 움직임을 맡고, 문구 뒤에는 정적인 <Ic>...</Ic>만 붙습니다. 물결치는 점은 <Ic>dots</Ic> 모양에서만 쓰입니다.</Callout>

      <H2>Orb states</H2>
      <P>구슬은 <strong>9가지 상태</strong>가 있고, 상태마다 움직임이 다릅니다. AI가 지금 무엇을 하는지에 맞춰 고르세요.</P>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(Object.entries(ORB_STATES) as [OrbState, (typeof ORB_STATES)[OrbState]][]).map(([st, info]) => (
          <button
            key={st}
            type="button"
            onClick={() => { setVariant("orb"); setOrbState(st); }}
            className="grid justify-items-center gap-2 rounded-2xl border bg-card p-4 text-center shadow-soft outline-none transition-all hover:-translate-y-0.5 hover:bg-surface focus-visible:ring-[3px] focus-visible:ring-ring/30"
          >
            <ThinkingOrb state={st} size={64} className="text-foreground" />
            <span className="text-sm font-medium">{info.label} <code className="font-mono text-[11px] text-muted-foreground">{st}</code></span>
            <span className="text-xs leading-5 text-muted-foreground">{info.description}</span>
          </button>
        ))}
      </div>

      <H2>Sizes</H2>
      <DocTable
        head={["size", "구슬 크기", "이럴 때"]}
        rows={[
          [<Ic key="1">sm</Ic>, "20px", "글줄 안, 버튼 옆처럼 작은 자리"],
          [<Ic key="2">md</Ic>, "32px (기본)", "채팅 응답 자리"],
          [<Ic key="3">lg</Ic>, "64px", "빈 화면 가운데, 아바타 크기의 큰 표시"],
        ]}
      />

      <H2>Labels</H2>
      <P><Ic>labels</Ic>에 문구를 여러 개 주면 정해진 간격(기본 2.6초)으로 돌아가며 바뀌고, 하나만 주면 고정됩니다. 서비스가 하는 일에 맞게 바꾸세요. 문구 뒤의 <Ic>...</Ic>은 자동으로 붙으니 직접 쓰지 않아도 됩니다.</P>
      <Preview code={`<ThinkingIndicator\n  labels={["문서를 읽는 중", "근거를 찾는 중", "답변을 작성하는 중"]}\n  orbState="searching"\n  interval={2000}\n/>\n\n<ThinkingIndicator labels={["잠시만요"]} variant="dots" />   // 고정`}>
        <div className="grid justify-items-center gap-5 py-2">
          <ThinkingIndicator labels={["문서를 읽는 중", "근거를 찾는 중", "답변을 작성하는 중"]} orbState="searching" interval={2000} />
          <ThinkingIndicator labels={["잠시만요"]} variant="dots" />
        </div>
      </Preview>

      <H2>With the prompt input</H2>
      <P>응답을 기다리는 동안 대화 영역 끝에 놓고, 답이 오면 지웁니다. <Ic>AiPromptInput</Ic>의 <Ic>pending</Ic>과 같은 값을 쓰면 됩니다.</P>
      <CodeBlock title="tsx" code={`{messages.map((m) => <Bubble key={m.id} message={m} />)}\n{isPending && <ThinkingIndicator />}\n\n<AiPromptInput onSubmit={ask} pending={isPending} onStop={stop} />`} />

      <H2>ThinkingOrb on its own</H2>
      <P>구슬만 따로 쓸 수도 있습니다. 로딩 자리를 채우거나 AI의 아바타처럼 놓기에 알맞습니다.</P>
      <Preview code={`import { ThinkingOrb } from "@/meerkit";\n\n<ThinkingOrb state="searching" size={64} />\n<ThinkingOrb state="composing" size={20} speed={1.5} />\n<ThinkingOrb state="breathing" size={48} paused />`}>
        <div className="flex items-center justify-center gap-6">
          <ThinkingOrb state="searching" size={64} />
          <ThinkingOrb state="composing" size={32} speed={1.5} />
          <ThinkingOrb state="breathing" size={20} />
          <ThinkingOrb state="listening" size={48} paused />
        </div>
      </Preview>

      <H2>Motion</H2>
      <UL>
        <li>구슬은 점 수십~수백 개를 3D 구 위에 고르게 놓고 상태별로 회전·숨쉬기·비틀림·물결·떨림을 줍니다. 앞쪽 점은 크고 진하게, 뒤쪽 점은 작고 흐리게 그려 입체감이 납니다.</li>
        <li>점 색은 글자색을 따라가서, 구슬을 놓은 곳의 <Ic>text-*</Ic> 클래스로 바꿀 수 있습니다 (예: <Ic>text-brand</Ic>).</li>
        <li>문구가 바뀔 때는 아래에서 살짝 떠오르며 나타납니다. Meerkit의 다른 움직임과 같은 곡선을 씁니다.</li>
        <li><Ic>meerkit.config.ts</Ic>의 <Ic>motion: false</Ic>이거나 OS에서 &quot;동작 줄이기&quot;를 켰다면 모든 움직임이 멈추고 멈춘 모양과 문구만 보입니다.</li>
        <li>구슬은 <Ic>canvas</Ic> 한 장에 그리고 화면에서 사라지면 정리되므로 가볍습니다.</li>
      </UL>

      <H2>Props</H2>
      <H3>ThinkingIndicator</H3>
      <PropsTable
        rows={[
          ["variant", '"orb" | "dots" | "shimmer"', "모양. 기본 orb."],
          ["orbState", "OrbState", "orb 모양일 때 구슬의 상태. 기본 working."],
          ["labels", "string[]", "표시할 문구. 둘 이상이면 돌아가며 바뀝니다. 기본은 \"생각하는 중\" 등 3개."],
          ["interval", "number", "문구가 바뀌는 간격(ms). 기본 2600."],
          ["size", '"sm" | "md" | "lg"', "크기. 기본 md."],
          ["className", "string", "추가 클래스."],
        ]}
      />
      <H3>ThinkingOrb</H3>
      <PropsTable
        rows={[
          ["state", '"working" | "searching" | "solving" | "listening" | "connecting" | "weaving" | "composing" | "breathing" | "shaping"', "구슬의 상태(움직임). 기본 working."],
          ["size", "number", "한 변의 크기(px). 기본 32. 20쯤이면 글줄 안, 64쯤이면 채팅 아바타 크기."],
          ["speed", "number", "움직임 속도 배율. 기본 1."],
          ["paused", "boolean", "true면 멈춘 모양으로 그립니다."],
          ["className", "string", "추가 클래스. 점 색은 text-* 클래스로 바꿉니다."],
        ]}
      />

      <H2>Customization</H2>
      <UL>
        <li>상태별 움직임은 <Ic>ai/ThinkingOrb.tsx</Ic>의 <Ic>ORB_STATES</Ic> 값(회전 속도, 숨쉬기, 비틀림, 물결, 떨림 등)을 바꿔 조절합니다.</li>
        <li>기본 문구는 <Ic>ai/ThinkingIndicator.tsx</Ic>의 <Ic>DEFAULT_LABELS</Ic>에서 바꿉니다.</li>
        <li>반짝이는 글자의 색은 <Ic>muted-foreground</Ic>와 <Ic>foreground</Ic> 토큰을 따릅니다.</li>
      </UL>
      <H2>Accessibility</H2>
      <UL>
        <li><Ic>role=&quot;status&quot;</Ic>와 <Ic>aria-live=&quot;polite&quot;</Ic>라서 스크린리더가 현재 문구를 읽어 줍니다. 구슬과 점은 장식이라 숨겨집니다.</li>
        <li>문구는 색과 움직임에만 의존하지 않고 글자로 상태를 알려 줍니다.</li>
      </UL>
      <Badge variant="secondary">Tip</Badge>
      <P>작업이 오래 걸리는 경우(수십 초 이상)에는 문구만 돌리지 말고, 어떤 단계인지 알려 주는 문구(예: &quot;문서 3개를 읽는 중&quot;)를 서버에서 받아 <Ic>labels</Ic>로 넘기면 체감 시간이 줄어듭니다. 단계에 맞춰 <Ic>orbState</Ic>도 함께 바꿔 보세요(찾는 중 → <Ic>searching</Ic>, 작성 중 → <Ic>composing</Ic>).</P>
    </>
  );
}

export function ApiKeyInputDoc() {
  return (
    <>
      <P>
        <strong>사용자가 자기 AI API 키를 넣는 입력 칸</strong>입니다. 로그인 전에도 화면에 보이지만, 입력하려고 하면 &quot;로그인이 필요해요&quot; 안내가 먼저 뜨고, 로그인한 뒤에만 키를 저장할 수 있습니다.
        저장한 키는 <Ic>LlmPlayground</Ic>(웰컴 페이지의 AI 테스트)가 <Ic>POST /api/llm/chat</Ic>을 부를 때 헤더로 실어 보냅니다.
      </P>
      <Callout tone="warn">
        <strong>키는 브라우저 메모리에만 둡니다.</strong> localStorage, sessionStorage, 쿠키에 저장하지 않고 새로고침하거나 로그아웃하면 지워집니다. 서버도 키를 저장하거나 로그에 남기지 않습니다.
        요청 주소(URL)와 본문에는 넣지 않고 <Ic>X-LLM-API-Key</Ic> 헤더로만 보냅니다.
      </Callout>

      <H2>Preview</H2>
      <P>로그인하지 않은 상태에서 칸을 눌러 보세요. 취소는 닫기, 확인은 로그인 창을 엽니다. 로그인한 뒤에는 키를 입력하고 저장할 수 있습니다.</P>
      <Preview code={`<ApiKeyInput />`}>
        <div className="mx-auto w-full max-w-md"><ApiKeyInput /></div>
      </Preview>

      <H2>What users can do</H2>
      <DocTable
        head={["동작", "방법"]}
        rows={[
          ["로그인 전에 입력 시도", "칸을 누르면 로그인 안내 창이 뜹니다. 취소하면 닫히고, 확인하면 로그인 창이 열립니다."],
          ["키 저장", "로그인한 뒤 키(sk-...)를 입력하고 저장을 누릅니다. 모양이 맞지 않으면 안내가 나옵니다."],
          ["키 보기·가리기", "칸 오른쪽의 눈 아이콘으로 입력한 글자를 확인합니다."],
          ["키 지우기", "저장하면 앞 3자리와 뒤 4자리만 보이고, 지우기를 누르면 사라집니다."],
        ]}
      />

      <H2>How to use</H2>
      <CodeBlock
        title="어느 화면에서든"
        code={`import { ApiKeyInput, useLlmKeyStore } from "@/meerkit";\n\n<ApiKeyInput />\n\n// 저장된 키 읽기 (메모리에서만)\nconst apiKey = useLlmKeyStore((s) => s.apiKey);`}
      />
      <PropsTable rows={[["className", "string", "바깥 요소에 붙일 클래스."]]} />

      <H2>LlmPlayground</H2>
      <P>
        <Ic>ApiKeyInput</Ic>, <Ic>AiPromptInput</Ic>, <Ic>ThinkingIndicator</Ic>을 묶어 서버의 <Ic>/api/llm/chat</Ic>까지 이어 둔 <strong>AI 테스트</strong>입니다. 웰컴 페이지에 기본으로 들어 있습니다.
        로그인 전에는 키 칸만 보이고, 로그인하면 질문 입력창이 열리며, 응답 카드 아래에 이번 응답의 토큰 수와 예상 비용, 이 탭에서의 누적 합계가 나옵니다.
      </P>
      <CodeBlock title="meerkit.config.ts" code={`ai: {\n  playground: false, // 웰컴 페이지의 AI 테스트를 숨깁니다. 기본 true\n},`} />

      <H2>사용량과 예상 비용</H2>
      <UL>
        <li>토큰 수는 AI 응답이 돌려준 값(입력·출력·합계)을 그대로 보여 줍니다. 서버에 기록하지 않고, 이 탭의 메모리에서만 합산합니다.</li>
        <li>예상 비용은 <Ic>ai/pricing.ts</Ic>의 모델별 단가(USD, 토큰 100만 개당)로 계산하는 <strong>참고용 값</strong>입니다. 공급자 요금은 바뀔 수 있으니 모델을 늘리거나 단가가 달라지면 이 파일을 고치세요.</li>
        <li>사용 기록 저장, 이용 이력, 한도는 이 기능에 들어 있지 않습니다.</li>
      </UL>

      <H2>서버와 주고받는 것</H2>
      <DocTable
        head={["구분", "내용"]}
        rows={[
          ["요청", "POST /api/llm/chat · 로그인 필요 · 헤더 X-LLM-API-Key · 본문 { message, model }"],
          ["응답", "{ reply, model, usage: { input_tokens, output_tokens, total_tokens } }"],
          ["허용 모델", "gpt-4o-mini, gpt-4o (목록에 없으면 422). 공급자는 현재 OpenAI만 열려 있습니다."],
        ]}
      />
      <H3>오류와 안내 문구</H3>
      <DocTable
        head={["code", "상태", "뜻"]}
        rows={[
          ["LLM_KEY_REQUIRED", "400", "키 헤더가 없습니다."],
          ["LLM_KEY_INVALID", "401", "키가 올바르지 않거나 사용할 수 없습니다."],
          ["LLM_QUOTA_EXCEEDED", "429", "입력한 키의 크레딧·한도를 모두 썼습니다 (공급자 사이트에서 충전·확인)."],
          ["LLM_RATE_LIMITED", "429", "짧은 시간에 요청이 많습니다. 잠시 뒤 다시 시도합니다."],
          ["LLM_INPUT_TOO_LONG", "413", "입력이 너무 깁니다."],
          ["LLM_TIMEOUT", "504", "응답이 늦어지고 있습니다."],
        ]}
      />

      <H2>백엔드에서 쓰기</H2>
      <CodeBlock
        title="backend"
        code={`from app.llm import chat_once\n\nreply = chat_once("안녕", api_key=사용자가_넣은_키, model_name="gpt-4o-mini", provider="openai")\nreply.text           # 답\nreply.usage.total_tokens  # 토큰 수`}
      />
      <P>
        다른 공급자(Anthropic 등)를 열려면 <Ic>langchain-anthropic</Ic>을 추가하고 <Ic>app/llm/client.py</Ic>의 <Ic>BYOK_PROVIDERS</Ic>에 이름을 더합니다. 키와 질문·응답 내용은 로그에 남기지 않습니다.
      </P>
      <DocLinks items={[links.component("input", "Input"), links.component("dialog", "Dialog")]} />
    </>
  );
}
