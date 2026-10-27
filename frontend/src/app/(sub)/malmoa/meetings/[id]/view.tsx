"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type ReactNode } from "react";

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

// 창 안의 구획: 제목이 붙은 테두리 상자 (paper면 흰 안쪽 영역)
function Group({ title, paper, action, children }: { title: string; paper?: boolean; action?: ReactNode; children: ReactNode }) {
  return (
    <fieldset className="w98-group grid gap-3">
      <legend>{title}</legend>
      {action ? <div className="flex justify-end">{action}</div> : null}
      <div className={cn(paper && "w98-in bg-white p-3")}>{children}</div>
    </fieldset>
  );
}

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
      <section className="mx-auto grid max-w-md px-5 py-16">
        <PxCard title="오류">
          <div className="grid gap-4">
            <h1 className="font-pixel text-xl">회의를 찾을 수 없어요</h1>
            <p className="text-sm">없어졌거나 주소가 잘못되었을 수 있습니다.</p>
            <div className="flex justify-end"><Link href="/malmoa/meetings" className={pxButtonClass("mint", "md")}>회의 목록으로</Link></div>
          </div>
        </PxCard>
      </section>
    );
  }

  const image = meeting.source === "image";
  const active = meeting.status === "QUEUED" || meeting.status === "TRANSCRIBING" || meeting.status === "SUMMARIZING";
  const segs = meeting.transcriptReady ? transcriptFor(meeting) : [];
  const baseName = meeting.fileName.replace(/\.[^.]+$/, "");

  return (
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-5">
    <PxCard title={`${meeting.fileName} - 회의 뷰어`} data-rise>
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/malmoa/meetings" className={pxButtonClass("ghost", "sm")}>◀ 회의 목록</Link>
        <StatusBadge meeting={meeting} />
      </div>
      <div className="w98-in grid gap-1 bg-white p-3">
        <h1 className="font-pixel text-xl break-all">{meeting.fileName}</h1>
        <p className="text-sm text-[#404040]">{[formatWhen(meeting.createdAt), formatDuration(meeting.durationSec), formatBytes(meeting.sizeBytes)].filter(Boolean).join(" · ")}</p>
      </div>

      {active ? (
        <Group title="처리 중">
          <div className="grid gap-2">
            <PxBar value={meeting.progress ?? 0} tone="sky" label="처리 진행률" />
            <p className="text-sm text-[#404040]">{meeting.stage ?? "처리 중"} · {meeting.progress ?? 0}% — 이 화면을 벗어나도 계속됩니다.</p>
          </div>
        </Group>
      ) : null}

      {meeting.status === "FAILED" ? (
        <Group title="처리하지 못했어요">
          <p role="alert" className="mb-3">{meeting.errorMessage ?? "처리 중 문제가 생겼습니다."}</p>
          <PxButton variant="pink" onClick={() => retry(meeting.id)}>다시 시도</PxButton>
        </Group>
      ) : null}

      {meeting.transcriptReady ? (
        <div className="grid gap-3">
          <div role="tablist" aria-label="결과 종류" className="flex gap-1">
            {([["minutes", "회의록"], ["transcript", image ? "읽은 글" : "변환 원문"]] as const).map(([k, label]) => (
              <button
                key={k}
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={cn("font-pixel w98-out px-4 py-1.5 text-base text-black", tab === k && "relative z-10 -mb-px bg-white font-bold")}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "minutes" ? (
            doc && meeting.minutesReady ? (
              <Group title="AI 회의록" paper action={doc.edited ? <PxBadge tone="sky">수정됨</PxBadge> : undefined}>
                {editing ? (
                  <div className="grid gap-3">
                    <textarea value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="회의록 편집" rows={20} className="w98-in w-full bg-white p-3 font-mono text-sm text-black outline-none" />
                    <div className="flex gap-3">
                      <PxButton onClick={() => { save(meeting.id, draft); setEditing(false); }}>저장</PxButton>
                      <PxButton variant="ghost" className="text-black" onClick={() => setEditing(false)}>취소</PxButton>
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
              </Group>
            ) : (
              <Group title="AI 회의록">
                <div className="grid justify-items-start gap-3">
                  <p>원문에서 논의·결정·할 일을 8개 항목으로 정리합니다. 변환된 텍스트만 AI로 전송되며, 음성은 보내지 않습니다.</p>
                  <PxButton disabled={active} onClick={() => generate(meeting.id)}><PixelIcon name="bolt" size={18} />AI 회의록 만들기</PxButton>
                  <p className="text-sm text-[#404040]">지금은 화면용 목 데이터로 작성됩니다. API 없이 쓰려면 ‘변환 원문’ 탭의 “회의록 요청문과 함께 복사”를 쓰세요.</p>
                </div>
              </Group>
            )
          ) : (
            <div className="grid gap-4">
              <Group title="복사하기">
                <div className="flex flex-wrap items-start gap-4">
                  <CopyButton variant="mint" text={() => segmentsToText(segs)} hint="멘토링·기타 용도 그대로 사용">텍스트만 복사</CopyButton>
                  {!image ? <CopyButton text={() => segmentsToTimed(segs)} hint="다시 들을 위치가 필요할 때 [00:12:34] …">시간 포함 복사</CopyButton> : null}
                  <CopyButton variant="gold" text={() => buildMinutesPrompt(segs, image)} hint="ChatGPT·Claude에 붙여 회의록 만들 때">회의록 요청문과 함께 복사</CopyButton>
                </div>
              </Group>
              <Group title={image ? "사진에서 읽은 글" : "변환 원문"} paper action={<PxButton size="sm" variant="ghost" onClick={() => downloadText(`${baseName}_원문.txt`, image ? segmentsToText(segs) : segmentsToTimed(segs))}>TXT 받기</PxButton>}>
                <ul className="grid gap-2">
                  {segs.map((s, i) => (
                    <li key={i} className="flex flex-wrap items-baseline gap-2">
                      {!image ? <span className="font-pixel text-sm text-[#000080]">[{formatClock(s.start)}]</span> : null}
                      <span>{s.text}</span>
                      {s.confidence !== undefined && s.confidence < LOW_CONFIDENCE ? <PxBadge tone="pink">확인 필요</PxBadge> : null}
                    </li>
                  ))}
                </ul>
              </Group>
            </div>
          )}
        </div>
      ) : null}
      <p className="w98-flat px-2 py-0.5 text-sm">{active ? `처리 중 ${meeting.progress ?? 0}%` : meeting.status === "FAILED" ? "처리 실패" : meeting.minutesReady ? "회의록 준비됨" : meeting.transcriptReady ? "변환 완료" : "대기 중"}</p>
    </div>
    </PxCard>
    {meeting.minutesReady ? <ShareDialog meetingId={meeting.id} open={sharing} onOpenChange={setSharing} /> : null}
    </div>
  );
}
