import Link from "next/link";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { PixelIcon, PxBadge, PxCard, pxButtonClass, type PixelIconName } from "../_components/px";

const FLOW: { icon: PixelIconName; title: string; body: string }[] = [
  { icon: "mic", title: "1. 녹음 또는 업로드", body: "브라우저에서 바로 녹음하거나, 이미 녹음한 파일·화이트보드 사진을 올립니다." },
  { icon: "lock", title: "2. 자동 저장", body: "녹음은 10초마다 이 브라우저에 저장돼 중간에 꺼져도 남습니다." },
  { icon: "doc", title: "3. 음성 → 텍스트", body: "말이 시간 표시가 붙은 한국어 텍스트로 바뀝니다." },
  { icon: "bolt", title: "4. AI 회의록", body: "변환된 텍스트로 논의·결정·할 일을 8개 항목으로 정리합니다." },
  { icon: "share", title: "5. 확인·공유", body: "고치고, 복사하고, MD·TXT로 받고, 링크로 공유합니다." },
];

const PREP = [
  "Mac이나 노트북에 전원 어댑터를 연결합니다. 배터리가 떨어지면 녹음이 멈춥니다.",
  "기기를 책상 가운데, 화자들과 비슷한 거리에 둡니다. 노트북 마이크는 키보드 위쪽에 있으니 덮개를 연 채로 두세요.",
  "시스템 설정 › 사운드 › 입력에서 사용할 마이크와 입력 음량을 확인합니다.",
  "Zoom, FaceTime처럼 마이크를 쓰는 앱은 종료하고, 브라우저는 일반 창으로 엽니다.",
  "녹음한다는 사실을 참석자에게 미리 알립니다.",
];

const XP: [string, string][] = [
  ["회의 텍스트 변환 완료", "+50 (사진 글자 읽기는 +20)"],
  ["길이 보너스", "10분마다 +5"],
  ["AI 회의록 만들기", "+30 (회의마다 처음 한 번)"],
  ["회의록 공유", "+10 (회의마다 처음 한 번)"],
  ["연속 기록", "하루 연속마다 +5, 최대 +35"],
];

const FAQ: [string, string][] = [
  ["“마이크 사용이 거부되었습니다”라고 나와요", "주소창 왼쪽 자물쇠(또는 설정 아이콘)에서 마이크를 ‘허용’으로 바꾼 뒤 새로 고침하세요. 마이크는 https 또는 localhost 주소에서만 쓸 수 있습니다."],
  ["“다른 앱이 마이크를 사용 중”이라고 나와요", "Zoom, FaceTime, 다른 브라우저 탭에서 마이크를 쓰고 있지 않은지 확인하고 종료한 뒤 다시 시작하세요."],
  ["입력 막대가 거의 움직이지 않아요", "마이크가 음소거되었거나 기기가 너무 멀 수 있습니다. 시스템 입력 음량을 높이고 마이크 선택이 맞는지 확인하세요. 8초 넘게 소리가 없으면 화면에 경고가 뜹니다."],
  ["녹음이 저장되지 않는다고 나와요", "시크릿 창이거나 저장 공간이 부족하면 조각 저장이 막힙니다. 일반 창에서 다시 시도하고, 중요한 녹음은 ‘파일 저장’으로 꼭 내려받으세요."],
  ["변환이 ‘실패’로 바뀌었어요", "변환 중에 페이지를 새로 고치거나 닫으면 중단됩니다. 목록에서 ‘다시 시도’를 누르세요."],
  ["어떤 브라우저를 써야 하나요?", "최신 Chrome을 권장합니다. Safari도 녹음되지만 파일 형식(M4A)이 다릅니다."],
];

function Section({ id, title, desc, children }: { id: string; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-6" data-rise>
      <PxCard>
        <h2 id={`${id}-h`} className="font-pixel text-2xl">{title}</h2>
        {desc ? <p className="mt-1 text-muted-foreground">{desc}</p> : null}
        <div className="mt-4">{children}</div>
      </PxCard>
    </section>
  );
}

