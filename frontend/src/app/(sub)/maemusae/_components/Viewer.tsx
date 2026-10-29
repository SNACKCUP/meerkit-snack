"use client";

import type { ApiProject } from "../_lib/api";
import { usePriorities, useReqKinds } from "../_lib/queries";
import { useMaemusae } from "../_lib/store";
import type { ConfirmedItem } from "../_lib/types";
import { Btn, Pill, card, fmtDate } from "./ui";

const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;

/** 표에 보일 요구사항 한 줄 (확정 문서, 버전 기록이 같이 쓴다) */
export type TableRow = Pick<ConfirmedItem, "code" | "name" | "kind" | "priority" | "description" | "quote"> & { key: string | number };

/** 서버가 만들어 주기 전까지는 표를 CSV로 내려 Excel에서 열 수 있게 한다. 구분·우선순위는 코드 대신 이름으로 */
export function downloadExcel(fileName: string, items: TableRow[], kindLabel: (code: string) => string, priorityLabel: (code: string) => string) {
  const rows = [["ID", "이름", "구분", "우선순위", "설명", "근거"], ...items.map((c) => [c.code, c.name, kindLabel(c.kind), priorityLabel(c.priority), c.description, c.quote])];
  const blob = new Blob(["﻿" + rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${fileName}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function RequirementTable({ items }: { items: TableRow[] }) {
  const kinds = useReqKinds();
  const priorities = usePriorities();
  return (
    <div className={`${card} overflow-x-auto p-0`} data-rise>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b-[1.5px] border-[#111] text-xs font-extrabold text-[#6c6a62]">
            {["ID", "이름", "구분", "우선순위", "설명"].map((h) => <th key={h} scope="col" className="px-5 py-3">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.key} className="border-b border-[#111]/10 align-top last:border-0">
              <td className="whitespace-nowrap px-5 py-3 text-xs text-[#6c6a62]">{c.code}</td>
              <td className="px-5 py-3 font-semibold">{c.name}</td>
              <td className="px-5 py-3"><Pill>{kinds.label(c.kind)}</Pill></td>
              <td className="px-5 py-3"><Pill tone={c.priority === "HIGH" ? "yellow" : "plain"}>{priorities.label(c.priority)}</Pill></td>
              <td className="px-5 py-3 text-[#55534c]">{c.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const tableRows = (items: ConfirmedItem[]): TableRow[] => items.map((c) => ({ ...c, key: c.id }));

// 확정된 요구사항정의서 (M4 전까지 브라우저 목). 관리자만 다시 열 수 있고, 모두 내려받을 수 있다.
export function Viewer({ project, isAdmin }: { project: ApiProject; isAdmin: boolean }) {
  const pid = String(project.id);
  const confirmed = useMaemusae((s) => s.confirmed[pid]);
  const reopen = useMaemusae((s) => s.reopen);
  const kinds = useReqKinds();
  const priorities = usePriorities();
  const items = tableRows(confirmed?.items ?? []);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3" data-rise>
        <p className="text-sm text-[#6c6a62]">{confirmed && <>{fmtDate(confirmed.at)} 확정 · </>}요구사항 {items.length}개</p>
        <div className="flex flex-wrap gap-2">
          <Btn size="sm" onClick={() => downloadExcel(`${project.name}_요구사항정의서`, items, kinds.label, priorities.label)}>Excel 받기</Btn>
          <Btn size="sm" onClick={() => window.print()}>PDF로 저장</Btn>
          {isAdmin ? (
            <Btn size="sm" variant="dark" onClick={() => reopen(pid)}>확정 후 수정</Btn>
          ) : (
            <span className="inline-flex items-center text-xs text-[#6c6a62]">확정 후 수정은 관리자만 할 수 있어요</span>
          )}
        </div>
      </div>
      <RequirementTable items={items} />
    </div>
  );
}
