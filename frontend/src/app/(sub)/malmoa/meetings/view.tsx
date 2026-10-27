"use client";

import Link from "next/link";
import { useState } from "react";

import { NativeSelect } from "@/components/ui/native-select";

import { MeetingRow } from "../_components/MeetingRow";
import { PxButton, PxCard } from "../_components/px";
import { useMalmoa } from "../_lib/store";
import type { MeetingStatus } from "../_lib/types";

const PAGE_SIZE = 6;
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
    <div className="mx-auto grid max-w-5xl gap-4 px-4 py-8">
      <div data-rise>
        <h1 className="mp-title font-pixel text-3xl">회의 목록</h1>
        <p className="mp-title mt-1 text-sm">파일명으로 찾거나 상태로 걸러 볼 수 있습니다.</p>
      </div>
      <div data-rise>
        <PxCard title="내 회의 - 탐색기" className="flex min-h-[28rem] flex-col">
          <div className="-m-3 flex min-h-0 flex-1 flex-col">
            {/* 도구 줄 */}
            <div className="flex flex-wrap items-center gap-2 border-b border-[#808080] p-2 shadow-[0_1px_0_#fff]">
              <label className="font-pixel flex min-w-0 flex-1 items-center gap-2 text-sm">
                <span className="shrink-0">찾기:</span>
                <input
                  type="search"
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setPage(1); }}
                  placeholder="파일명 검색"
                  aria-label="파일명 검색"
                  className="w98-in h-7 min-w-32 flex-1 bg-white px-2 text-sm font-normal text-black outline-none placeholder:text-[#808080]"
                />
              </label>
              <NativeSelect aria-label="상태 필터" value={status} onChange={(e) => { setStatus(e.target.value as typeof status); setPage(1); }} className="h-7 w-36 border-2 text-sm">
                {FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </NativeSelect>
            </div>

            {/* 목록 */}
            <div className="w98-in m-2 min-h-0 flex-1 overflow-auto bg-white p-3 text-black">
              {rows.length === 0 ? (
                <p className="py-10 text-center text-[#404040]">
                  {meetings.length === 0 ? <>아직 기록한 회의가 없어요. <Link href="/malmoa/home" className="font-pixel text-[#000080] underline underline-offset-4">녹음 화면</Link>에서 시작해 보세요.</> : "조건에 맞는 회의가 없습니다."}
                </p>
              ) : (
                <ul className="divide-y divide-[#c0c0c0]">
                  {rows.map((m) => <MeetingRow key={m.id} meeting={m} />)}
                </ul>
              )}
            </div>

            {/* 상태 표시줄 */}
            <div className="flex flex-wrap items-center gap-1 p-1 text-sm">
              <span className="w98-flat px-2 py-0.5">{filtered.length}개 개체</span>
              <span className="w98-flat hidden px-2 py-0.5 sm:inline">{FILTERS.find((f) => f.value === status)?.label}</span>
              <nav aria-label="페이지 이동" className="ml-auto flex items-center gap-1">
                <PxButton size="sm" variant="ghost" className="min-w-0 px-2" disabled={cur <= 1} onClick={() => setPage(cur - 1)} aria-label="이전 페이지">◀</PxButton>
                <span className="font-pixel w98-flat px-3 py-0.5">{cur} / {pages}</span>
                <PxButton size="sm" variant="ghost" className="min-w-0 px-2" disabled={cur >= pages} onClick={() => setPage(cur + 1)} aria-label="다음 페이지">▶</PxButton>
              </nav>
            </div>
          </div>
        </PxCard>
      </div>
    </div>
  );
}
