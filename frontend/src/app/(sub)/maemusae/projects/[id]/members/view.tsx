"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { NativeSelect } from "@/components/ui/native-select";
import { UserAvatar } from "@/meerkit";

import { ConfirmDialog, InviteDialog } from "../../../_components/dialogs";
import { ProjectGuard } from "../../../_components/ProjectGuard";
import { Btn, PageHead, Pill, card, fmtDate } from "../../../_components/ui";
import { ROLE_LABEL } from "../../../_lib/labels";
import { useMaemusae } from "../../../_lib/store";
import type { Member, ProjectRole } from "../../../_lib/types";

export default function MembersPage() {
  const { id } = useParams<{ id: string }>();
  const inviteMember = useMaemusae((s) => s.inviteMember);
  const changeRole = useMaemusae((s) => s.changeRole);
  const removeMember = useMaemusae((s) => s.removeMember);
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState<Member | null>(null);

  return (
    <ProjectGuard projectId={id} need="admin">
      {({ project }) => (
        <div className="grid gap-8">
          <PageHead eyebrow={project.name} title="멤버 권한 관리">
            <Btn variant="primary" onClick={() => setInviting(true)}>+ 멤버 초대</Btn>
          </PageHead>
          <p className="-mt-4 text-sm text-[#6c6a62]" data-rise>
            관리자는 요구사항을 확정하고 멤버를 관리해요. 일반 멤버는 확정 외의 모든 작업을 할 수 있어요. <Link href={`/maemusae/projects/${id}`} className="underline">프로젝트로 돌아가기</Link>
          </p>

          <ul className={`${card} grid gap-0 divide-y divide-[#111]/15 p-0`} data-rise>
            {project.members.map((m) => (
              <li key={m.id} className="grid items-center gap-3 px-6 py-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)_7rem_6rem]">
                <span className="flex items-center gap-3">
                  <UserAvatar user={{ name: m.name, nickname: null, avatar_url: null }} size="sm" />
                  <span className="font-semibold">{m.name}</span>
                </span>
                <span className="text-sm text-[#6c6a62]">
                  {m.email}
                  {m.status === "invited" && m.expiresAt && <span className="mt-1 block"><Pill tone="yellow">초대 대기 · {fmtDate(m.expiresAt)}까지</Pill></span>}
                </span>
                <NativeSelect
                  aria-label={`${m.name} 권한`}
                  value={m.role}
                  onChange={(e) => {
                    const r = changeRole(id, m.id, e.target.value as ProjectRole);
                    if (!r.ok) toast.error(r.error);
                    else toast.success(`${m.name}님을 ${ROLE_LABEL[e.target.value as ProjectRole]}(으)로 바꿨어요.`);
                  }}
                  className="w-28 rounded-full border-2 border-[#111]"
                >
                  <option value="ADMIN">관리자</option>
                  <option value="MEMBER">일반</option>
                </NativeSelect>
                <Btn size="sm" variant="ghost" className="justify-self-end" onClick={() => setRemoving(m)}>{m.status === "invited" ? "초대 취소" : "내보내기"}</Btn>
              </li>
            ))}
          </ul>

          <InviteDialog
            open={inviting}
            onOpenChange={setInviting}
            onInvite={(email) => {
              const r = inviteMember(id, email);
              if (!r.ok) return r.error;
              toast.success("초대장을 보냈어요. 7일 안에 수락해야 해요.");
              return null;
            }}
          />
          <ConfirmDialog
            open={!!removing}
            onOpenChange={(v) => !v && setRemoving(null)}
            title={removing?.status === "invited" ? "초대를 취소할까요?" : "멤버를 내보낼까요?"}
            body={removing ? `${removing.name}(${removing.email})` : ""}
            confirmLabel={removing?.status === "invited" ? "초대 취소" : "내보내기"}
            danger
            onConfirm={() => {
              if (!removing) return;
              const r = removeMember(id, removing.id);
              if (!r.ok) toast.error(r.error);
              else toast.success("처리했어요.");
              setRemoving(null);
            }}
          />
        </div>
      )}
    </ProjectGuard>
  );
}
