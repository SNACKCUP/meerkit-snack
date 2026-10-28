"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/meerkit";
import { cn } from "@/lib/utils";

import { ProjectFormDialog } from "../_components/dialogs";
import { Btn, PageHead, Pill, card, fmtRange } from "../_components/ui";
import { DOC_STATUS, ROLE_LABEL } from "../_lib/labels";
import { roleOf, useCurrentUser, useMaemusae } from "../_lib/store";

const STATUS_BAND = { plain: "bg-[#e3dfd1]", yellow: "bg-[#f2f69a]", dark: "bg-[#ff5a14]", orange: "bg-[#ff5a14]" } as const;

export default function ProjectsPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const projects = useMaemusae((s) => s.projects);
  const docs = useMaemusae((s) => s.docs);
  const createProject = useMaemusae((s) => s.createProject);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  // 내가 멤버로 들어 있는 프로젝트만 보인다 (초대 대기 중인 것은 수락 전이라 제외)
  const mine = useMemo(() => projects.filter((p) => roleOf(p, user.id)).filter((p) => p.name.toLowerCase().includes(q.trim().toLowerCase())), [projects, user.id, q]);
  const hasAny = projects.some((p) => roleOf(p, user.id));

  return (
    <div className="grid gap-8">
      <PageHead eyebrow="Projects" light="내" title="프로젝트">
        <Btn variant="primary" onClick={() => setOpen(true)}>+ 프로젝트 등록</Btn>
      </PageHead>

      {hasAny && (
        <div data-rise>
          <label htmlFor="project-search" className="sr-only">프로젝트 검색</label>
          <Input id="project-search" value={q} placeholder="프로젝트 검색" onChange={(e) => setQ(e.target.value)} className="h-11 max-w-sm rounded-full border-2 border-[#111] bg-white px-5 shadow-[3px_3px_0_#111]" />
        </div>
      )}

      {!hasAny ? (
        <div className={`${card} grid justify-items-center gap-4 py-16 text-center`} data-rise>
          <h2 className="text-2xl font-extrabold tracking-tight">첫 프로젝트를 등록해 시작하세요</h2>
          <p className="text-sm leading-relaxed text-[#6c6a62]">고객 문서를 올리려면 먼저 프로젝트가 필요해요.<br />기간과 이름만 정하면 돼요.</p>
          <Btn variant="primary" size="lg" onClick={() => setOpen(true)}>프로젝트 등록</Btn>
        </div>
      ) : mine.length === 0 ? (
        <p className="py-10 text-center text-sm text-[#6c6a62]" data-rise>“{q}”에 맞는 프로젝트가 없어요.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" data-rise>
          {mine.map((p) => {
            const role = roleOf(p, user.id)!;
            const st = DOC_STATUS[docs[p.id]?.status ?? "empty"];
            const active = p.members.filter((m) => m.status === "active");
            return (
              <li key={p.id}>
                <Link href={`/maemusae/projects/${p.id}`} className="group flex h-full flex-col overflow-hidden rounded-[24px] border-2 border-[#111] bg-white shadow-[6px_6px_0_#111] transition-[transform,box-shadow] duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0_#111]">
                  <div className={cn("flex items-center justify-between gap-2 border-b-2 border-[#111] px-5 py-3", STATUS_BAND[st.tone])}>
                    <Pill tone={st.tone === "dark" ? "plain" : "dark"}>{st.label}</Pill>
                    <Pill tone={role === "ADMIN" ? "orange" : "plain"}>{ROLE_LABEL[role]}</Pill>
                  </div>
                  <div className="grid flex-1 content-between gap-10 px-5 py-6">
                    <h2 className="text-[26px] font-extrabold leading-[1.15] tracking-[-0.04em]">{p.name}</h2>
                    <p className="w-fit rounded-full bg-[#ebeae4] px-3 py-1 text-xs font-semibold tabular-nums text-[#55534c]">{fmtRange(p.startDate, p.endDate)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t-2 border-dashed border-[#111] px-5 py-4">
                    <span className="flex items-center gap-3">
                      <span className="flex -space-x-2">
                        {active.slice(0, 4).map((m) => (
                          <UserAvatar key={m.id} user={{ name: m.name, nickname: null, avatar_url: null }} size="sm" className="ring-2 ring-white" />
                        ))}
                      </span>
                      <span className="text-xs font-semibold text-[#55534c]">멤버 {active.length}명</span>
                    </span>
                    <span aria-hidden className="grid size-9 place-items-center rounded-full border-2 border-[#111] bg-white text-base font-bold transition-colors group-hover:bg-[#ff5a14] group-hover:text-white">→</span>
                  </div>
                </Link>
              </li>
            );
          })}
          <li>
            <button type="button" onClick={() => setOpen(true)} className="grid h-full min-h-[220px] w-full place-items-center content-center gap-3 rounded-[24px] border-2 border-dashed border-[#111] bg-transparent p-6 text-center transition-colors hover:bg-[#f2f69a]">
              <span aria-hidden className="grid size-12 place-items-center rounded-full border-2 border-[#111] bg-white text-2xl font-bold shadow-[3px_3px_0_#111]">+</span>
              <span className="text-base font-extrabold">새 프로젝트</span>
              <span className="text-xs text-[#6c6a62]">이름과 기간만 정하면 돼요</span>
            </button>
          </li>
        </ul>
      )}

      <ProjectFormDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={(v) => {
          const id = createProject(v);
          toast.success(v.inviteEmails.length ? `프로젝트를 만들고 ${v.inviteEmails.length}명에게 초대장을 보냈어요.` : "프로젝트를 만들었어요.");
          router.push(`/maemusae/projects/${id}`);
        }}
      />
    </div>
  );
}
