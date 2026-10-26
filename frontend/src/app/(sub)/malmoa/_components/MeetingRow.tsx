"use client";

import Link from "next/link";

import { formatBytes, formatDuration, formatWhen } from "../_lib/format";
import { useMalmoa } from "../_lib/store";
import type { Meeting } from "../_lib/types";
import { PixelIcon, PxButton, pxButtonClass } from "./px";
import { StatusBadge } from "./StatusBadge";

// 회의 한 줄: 홈의 최근 회의와 회의 목록이 함께 쓴다.
export function MeetingRow({ meeting: m }: { meeting: Meeting }) {
  const retry = useMalmoa((s) => s.retry);
  return (
    <li className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
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
      <Link href={`/malmoa/meetings/${m.id}`} className={pxButtonClass("sky", "sm")}>결과 보기</Link>
    </li>
  );
}
