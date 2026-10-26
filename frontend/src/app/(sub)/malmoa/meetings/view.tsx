"use client";

import Link from "next/link";
import { useState } from "react";

import { NativeSelect } from "@/components/ui/native-select";

import { MeetingRow } from "../_components/MeetingRow";
import { PxButton, PxCard } from "../_components/px";
import { useMalmoa } from "../_lib/store";
import type { MeetingStatus } from "../_lib/types";

const PAGE_SIZE = 8;
const FILTERS: { value: "ALL" | MeetingStatus; label: string }[] = [
  { value: "ALL", label: "전체 상태" },
  { value: "COMPLETED", label: "완료" },
  { value: "TRANSCRIBING", label: "처리 중" },
  { value: "FAILED", label: "실패" },
];

export default function MeetingsPage() {
  const hydrated = useMalmoa((s) => s.hydrated);
  const meetings = useMalmoa((s) => s.meetings);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"ALL" | MeetingStatus>("ALL");
  const [page, setPage] = useState(1);
  if (!hydrated) return <div className="h-[60vh]" aria-busy />;

  const filtered = meetings.filter((m) => {
    if (q.trim() && !m.fileName.toLowerCase().includes(q.trim().toLowerCase())) return false;
    if (status === "ALL") return true;
    if (status === "TRANSCRIBING") return m.status === "QUEUED" || m.status === "TRANSCRIBING" || m.status === "SUMMARIZING";
    return m.status === status;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const rows = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10">
      <div data-rise>
        <h1 className="font-pixel text-4xl text-(--mk-gold)">회의 목록</h1>
        <p className="mt-1 text-muted-foreground">파일명으로 찾거나 상태로 걸러 볼 수 있습니다.</p>
      </div>
      <div data-rise>
        <PxCard title="전체 회의">
          <div className="grid gap-4">
            <div className="flex flex-wrap gap-3">
              <input
                type="search"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="파일명 검색"
                aria-label="파일명 검색"
                className="h-10 min-w-48 flex-1 border-[3px] border-border bg-(--mk-px-edge) px-3 outline-none placeholder:text-muted-foreground focus-visible:border-(--mk-sky)"
              />
              <NativeSelect aria-label="상태 필터" value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1); }} className="h-10 rounded-none border-[3px]">
                {FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </NativeSelect>
            </div>
            {rows.length === 0 ? (
              <p className="py-6 text-center text-muted-foreground">
                {meetings.length === 0 ? <>아직 기록한 회의가 없어요. <Link href="/malmoa/home" className="font-pixel text-(--mk-gold) underline underline-offset-4">퀘스트 보드</Link>에서 시작해 보세요.</> : "조건에 맞는 회의가 없습니다."}
              </p>
            ) : (
              <ul className="divide-y-2 divide-border">
                {rows.map((m) => <MeetingRow key={m.id} meeting={m} />)}
              </ul>
            )}
            {pages > 1 ? (
              <nav aria-label="페이지 이동" className="flex items-center justify-center gap-4">
                <PxButton size="sm" variant="ghost" disabled={cur <= 1} onClick={() => setPage(cur - 1)} aria-label="이전 페이지">◀</PxButton>
                <span className="font-pixel text-lg">{cur} / {pages}</span>
                <PxButton size="sm" variant="ghost" disabled={cur >= pages} onClick={() => setPage(cur + 1)} aria-label="다음 페이지">▶</PxButton>
              </nav>
            ) : null}
          </div>
        </PxCard>
      </div>
    </div>
  );
}
