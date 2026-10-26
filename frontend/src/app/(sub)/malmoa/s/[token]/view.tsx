"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { MarkdownView } from "../../_components/MarkdownView";
import { PxBadge, PxCard, pxButtonClass } from "../../_components/px";
import { formatWhen } from "../../_lib/format";
import { useMalmoa } from "../../_lib/store";

export default function SharedMinutes() {
  const { token } = useParams<{ token: string }>();
  const hydrated = useMalmoa((s) => s.hydrated);
  const shares = useMalmoa((s) => s.shares);
  const meetings = useMalmoa((s) => s.meetings);
  const minutes = useMalmoa((s) => s.minutes);
  const [now] = useState(() => Date.now()); // 화면을 연 시각 기준으로 기간을 판단한다
  if (!hydrated) return <div className="h-[60vh]" aria-busy />;

  const share = Object.values(shares).find((x) => x.token === token);
  const meeting = share ? meetings.find((m) => m.id === share.meetingId) : undefined;
  const doc = meeting ? minutes[meeting.id] : undefined;
  const reason = !share || !meeting || !doc ? "없는 링크예요" : share.revoked ? "공유가 중단되었어요" : new Date(share.expiresAt).getTime() <= now ? "공유 기간이 끝났어요" : null;

  if (reason || !share || !meeting || !doc) {
    return (
      <section className="mx-auto grid max-w-xl justify-items-center gap-4 px-5 py-16 text-center">
        <h1 className="font-pixel text-3xl">{reason}</h1>
        <p className="text-muted-foreground">링크를 보낸 사람에게 새 링크를 요청해 주세요.</p>
        <Link href="/malmoa" className={pxButtonClass("mint", "lg")}>말모아 구경하기</Link>
      </section>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 px-5 py-10">
      <div className="grid gap-2" data-rise>
        <PxBadge tone="sky" className="w-fit">읽기 전용</PxBadge>
        <h1 className="font-pixel text-3xl break-all sm:text-4xl">{meeting.fileName.replace(/\.[^.]+$/, "")}</h1>
        <p className="text-sm text-muted-foreground">{formatWhen(doc.generatedAt)} 작성 · {formatWhen(share.expiresAt)}까지 열려 있어요</p>
      </div>
      <div data-rise>
        <PxCard title="회의록" tone="paper"><MarkdownView markdown={doc.markdown} /></PxCard>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-border bg-card p-4" data-rise>
        <p className="font-pixel text-xl">말로 하고 글로 모으는 회의록, 말모아</p>
        <Link href="/malmoa/signup" className={pxButtonClass("mint", "md")}>나도 시작하기</Link>
      </div>
    </div>
  );
}
