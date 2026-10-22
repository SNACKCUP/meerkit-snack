"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import { AiPromptInput } from "../../ai/AiPromptInput";
import { VoiceGlow } from "../../ai/VoiceGlow";
import { Callout, CodeBlock, DocLinks, DocTable, H2, Ic, links, P, Preview, PreviewWide, PropsTable, UL } from "../ui";

function VoiceDemo() {
  const [real, setReal] = useState(false);
  const [sent, setSent] = useState<string[]>([]);
  return (
    <div className="mx-auto grid max-w-xl gap-4 p-2 pb-10">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={real ? "outline" : "default"} onClick={() => setReal(false)}>데모 음성</Button>
        <Button size="sm" variant={real ? "default" : "outline"} onClick={() => setReal(true)}>내 마이크로 해보기</Button>
        <span className="text-xs text-muted-foreground">{real ? "브라우저가 마이크 사용 허용을 물어봅니다." : "마이크 없이 음량이 저절로 변합니다."}</span>
      </div>
      <AiPromptInput key={String(real)} voice={real ? true : { demo: true, demoText: "10분 타이머를 맞추고 화분에 물 주라고 알려 줘" }} attachments={false} onSubmit={(m) => setSent((s) => [m, ...s].slice(0, 3))} />
      {sent.map((m, i) => <p key={i} className="rounded-xl bg-muted/60 px-3 py-2 text-sm">보낸 글: {m}</p>)}
    </div>
  );
}

function LevelDemo() {
  const level = useRef(0.5);
  const [value, setValue] = useState(50);
  const [on, setOn] = useState(true);
  return (
    <div className="grid gap-4">
      <div className="relative h-28 overflow-hidden rounded-2xl border bg-surface">
        <VoiceGlow levelRef={level} active={on} className="absolute inset-x-0 bottom-0" />
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Button size="sm" variant="outline" onClick={() => setOn((v) => !v)}>{on ? "가라앉히기" : "올리기"}</Button>
        <label className="flex flex-1 items-center gap-3 text-muted-foreground">
          음량
          <input type="range" min={0} max={100} value={value} onChange={(e) => { setValue(+e.target.value); level.current = +e.target.value / 100; }} className="flex-1 accent-[var(--mk-brand)]" />
          <span className="w-8 tabular-nums">{value}</span>
        </label>
      </div>
    </div>
  );
}

