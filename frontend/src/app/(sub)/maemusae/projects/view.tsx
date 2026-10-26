"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";

import { ProjectFormDialog } from "../_components/dialogs";
import { Btn, PageHead, Pill, card, fmtRange } from "../_components/ui";
import { DOC_STATUS, ROLE_LABEL } from "../_lib/labels";
import { roleOf, useCurrentUser, useMaemusae } from "../_lib/store";

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
          <Input id="project-search" value={q} placeholder="프로젝트 검색" onChange={(e) => setQ(e.target.value)} className="h-11 max-w-sm rounded-full border-[1.5px] border-[#111] bg-white px-5" />
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
        <ul className="grid gap-3" data-rise>
          {mine.map((p) => {
            const role = roleOf(p, user.id)!;
            const doc = docs[p.id];
            const st = DOC_STATUS[doc?.status ?? "empty"];
            return (
              <li key={p.id}>
                <Link href={`/maemusae/projects/${p.id}`} className="group grid items-center gap-3 rounded-[24px] border-[1.5px] border-[#111] bg-white px-6 py-5 transition-transform hover:-translate-y-0.5 sm:grid-cols-[1.6fr_1.1fr_auto_auto]">
                  <span className="text-[17px] font-semibold tracking-tight">{p.name}</span>
                  <span className="text-sm text-[#6c6a62]">{fmtRange(p.startDate, p.endDate)}</span>
                  <span className="flex gap-2"><Pill tone={role === "ADMIN" ? "yellow" : "plain"}>{ROLE_LABEL[role]}</Pill><Pill tone={st.tone}>{st.label}</Pill></span>
                  <span className="text-sm text-[#6c6a62]">멤버 {p.members.filter((m) => m.status === "active").length}명 <span className="ml-2 transition-transform group-hover:translate-x-1">→</span></span>
                </Link>
              </li>
            );
          })}
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
