"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";

import { DOC_KINDS, revisionLabel } from "../_lib/labels";
import type { ConfirmedDoc } from "../_lib/types";
import { Pill, card, fmtDate } from "./ui";

// 확정한 문서 기록. 검색, 최신/오래된순, 종류로 거를 수 있고 행을 누르면 미리보기로 간다.
export function DocList({ projectId, docs }: { projectId: string; docs: ConfirmedDoc[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"new" | "old">("new");
  const [kind, setKind] = useState("all");

  const shown = useMemo(
    () =>
      docs
        .filter((d) => kind === "all" || d.kind === kind)
        .filter((d) => !q.trim() || `${d.title} ${d.confirmedBy}`.toLowerCase().includes(q.trim().toLowerCase()))
        .sort((a, b) => (sort === "new" ? b.confirmedAt.localeCompare(a.confirmedAt) : a.confirmedAt.localeCompare(b.confirmedAt))),
    [docs, q, sort, kind],
  );

  return (
    <section aria-labelledby="doclist" className="grid gap-4" data-rise>
      <h2 id="doclist" className="text-xl font-extrabold tracking-tight">확정한 문서</h2>
      <div className="flex flex-wrap gap-2">
        <Input aria-label="문서 검색" value={q} placeholder="문서 이름·확정인 검색" onChange={(e) => setQ(e.target.value)} className="h-10 w-64 rounded-full border-[1.5px] border-[#111] bg-white px-4" />
        <NativeSelect aria-label="정렬" value={sort} onChange={(e) => setSort(e.target.value as "new" | "old")} className="h-10 w-28 rounded-full border-[1.5px] border-[#111]">
          <option value="new">최신순</option><option value="old">오래된순</option>
        </NativeSelect>
        <NativeSelect aria-label="문서 종류" value={kind} onChange={(e) => setKind(e.target.value)} className="h-10 w-40 rounded-full border-[1.5px] border-[#111]">
          <option value="all">전체 종류</option>
          {DOC_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
        </NativeSelect>
      </div>
      <div className={`${card} overflow-x-auto p-0`}>
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b-[1.5px] border-[#111] text-xs font-extrabold text-[#6c6a62]">
              {["문서", "종류", "구분", "확정일", "확정인"].map((h) => <th key={h} scope="col" className="px-5 py-3">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-[#6c6a62]">조건에 맞는 문서가 없어요.</td></tr>
            ) : (
              shown.map((d) => (
                <tr key={d.id} onClick={() => router.push(`/maemusae/projects/${projectId}/docs/${d.id}`)} className="cursor-pointer border-b border-[#111]/10 last:border-0 hover:bg-[#ebeae4]">
                  <td className="px-5 py-3 font-semibold"><Link href={`/maemusae/projects/${projectId}/docs/${d.id}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>{d.title}</Link></td>
                  <td className="px-5 py-3">{d.kind}</td>
                  <td className="px-5 py-3"><Pill tone={d.revision > 1 ? "yellow" : "plain"}>{revisionLabel(d.revision)}</Pill></td>
                  <td className="px-5 py-3 text-[#55534c]">{fmtDate(d.confirmedAt)}</td>
                  <td className="px-5 py-3 text-[#55534c]">{d.confirmedBy}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
