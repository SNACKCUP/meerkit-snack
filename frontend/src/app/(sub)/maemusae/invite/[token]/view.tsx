"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { Btn, card } from "../../_components/ui";
import { useCurrentUser, useMaemusae } from "../../_lib/store";

// 초대 메일의 링크로 들어오는 화면. 가입(로그인)을 마친 사용자가 수락하면 프로젝트 멤버가 된다.
export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const user = useCurrentUser();
  const project = useMaemusae((s) => s.projects.find((p) => p.members.some((m) => m.token === token)));
  const acceptInvite = useMaemusae((s) => s.acceptInvite);
  const [error, setError] = useState<string | null>(null);
  const invite = project?.members.find((m) => m.token === token);

  if (!project || !invite) {
    return (
      <div className={`${card} mx-auto max-w-lg text-center`} role="alert">
        <h1 className="text-2xl font-extrabold tracking-tight">초대 링크를 찾을 수 없어요</h1>
        <p className="mt-2 text-sm text-[#6c6a62]">이미 수락했거나 취소된 초대일 수 있어요.</p>
        <Btn href="/maemusae/projects" variant="dark" className="mt-6">프로젝트 목록으로</Btn>
      </div>
    );
  }

  return (
    <div className={`${card} mx-auto grid max-w-lg justify-items-center gap-3 text-center`} data-rise>
      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#6c6a62]">프로젝트 초대</p>
      <h1 className="text-3xl font-extrabold tracking-tight">{project.name}</h1>
      <p className="text-sm text-[#6c6a62]">{invite.email} 주소로 온 초대예요. 지금 <b>{user.name}</b>님으로 로그인되어 있어요.</p>
      {error && <p role="alert" className="text-sm font-semibold text-[#c2410c]">{error}</p>}
      <Btn
        variant="primary"
        size="lg"
        className="mt-2"
        onClick={() => {
          const r = acceptInvite(token);
          if (r.ok) router.push(`/maemusae/projects/${r.projectId}`);
          else setError(r.error);
        }}
      >
        초대 수락
      </Btn>
    </div>
  );
}
