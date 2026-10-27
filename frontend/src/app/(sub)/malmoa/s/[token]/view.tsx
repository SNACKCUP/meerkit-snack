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
      <section className="mx-auto grid max-w-md px-3 py-12">
        <PxCard title="공유 링크">
          <div className="grid gap-4">
            <h1 className="font-pixel text-xl">{reason}</h1>
            <p className="text-sm">링크를 보낸 사람에게 새 링크를 요청해 주세요.</p>
            <div className="flex justify-end"><Link href="/malmoa" className={pxButtonClass("mint", "md")}>말모아 열기</Link></div>
          </div>
        </PxCard>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-3 py-6 sm:px-5">
      <PxCard title={`${meeting.fileName.replace(/\.[^.]+$/, "")} - 공유 보기`} data-rise>
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <PxBadge tone="sky">읽기 전용</PxBadge>
            <p className="text-sm">{formatWhen(doc.generatedAt)} 작성 · {formatWhen(share.expiresAt)}까지 열려 있어요</p>
          </div>
          <div className="w98-in grid gap-3 bg-white p-4">
            <h1 className="font-pixel text-xl break-all">{meeting.fileName.replace(/\.[^.]+$/, "")}</h1>
            <MarkdownView markdown={doc.markdown} />
          </div>
          <div className="w98-flat flex flex-wrap items-center justify-between gap-2 px-2 py-1">
            <p className="text-sm">말로 하고 글로 모으는 회의록, 말모아</p>
            <Link href="/malmoa/home" className={pxButtonClass("mint", "sm")}>말모아 열기</Link>
          </div>
        </div>
      </PxCard>
    </div>
  );
}
