"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";

import { Checkbox } from "@/components/ui/checkbox";

import type { ApiRequirement } from "../_lib/api";
import { usePriorities, useReqKinds } from "../_lib/queries";
import { Pill } from "./ui";

/**
 * 요구사항 후보 목록. 수백 개라도 보이는 줄만 그리고(가상 스크롤), 끝까지 내리면 다음 묶음을 받는다.
 * centerId가 바뀌면 그 후보를 목록 가운데로 가져온다 (다시 들어왔을 때, 입력한 내용에서 눌렀을 때).
 */
export function CandidateList({
  items,
  selectedId,
  centerId,
  readOnly,
  hasMore,
  loadingMore,
  onLoadMore,
  onSelect,
  onToggle,
}: {
  items: ApiRequirement[];
  selectedId: number | null;
  centerId: number | null;
  readOnly: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onSelect: (id: number) => void;
  onToggle: (row: ApiRequirement, included: boolean) => void;
}) {
  const kinds = useReqKinds();
  const priorities = usePriorities();
  const boxRef = useRef<HTMLDivElement>(null);
  // 가상 스크롤 훅은 React Compiler가 메모할 수 없다고 알려 준다 (스크롤마다 다시 그리는 게 맞는 부품이라 괜찮음)
  // eslint-disable-next-line react-hooks/incompatible-library
  const v = useVirtualizer({ count: items.length, getScrollElement: () => boxRef.current, estimateSize: () => 82, overscan: 8, gap: 8 });
  const rows = v.getVirtualItems();

  // 끝 근처까지 내리면 다음 묶음을 받는다
  const lastIndex = rows.at(-1)?.index ?? -1;
  useEffect(() => {
    if (hasMore && !loadingMore && lastIndex >= items.length - 5) onLoadMore();
  }, [hasMore, loadingMore, lastIndex, items.length, onLoadMore]);

  const centerIndex = centerId == null ? -1 : items.findIndex((r) => r.id === centerId);
  useEffect(() => {
    if (centerIndex >= 0) v.scrollToIndex(centerIndex, { align: "center" });
    // 가운데로 올 후보가 바뀔 때만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerIndex, centerId]);

  if (items.length === 0) return <p className="py-8 text-center text-sm text-[#6c6a62]">조건에 맞는 후보가 없어요.</p>;

  return (
    <div ref={boxRef} className="relative min-h-0 flex-1 overflow-y-auto pr-1">
      <ul className="relative w-full" style={{ height: v.getTotalSize() }}>
        {rows.map((row) => {
          const c = items[row.index];
          const on = c.id === selectedId;
          return (
            <li
              key={c.id}
              data-index={row.index}
              ref={v.measureElement}
              className={`absolute left-0 top-0 flex w-full items-start gap-3 rounded-2xl border-[1.5px] p-3 ${on ? "border-[#111] bg-[#f2f69a]" : "border-[#111]/20 bg-white"}`}
              style={{ transform: `translateY(${row.start}px)` }}
            >
              <Checkbox checked={c.is_included} disabled={readOnly} aria-label={`${c.name} 포함`} onCheckedChange={(val) => onToggle(c, val === true)} className="mt-1" />
              <button type="button" onClick={() => onSelect(c.id)} className="grid flex-1 gap-1 text-left" aria-current={on}>
                <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  <span className="text-xs text-[#6c6a62]">{c.code}</span>
                  {c.name}
                </span>
                {c.category_major && <span className="truncate text-xs text-[#6c6a62]">{[c.category_major, c.category_middle, c.category_minor].filter(Boolean).join(" > ")}</span>}
                <span className="flex flex-wrap gap-1.5">
                  <Pill>{kinds.label(c.kind)}</Pill>
                  <Pill>{priorities.label(c.priority)}</Pill>
                  {c.needs_answer && <Pill tone="orange">확인 필요</Pill>}
                  {(c.kind_defaulted || c.priority_defaulted) && <Pill tone="orange">AI 값 확인</Pill>}
                  {c.is_manual && <Pill>직접 추가</Pill>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {loadingMore && <p className="py-2 text-center text-xs text-[#6c6a62]">더 불러오는 중…</p>}
    </div>
  );
}
