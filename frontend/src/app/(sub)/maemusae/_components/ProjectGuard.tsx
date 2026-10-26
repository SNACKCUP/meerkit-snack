"use client";

import type { ReactNode } from "react";

import type { Project, ProjectRole } from "../_lib/types";
import { roleOf, useCurrentUser, useMaemusae } from "../_lib/store";
import { Btn, card } from "./ui";

interface GuardContext {
  project: Project;
  role: ProjectRole;
  isAdmin: boolean;
}

function Blocked({ title, body }: { title: string; body: string }) {
  return (
    <div className={`${card} mx-auto max-w-lg text-center`} role="alert">
      <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
      <p className="mx-auto mt-2 text-sm text-[#6c6a62]">{body}</p>
      <Btn href="/maemusae/projects" variant="dark" className="mt-6">프로젝트 목록으로</Btn>
    </div>
  );
}

/**
 * 프로젝트 안의 화면을 지키는 가드. Meerkit의 RequireAuth/RequireRole이 "로그인했는가, 전역 역할이 있는가"를 본다면,
 * 이 가드는 "이 프로젝트의 멤버인가, 프로젝트 관리자인가"를 본다.
 * 화면용 검사입니다. 서버도 같은 검사를 해야 안전합니다.
 */
export function ProjectGuard({ projectId, need = "member", children }: { projectId: string; need?: "member" | "admin"; children: (ctx: GuardContext) => ReactNode }) {
  const user = useCurrentUser();
  const project = useMaemusae((s) => s.projects.find((p) => p.id === projectId));
  if (!project) return <Blocked title="프로젝트를 찾을 수 없어요" body="주소가 잘못되었거나 삭제된 프로젝트예요." />;
  const role = roleOf(project, user.id);
  if (!role) return <Blocked title="이 프로젝트의 멤버가 아니에요" body="프로젝트 관리자에게 초대를 요청해 주세요." />;
  if (need === "admin" && role !== "ADMIN") return <Blocked title="프로젝트 관리자만 볼 수 있어요" body="멤버 권한은 관리자만 바꿀 수 있어요." />;
  return <>{children({ project, role, isAdmin: role === "ADMIN" })}</>;
}
