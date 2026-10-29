"use client";

// 매무새 서버 데이터 훅 (TanStack Query). 화면 부품은 이 훅만 쓰고, 서버 호출은 api.ts에 둔다.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/meerkit";

import { mmsApi } from "./api";
import type { ProjectRole } from "./types";

const keys = {
  projects: ["mms", "projects"] as const,
  project: (id: string) => ["mms", "projects", id] as const,
  members: (id: string) => ["mms", "projects", id, "members"] as const,
  invitations: (id: string) => ["mms", "projects", id, "invitations"] as const,
  documents: (id: string) => ["mms", "projects", id, "documents"] as const,
  sources: (id: string, docId: number) => ["mms", "projects", id, "documents", docId, "sources"] as const,
  pages: (id: string, docId: number, sourceId: number) => ["mms", "projects", id, "documents", docId, "sources", sourceId] as const,
  code: (group: string) => ["mms", "codes", group] as const,
};

/** 로그인이 끝난 뒤에만 부른다 (세션 복원 전에 부르면 401) */
function useReady() {
  const { isAuthenticated, isLoading } = useAuth();
  return isAuthenticated && !isLoading;
}

// ---- 프로젝트·멤버 ----

export function useProjects() {
  return useQuery({ queryKey: keys.projects, queryFn: () => mmsApi.listProjects(), enabled: useReady() });
}

export function useProject(id: string) {
  return useQuery({ queryKey: keys.project(id), queryFn: () => mmsApi.getProject(id), enabled: useReady(), retry: false });
}

export function useMembers(id: string) {
  return useQuery({ queryKey: keys.members(id), queryFn: () => mmsApi.listMembers(id), enabled: useReady() });
}

/** 프로젝트를 만들고, 적어 둔 이메일에 초대장을 보낸다. 초대에 실패한 이메일은 돌려준다 */
export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; startDate: string; endDate: string; inviteEmails: string[] }) => {
      const project = await mmsApi.createProject({ name: input.name, start_date: input.startDate, end_date: input.endDate });
      const results = await Promise.allSettled(input.inviteEmails.map((email) => mmsApi.invite(String(project.id), email)));
      const failed = input.inviteEmails.filter((_, i) => results[i].status === "rejected");
      return { project, invited: input.inviteEmails.length - failed.length, failed };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.projects }),
  });
}

export function useChangeRole(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: number; role: ProjectRole }) => mmsApi.changeRole(id, memberId, role),
    onSettled: () => qc.invalidateQueries({ queryKey: keys.project(id) }),
  });
}

export function useRemoveMember(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: number) => mmsApi.removeMember(id, memberId),
    onSettled: () => qc.invalidateQueries({ queryKey: keys.project(id) }),
  });
}

// ---- 초대 ----

/** 대기 중인 초대. 관리자만 볼 수 있어서 enabled로 막는다 */
export function useInvitations(id: string, enabled: boolean) {
  return useQuery({ queryKey: keys.invitations(id), queryFn: () => mmsApi.listInvitations(id), enabled: useReady() && enabled });
}

export function useInvite(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => mmsApi.invite(id, email),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.invitations(id) }),
  });
}

export function useRevokeInvitation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: number) => mmsApi.revokeInvitation(id, invitationId),
    onSettled: () => qc.invalidateQueries({ queryKey: keys.invitations(id) }),
  });
}

/** 초대 링크 내용. 로그인하지 않아도 볼 수 있다 */
export function useInvitationInfo(token: string | null) {
  return useQuery({ queryKey: ["mms", "invitation", token], queryFn: () => mmsApi.lookupInvitation(token!), enabled: !!token, retry: false });
}

/** 초대 링크로 처음 가입할 때 쓸 가입 증표 (인증번호 대신). 아직 가입하지 않은 사람에게만 받는다 */
export function useInvitationSignupProof(token: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["mms", "invitation", token, "signup-proof"],
    queryFn: () => mmsApi.invitationSignupProof(token!),
    enabled: !!token && enabled,
    retry: false,
    staleTime: Infinity,
  });
}

export function useAcceptInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => mmsApi.acceptInvitation(token),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.projects }),
  });
}

// ---- 문서·올린 파일 ----

export function useDocuments(id: string) {
  return useQuery({ queryKey: keys.documents(id), queryFn: () => mmsApi.listDocuments(id), enabled: useReady() });
}

/** 요구사항정의서 문서 (프로젝트를 만들면 서버가 1행 만든다) */
export function useRequirementsDoc(id: string) {
  const q = useDocuments(id);
  return { ...q, data: q.data?.find((d) => d.kind === "REQUIREMENTS") };
}

export function useSources(id: string, docId: number | undefined) {
  return useQuery({ queryKey: keys.sources(id, docId ?? 0), queryFn: () => mmsApi.listSources(id, docId!), enabled: useReady() && !!docId });
}

export function useUploadSource(id: string, docId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { file: File } | { text: string }) => mmsApi.uploadSource(id, docId!, input),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.sources(id, docId ?? 0) });
      qc.invalidateQueries({ queryKey: keys.documents(id) });
    },
  });
}

export function useDeleteSource(id: string, docId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sourceId: number) => mmsApi.deleteSource(id, docId!, sourceId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: keys.sources(id, docId ?? 0) });
      qc.invalidateQueries({ queryKey: keys.documents(id) });
    },
  });
}

export function useSourcePages(id: string, docId: number | undefined, sourceId: number | null) {
  return useQuery({
    queryKey: keys.pages(id, docId ?? 0, sourceId ?? 0),
    queryFn: () => mmsApi.listSourcePages(id, docId!, sourceId!),
    enabled: useReady() && !!docId && !!sourceId,
  });
}

/** 원본 파일을 받아 브라우저 저장으로 넘긴다 */
export async function downloadSource(id: string, docId: number, sourceId: number, filename: string) {
  const blob = await mmsApi.downloadSource(id, docId, sourceId);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---- 공통코드 ----

/** 요구사항 구분 (기능/비기능/제약사항). 관리자가 값을 늘릴 수 있어서 코드에 적지 않고 서버에서 받는다 */
export function useReqKinds() {
  const q = useQuery({ queryKey: keys.code("MMS_REQ_KIND"), queryFn: () => mmsApi.codeGroup("MMS_REQ_KIND"), enabled: useReady(), staleTime: 5 * 60_000 });
  const codes = q.data?.codes ?? [];
  /** 저장된 값이 목록에 없으면(관리자가 끈 값) 코드 그대로 보여 준다 */
  const label = (code: string) => codes.find((c) => c.code === code)?.label ?? code;
  return { codes, label, isLoading: q.isLoading };
}
