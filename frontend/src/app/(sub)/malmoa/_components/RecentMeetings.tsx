"use client";

import { formatBytes, formatDuration, formatWhen } from "../_lib/format";
import { useMalmoa } from "../_lib/store";
import { PixelIcon, PxButton, PxCard } from "./px";
import { StatusBadge } from "./StatusBadge";

// 최근 회의 5개. (결과 보기·전체 목록은 M4에서 연결한다)
export function RecentMeetings() {
  const meetings = useMalmoa((s) => s.meetings).slice(0, 5);
  const retry = useMalmoa((s) => s.retry);
  return (
    <PxCard title="최근 회의">
      {meetings.length === 0 ? (
        <p className="text-muted-foreground">아직 기록한 회의가 없어요. 첫 녹음으로 경험치를 모아 보세요!</p>
      ) : (
        <ul className="divide-y-2 divide-border">
          {meetings.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="grid size-10 shrink-0 place-items-center border-2 border-border bg-muted text-(--mk-sky)">
                <PixelIcon name={m.source === "image" ? "camera" : "mic"} size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{m.fileName}</p>
                <p className="text-sm text-muted-foreground">
                  {[formatWhen(m.createdAt), formatDuration(m.durationSec), formatBytes(m.sizeBytes)].filter(Boolean).join(" · ")}
                  {m.stage ? ` · ${m.stage}` : ""}
                </p>
                {m.errorMessage ? <p role="alert" className="text-sm text-(--mk-pink)">{m.errorMessage}</p> : null}
              </div>
              <StatusBadge meeting={m} />
              {m.status === "FAILED" ? <PxButton size="sm" variant="pink" onClick={() => retry(m.id)}>다시 시도</PxButton> : null}
            </li>
          ))}
        </ul>
      )}
    </PxCard>
  );
}
