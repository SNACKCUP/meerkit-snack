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
        <h1 className="mp-title font-pixel text-3xl">회의 목록</h1>
        <p className="mp-title mt-1 text-sm">파일명으로 찾거나 상태로 걸러 볼 수 있습니다.</p>
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
                className="w98-in h-8 min-w-48 flex-1 bg-white px-2 text-black outline-none placeholder:text-[#808080]"
              />
              <NativeSelect aria-label="상태 필터" value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1); }} className="h-10 border-2">
                {FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </NativeSelect>
            </div>
            {rows.length === 0 ? (
              <p className="py-6 text-center text-[#404040]">
                {meetings.length === 0 ? <>아직 기록한 회의가 없어요. <Link href="/malmoa/home" className="font-pixel text-[#000080] underline underline-offset-4">녹음 화면</Link>에서 시작해 보세요.</> : "조건에 맞는 회의가 없습니다."}
              </p>
            ) : (
              <ul className="w98-in divide-y divide-[#c0c0c0] bg-white p-3">
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