export default function GuideView() {
  return (
    <div className="mx-auto grid max-w-4xl gap-6 px-5 py-10">
      <div data-rise>
        <h1 className="font-pixel text-4xl text-(--mk-gold)">사용 안내</h1>
        <p className="mt-1 text-muted-foreground">회의를 말로 녹음하고, 글로 모으고, 회의록으로 정리하는 방법입니다.</p>
        <nav aria-label="안내 목차" className="mt-4 flex flex-wrap gap-2">
          {[["flow", "전체 흐름"], ["prep", "녹음 전 준비"], ["record", "직접 녹음"], ["upload", "파일 업로드"], ["recover", "녹음이 끊겼을 때"], ["level", "경험치와 레벨"], ["privacy", "개인정보"], ["faq", "문제 해결"]].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="font-pixel border-2 border-border bg-card px-3 py-1 hover:text-(--mk-gold)">{label}</a>
          ))}
        </nav>
      </div>

      <div role="note" className="border-2 border-(--mk-sky) bg-card p-4" data-rise>
        <PxBadge tone="sky">안내</PxBadge>
        <p className="mt-2">지금은 화면을 먼저 만든 단계라 음성 변환과 AI 회의록이 예시 내용으로 만들어집니다. 녹음, 업로드, 복사, 공유, 경험치 흐름은 실제처럼 동작해 볼 수 있습니다.</p>
      </div>

      <Section id="flow" title="전체 흐름" desc="녹음부터 회의록까지 다섯 단계로 진행됩니다.">
        <ol className="grid gap-3 sm:grid-cols-2">
          {FLOW.map((f) => (
            <li key={f.title} className="flex gap-3 border-2 border-border p-3">
              <PixelIcon name={f.icon} size={28} className="mt-1 shrink-0 text-(--mk-mint)" />
              <div><h3 className="font-pixel text-lg">{f.title}</h3><p className="text-sm text-muted-foreground">{f.body}</p></div>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="prep" title="녹음 전 준비" desc="2시간 회의도 끊김 없이 녹음하기 위한 점검 목록입니다.">
        <ul className="grid gap-2">
          {PREP.map((t) => (
            <li key={t} className="flex gap-2"><PixelIcon name="check" size={18} className="mt-1 shrink-0 text-(--mk-mint)" />{t}</li>
          ))}
        </ul>
      </Section>

      <Section id="record" title="직접 녹음하기" desc="퀘스트 보드의 ‘직접 녹음’ 카드를 사용합니다.">
        <ol className="grid list-decimal gap-2 pl-6">
          <li>마이크를 고르고 ‘회의실 모드’를 확인한 뒤 <b>녹음 시작</b>을 누릅니다. 처음에는 브라우저가 마이크 권한을 묻습니다.</li>
          <li>녹음 중에는 시간과 입력 막대가 움직입니다. 쉬는 시간에는 <b>일시정지</b>, 이어서 하려면 <b>재개</b>를 누릅니다.</li>
          <li>다른 화면(이전 회의 결과 등)으로 이동해도 녹음은 계속되며, 화면 오른쪽 아래에 녹음 막대가 나타납니다.</li>
          <li><b>녹음 종료</b>는 퀘스트 보드에서만 할 수 있습니다. 끝난 뒤 들어 보고 <b>텍스트로 변환</b>, <b>파일 저장</b>, <b>다시 녹음</b> 중에서 고릅니다.</li>
        </ol>
        <p className="mt-3 border-l-[6px] border-(--mk-gold) bg-muted p-3 text-sm"><b>회의실 모드</b>는 통화용 에코 제거·잡음 억제를 꺼서 멀리 있는 사람의 목소리가 깎이지 않게 합니다. 여러 사람이 한 방에 앉은 회의라면 켜 두세요.</p>
      </Section>

      <Section id="upload" title="파일 업로드" desc="휴대폰이나 다른 기기로 이미 녹음한 파일, 화이트보드 사진도 쓸 수 있습니다.">
        <ul className="grid gap-2 sm:grid-cols-3">
          {[["음성 형식", "MP3 · WAV · M4A · WEBM · MP4 · OGG"], ["사진 형식", "JPG · PNG · HEIC · WEBP"], ["최대 크기", "파일 하나당 500MB"]].map(([k, v]) => (
            <li key={k} className="border-2 border-border p-3"><p className="text-sm text-muted-foreground">{k}</p><p className="font-pixel text-lg">{v}</p></li>
          ))}
        </ul>
        <p className="mt-3">파일을 업로드 영역으로 끌어다 놓거나 <b>파일 선택</b>을 누른 뒤 <b>업로드하고 텍스트로 변환</b>을 누릅니다. 휴대폰에서 <b>화이트보드 사진 찍기 · 올리기</b>를 누르면 카메라가 바로 열립니다. 인식 확신이 낮은 줄에는 ‘확인 필요’가 표시됩니다.</p>
      </Section>

      <Section id="recover" title="녹음이 끊겼을 때" desc="브라우저나 컴퓨터가 갑자기 꺼져도 녹음은 대부분 남아 있습니다.">
        <ol className="grid list-decimal gap-2 pl-6">
          <li>녹음은 10초마다 이 브라우저에 저장되므로, 갑자기 꺼지면 마지막 10초 정도만 사라집니다.</li>
          <li>퀘스트 보드를 다시 열면 ‘이전 녹음이 중간에 종료되었습니다’ 안내가 뜹니다. <b>이전 녹음 불러오기</b>를 누르면 저장된 부분까지 이어 붙여 들어 볼 수 있습니다.</li>
          <li>회의가 계속되는 중이라면 불러온 녹음은 <b>파일 저장</b>으로 내려받아 두고, 새로 녹음을 시작하세요.</li>
        </ol>
        <p className="mt-3 border-l-[6px] border-(--mk-pink) bg-muted p-3 text-sm">브라우저의 ‘인터넷 사용 기록 / 사이트 데이터 삭제’를 하면 보관 중인 녹음도 함께 지워집니다. 중요한 녹음은 꼭 파일로 저장해 두세요.</p>
      </Section>

      <Section id="level" title="경험치와 레벨" desc="회의를 기록할수록 경험치가 쌓이고 미어캣이 진화합니다. 레벨은 10까지 있습니다.">
        <dl className="grid gap-2">
          {XP.map(([k, v]) => (
            <div key={k} className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-border pb-2"><dt>{k}</dt><dd><PxBadge tone="gold">{v}</PxBadge></dd></div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-muted-foreground">레벨 n에서 다음 레벨까지 필요한 경험치는 n × 100입니다. 내 레벨과 업적은 <Link href="/malmoa/profile" className="underline underline-offset-4">내 캐릭터</Link>에서 볼 수 있습니다.</p>
      </Section>

      <Section id="privacy" title="개인정보" desc="녹음 파일이 어디에 보관되고 무엇이 밖으로 나가는지 정리했습니다.">
        <ul className="grid gap-3 sm:grid-cols-3">
          {[
            ["녹음 조각은 이 브라우저에", "녹음 중 10초마다 저장되는 조각은 사용 중인 브라우저에만 있습니다."],
            ["음성은 보내지 않습니다", "AI 회의록은 변환된 텍스트만 사용하도록 설계되었고, 음성 파일은 AI로 보내지 않습니다."],
            ["공유 링크는 읽기 전용", "링크를 아는 사람은 회의록을 볼 수만 있고, 7일 뒤 자동으로 닫힙니다. 언제든 끌 수 있습니다."],
          ].map(([k, v]) => (
            <li key={k} className="border-2 border-border p-3"><h3 className="font-pixel text-lg">{k}</h3><p className="mt-1 text-sm text-muted-foreground">{v}</p></li>
          ))}
        </ul>
      </Section>

      <Section id="faq" title="문제 해결">
        <Accordion type="single" collapsible className="grid gap-2">
          {FAQ.map(([q, a], i) => (
            <AccordionItem key={q} value={`q${i}`} className="border-2 border-border bg-card">
              <AccordionTrigger className="text-base">{q}</AccordionTrigger>
              <AccordionContent><p className="px-4 pb-4 text-muted-foreground">{a}</p></AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-border bg-card p-4" data-rise>
        <p className="font-pixel text-xl">준비가 되었다면 퀘스트 보드에서 시작하세요!</p>
        <Link href="/malmoa/home" className={pxButtonClass("mint", "md")}><PixelIcon name="mic" size={18} />녹음하러 가기</Link>
      </div>
    </div>
  );
}
