"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { CopyButton } from "../../_components/CopyButton";
import { MarkdownView } from "../../_components/MarkdownView";
import { PixelIcon, PxBadge, PxBar, PxButton, PxCard, pxButtonClass } from "../../_components/px";
import { ShareDialog } from "../../_components/ShareDialog";
import { StatusBadge } from "../../_components/StatusBadge";
import { downloadText, markdownToPlain } from "../../_lib/clipboard";
import { formatBytes, formatClock, formatDuration, formatWhen } from "../../_lib/format";
import { buildMinutesPrompt, segmentsToText, segmentsToTimed } from "../../_lib/minutesPrompt";
import { LOW_CONFIDENCE, transcriptFor } from "../../_lib/sample";
import { useMalmoa } from "../../_lib/store";

type Tab = "minutes" | "transcript";

export default function MeetingResult() {
  const { id } = useParams<{ id: string }>();
  const hydrated = useMalmoa((s) => s.hydrated);
  const meeting = useMalmoa((s) => s.meetings.find((m) => m.id === id));
  const doc = useMalmoa((s) => s.minutes[id]);
  const retry = useMalmoa((s) => s.retry);
  const generate = useMalmoa((s) => s.generateMinutes);
  const save = useMalmoa((s) => s.saveMinutes);
  const [tab, setTab] = useState<Tab>("minutes");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [sharing, setSharing] = useState(false);

  if (!hydrated) return <div className="h-[60vh]" aria-busy />;
  if (!meeting) {
    return (
      <section className="mx-auto grid max-w-xl justify-items-center gap-4 px-5 py-16 text-center">
        <h1 className="font-pixel text-3xl">회의를 찾을 수 없어요</h1>
        <p className="text-muted-foreground">없어졌거나 주소가 잘못되었을 수 있습니다.</p>
        <Link href="/malmoa/meetings" className={pxButtonClass("mint", "lg")}>회의 목록으로</Link>
      </section>
    );
  }

  const image = meeting.source === "image";
  const active = meeting.status === "QUEUED" || meeting.status === "TRANSCRIBING" || meeting.status === "SUMMARIZING";
  const segs = meeting.transcriptReady ? transcriptFor(meeting) : [];
  const baseName = meeting.fileName.replace(/\.[^.]+$/, "");

  return (
    <div className="mx-auto grid max-w-4xl gap-6 px-5 py-10">
      <div className="grid gap-2" data-rise>
        <Link href="/malmoa/meetings" className="font-pixel w-fit text-(--mk-gold) underline underline-offset-4">◀ 회의 목록</Link>
        <h1 className="font-pixel text-3xl break-all sm:text-4xl">{meeting.fileName}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <StatusBadge meeting={meeting} />
          {[formatWhen(meeting.createdAt), formatDuration(meeting.durationSec), formatBytes(meeting.sizeBytes)].filter(Boolean).join(" · ")}
        </div>
      </div>

      {active ? (
        <PxCard title="처리 중" data-rise>
          <div className="grid gap-2">
            <PxBar value={meeting.progress ?? 0} tone="sky" label="처리 진행률" />
            <p className="text-sm text-muted-foreground">{meeting.stage ?? "처리 중"} · {meeting.progress ?? 0}% — 이 화면을 벗어나도 계속됩니다.</p>
          </div>
        </PxCard>
      ) : null}

      {meeting.status === "FAILED" ? (
        <PxCard title="처리하지 못했어요" data-rise>
          <p role="alert" className="mb-3">{meeting.errorMessage ?? "처리 중 문제가 생겼습니다."}</p>
          <PxButton variant="pink" onClick={() => retry(meeting.id)}>다시 시도</PxButton>
        </PxCard>
      ) : null}

      {meeting.transcriptReady ? (
        <div data-rise className="grid gap-4">
          <div role="tablist" aria-label="결과 종류" className="flex gap-2">
            {([["minutes", "회의록"], ["transcript", image ? "읽은 글" : "변환 원문"]] as const).map(([k, label]) => (
              <button
                key={k}
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={cn("font-pixel border-2 border-(--mk-px-edge) px-4 py-2 text-lg", tab === k ? "bg-(--mk-gold) text-(--mk-ink)" : "bg-card text-foreground")}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "minutes" ? (
            doc && meeting.minutesReady ? (
              <PxCard title="AI 회의록" tone="paper" action={doc.edited ? <PxBadge tone="sky">수정됨</PxBadge> : undefined}>
                {editing ? (
                  <div className="grid gap-3">
                    <textarea value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="회의록 편집" rows={20} className="w-full border-2 border-(--mk-px-edge) bg-white p-3 font-mono text-sm outline-none focus-visible:border-(--mk-sky)" />
                    <div className="flex gap-3">
                      <PxButton onClick={() => { save(meeting.id, draft); setEditing(false); }}>저장</PxButton>
                      <PxButton variant="ghost" className="text-(--mk-ink)" onClick={() => setEditing(false)}>취소</PxButton>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <MarkdownView markdown={doc.markdown} />
                    <div className="flex flex-wrap gap-3 border-t-[3px] border-(--mk-px-edge) pt-4">
                      <PxButton variant="sky" onClick={() => { setDraft(doc.markdown); setEditing(true); }}>편집</PxButton>
                      <PxButton variant="ghost" className="text-(--mk-ink) bg-white" onClick={() => downloadText(`${baseName}_회의록.md`, doc.markdown, "text/markdown")}>MD 받기</PxButton>
                      <PxButton variant="ghost" className="text-(--mk-ink) bg-white" onClick={() => downloadText(`${baseName}_회의록.txt`, markdownToPlain(doc.markdown))}>TXT 받기</PxButton>
                      <PxButton variant="mint" onClick={() => setSharing(true)}><PixelIcon name="share" size={16} />공유</PxButton>
                      <PxButton variant="gold" disabled={active} onClick={() => { if (window.confirm("회의록을 새로 만들면 지금 내용이 바뀝니다. 계속할까요?")) generate(meeting.id, true); }}>다시 만들기</PxButton>
                    </div>
                    <p className="text-xs text-(--mk-ink)/70">{doc.model} · {formatWhen(doc.generatedAt)}에 작성{doc.edited ? " · 직접 수정함" : ""}. 원문에 없는 내용은 지어내지 않고 ‘확인 필요’로 표시합니다.</p>
                  </div>
                )}
              </PxCard>
            ) : (
              <PxCard title="AI 회의록">
                <div className="grid justify-items-start gap-3">
                  <p>원문에서 논의·결정·할 일을 8개 항목으로 정리합니다. 변환된 텍스트만 AI로 전송되며, 음성은 보내지 않습니다.</p>
                  <PxButton disabled={active} onClick={() => generate(meeting.id)}><PixelIcon name="bolt" size={18} />AI 회의록 만들기 (+30 EXP)</PxButton>
                  <p className="text-sm text-muted-foreground">지금은 화면용 목 데이터로 작성됩니다. API 없이 쓰려면 ‘변환 원문’ 탭의 “회의록 요청문과 함께 복사”를 쓰세요.</p>
                </div>
              </PxCard>
            )
          ) : (
            <div className="grid gap-4">
              <PxCard title="복사하기">
                <div className="flex flex-wrap items-start gap-4">
                  <CopyButton variant="mint" text={() => segmentsToText(segs)} hint="멘토링·기타 용도 그대로 사용">텍스트만 복사</CopyButton>
                  {!image ? <CopyButton text={() => segmentsToTimed(segs)} hint="다시 들을 위치가 필요할 때 [00:12:34] …">시간 포함 복사</CopyButton> : null}
                  <CopyButton variant="gold" text={() => buildMinutesPrompt(segs, image)} hint="ChatGPT·Claude에 붙여 회의록 만들 때">회의록 요청문과 함께 복사</CopyButton>
                </div>
              </PxCard>
              <PxCard title={image ? "사진에서 읽은 글" : "변환 원문"} action={<PxButton size="sm" variant="ghost" onClick={() => downloadText(`${baseName}_원문.txt`, image ? segmentsToText(segs) : segmentsToTimed(segs))}>TXT 받기</PxButton>}>
                <ul className="grid gap-2">
                  {segs.map((s, i) => (
                    <li key={i} className="flex flex-wrap items-baseline gap-2">
                      {!image ? <span className="font-pixel text-sm text-(--mk-sky)">[{formatClock(s.start)}]</span> : null}
                      <span>{s.text}</span>
                      {s.confidence !== undefined && s.confidence < LOW_CONFIDENCE ? <PxBadge tone="pink">확인 필요</PxBadge> : null}
                    </li>
                  ))}
                </ul>
              </PxCard>
            </div>
          )}
        </div>
      ) : null}
      {meeting.minutesReady ? <ShareDialog meetingId={meeting.id} open={sharing} onOpenChange={setSharing} /> : null}
    </div>
  );
}