export function VoiceDoc() {
  return (
    <>
      <DocLinks items={[links.component("ai-prompt-input", "AI Prompt Input"), links.component("loading", "Loading")]} />
      <Callout>
        <strong>UI만 제공합니다.</strong> 마이크 녹음과 목소리 크기에 따라 일렁이는 화면은 들어 있지만, <strong>음성을 글로 바꾸는 서버(STT)는 들어 있지 않습니다.</strong>
        기본으로는 브라우저의 음성 인식을 쓰고, 정확도가 더 필요하면 <Ic>onTranscribe</Ic>로 서비스의 음성 인식 서버를 연결해 주세요.
      </Callout>
      <P>
        메시지 입력란의 <strong>마이크 버튼</strong>을 누르면 녹음이 시작되고, 말한 내용이 <strong>입력창에 글로 들어갑니다</strong>.
        녹음하는 동안에는 입력창 아래에서 <strong>컬러 파동이 목소리 크기에 맞춰 올라오고 좌우로 일렁입니다</strong>. 조용하면 잔잔하고, 크게 말하면 높이 솟습니다.
      </P>

      <H2>Preview</H2>
      <P>마이크 버튼을 누르고, 다시 눌러 끝내 보세요. 말한 글이 입력창에 채워지면 평소처럼 보낼 수 있습니다.</P>
      <PreviewWide code={`<AiPromptInput\n  voice            // 브라우저 음성 인식 사용\n  onSubmit={(message) => ask(message)}\n/>`}>
        <VoiceDemo />
      </PreviewWide>

      <H2>How it works</H2>
      <DocTable
        head={["단계", "동작"]}
        rows={[
          ["1. 누르기", "마이크 버튼을 누르면 브라우저가 마이크 사용을 물어봅니다. 허용하면 녹음이 시작됩니다."],
          ["2. 말하기", "파동이 목소리 크기를 따라 움직이고, 말하는 내용이 입력창에 바로바로 채워집니다. 원래 쓰던 글 뒤에 이어 붙습니다."],
          ["3. 끝내기", "■를 누르면 녹음이 끝나고 글이 확정됩니다. 취소를 누르면 입력창을 녹음 전 상태로 되돌립니다."],
          ["4. 보내기", "내용을 고쳐도 되고, 그대로 보내도 됩니다. 녹음 중에는 보내기가 잠깁니다."],
        ]}
      />

      <H2>Connect your speech-to-text</H2>
      <P>
        <Ic>voice</Ic>에 <Ic>true</Ic>만 주면 브라우저 음성 인식(주로 Chrome 계열)을 씁니다. 다른 브라우저에서도 되게 하거나 더 정확하게 받아 적으려면,
        녹음한 오디오를 받아 글을 돌려주는 함수를 넘기세요. 이 경우 녹음이 끝난 뒤 한 번에 글로 바뀝니다.
      </P>
      <CodeBlock title="tsx" code={`<AiPromptInput\n  voice={{\n    lang: "ko-KR",\n    onTranscribe: async (audio: Blob) => {\n      const body = new FormData();\n      body.append("audio", audio);\n      const res = await fetch("/api/stt", { method: "POST", body }); // 서비스의 음성 인식 서버\n      return (await res.json()).text;\n    },\n  }}\n  onSubmit={ask}\n/>`} />

      <H2>Wave color</H2>
      <P>파동 색은 <Ic>meerkit.config.ts</Ic>에서 정합니다. 색(CSS 색상) 2개 이상을 왼쪽부터 순서대로 적으면 서로 섞이며 번집니다. 생략하면 파랑, 보라, 분홍, 청록입니다.</P>
      <CodeBlock title="meerkit.config.ts" code={`export default defineMeerkitConfig({\n  ai: {\n    voice: { colors: ["#60a5fa", "#a78bfa", "#f472b6", "#2dd4bf"] }, // 기본값\n  },\n});`} />
      <P>한 곳에서만 다르게 하고 싶다면 <Ic>VoiceGlow</Ic>의 <Ic>colors</Ic> prop을 쓰세요. 글자가 파동에 가려 보이지 않으면 연한 색을 고르세요.</P>

      <H2>The wave</H2>
      <P>파동만 따로 쓸 수도 있습니다. 목소리 크기(0~1)를 ref로 넘기면 매 프레임 그 값을 읽어 그립니다. 아래에서 음량을 움직여 보세요.</P>
      <Preview code={`const level = useRef(0);          // 0~1, 자주 바뀌어도 다시 그리지 않도록 ref\n\n<VoiceGlow levelRef={level} active={listening} className="absolute inset-x-0 bottom-0" />`}>
        <LevelDemo />
      </Preview>

      <H2>useVoiceRecorder</H2>
      <P>마이크 버튼과 입력창을 직접 만들고 싶다면 녹음 훅만 가져다 쓸 수 있습니다.</P>
      <CodeBlock title="tsx" code={`const { status, error, levelRef, start, stop, cancel } = useVoiceRecorder(\n  { lang: "ko-KR" },\n  (text, final) => setText(text), // 말하는 동안 계속 호출, final이 true면 최종 결과\n);\n\n// status: "idle" | "requesting" | "listening" | "transcribing" | "error"`} />

      <H2>Props</H2>
      <P><Ic>AiPromptInput</Ic>에 추가된 prop입니다.</P>
      <PropsTable
        rows={[
          ["voice", "boolean | VoiceOptions", "마이크 버튼을 보여 줍니다. true면 브라우저 음성 인식, 객체면 아래 옵션."],
          ["voice.onTranscribe", "(audio: Blob) => Promise<string>", "녹음한 오디오를 글로 바꿔 돌려주는 함수. 서비스의 STT에 연결합니다."],
          ["VoiceGlow colors", "string[]", "파동 색. 생략하면 config의 ai.voice.colors."],
          ["voice.lang", "string", '인식 언어. 기본 "ko-KR".'],
          ["voice.demo", "boolean", "마이크 없이 데모 음성으로 동작합니다. 화면 확인용."],
          ["voice.demoText", "string", "데모일 때 입력창에 채워질 문장."],
        ]}
      />

      <H2>Notes</H2>
      <UL>
        <li>마이크는 <strong>HTTPS 또는 localhost</strong>에서만 동작합니다.</li>
        <li>마이크 허용을 거절하거나 지원하지 않는 브라우저에서는 입력창 아래에 안내가 나옵니다. 글 입력은 그대로 쓸 수 있습니다.</li>
        <li>녹음을 끝내거나 화면을 떠나면 마이크와 오디오 처리를 모두 닫습니다 (브라우저의 녹음 표시가 남지 않습니다).</li>
        <li>설정의 움직임 끄기와 OS의 &quot;동작 줄이기&quot;를 지키면, 파동은 움직이지 않는 은은한 글로우로 보입니다.</li>
        <li>녹음 데이터는 이 컴포넌트가 저장하지 않습니다. <Ic>onTranscribe</Ic>로 서버에 보내는 경우 개인정보 처리 방침에 맞게 다뤄 주세요.</li>
      </UL>
    </>
  );
}
