"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEMO_USERS, SEED_DOCS, SEED_PROJECTS, emptyDoc, makeCandidates } from "./seed";
import type { Candidate, DemoUser, Member, Note, Project, ProjectRole, RequirementDoc } from "./types";

/*
  매무새 목 데이터 저장소.
  백엔드에 프로젝트·멤버·초대·요구사항 API가 만들어지기 전까지, 같은 동작을 브라우저 안에서 흉내 낸다.
  - 새로고침해도 남도록 localStorage에 저장한다.
  - AI가 일하는 구간(분류, 다시 정제, 확정)은 시간 지연으로 흉내 낸다.
  - 권한 검사는 화면용이다. 실제로는 서버가 같은 검사를 해야 한다.
*/

export const ANALYZE_MS = 4800;
export const REFINE_MS = 3200;
export const CONFIRM_MS = 2600;
const INVITE_DAYS = 7;
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Math.random()).slice(2));
const nowIso = () => new Date().toISOString();

type Result = { ok: true } | { ok: false; error: string };
const fail = (error: string): Result => ({ ok: false, error });

export function roleOf(project: Project | undefined, userId: string): ProjectRole | null {
  const m = project?.members.find((x) => x.userId === userId && x.status === "active");
  return m ? m.role : null;
}
const activeAdmins = (p: Project) => p.members.filter((m) => m.status === "active" && m.role === "ADMIN");

interface State {
  projects: Project[];
  docs: Record<string, RequirementDoc>;
  currentUserId: string;

  setCurrentUser: (id: string) => void;
  createProject: (input: { name: string; startDate: string; endDate: string; inviteEmails: string[] }) => string;
  inviteMember: (projectId: string, email: string) => Result;
  changeRole: (projectId: string, memberId: string, role: ProjectRole) => Result;
  removeMember: (projectId: string, memberId: string) => Result;
  acceptInvite: (token: string) => { ok: true; projectId: string } | { ok: false; error: string };

  startAnalysis: (projectId: string, prompt: string, files: string[]) => void;
  refine: (projectId: string, prompt: string, files: string[]) => void;
  updateCandidate: (projectId: string, id: string, patch: Partial<Candidate>) => void;
  addCandidate: (projectId: string) => string;
  removeCandidate: (projectId: string, id: string) => void;
  setLastViewed: (projectId: string, id: string | null) => void;
  addNote: (projectId: string, candidateId: string, text: string) => void;
  saveDraft: (projectId: string) => void;
  confirm: (projectId: string) => Result;
  reopen: (projectId: string) => Result;
  finishPending: () => void;
  reset: () => void;
}

const initial = () => ({ projects: structuredClone(SEED_PROJECTS), docs: structuredClone(SEED_DOCS), currentUserId: "u1" });

export const useMaemusae = create<State>()(
  persist(
    (set, get) => {
      const patchDoc = (pid: string, fn: (d: RequirementDoc) => Partial<RequirementDoc>) =>
        set((s) => ({ docs: { ...s.docs, [pid]: { ...(s.docs[pid] ?? emptyDoc()), ...fn(s.docs[pid] ?? emptyDoc()) } } }));
      const patchProject = (pid: string, fn: (p: Project) => Project) => set((s) => ({ projects: s.projects.map((p) => (p.id === pid ? fn(p) : p)) }));
      const me = () => get().currentUserId;
      const meAdmin = (pid: string) => roleOf(get().projects.find((p) => p.id === pid), me()) === "ADMIN";
      const userName = (id: string) => DEMO_USERS.find((u) => u.id === id)?.name ?? "알 수 없음";

      // 오래 걸리는 작업은 시간이 지난 뒤 결과를 채운다
      const afterAnalysis = (pid: string, refined: boolean) =>
        patchDoc(pid, (d) => ({
          status: "ready",
          pendingSince: null,
          candidates: refined
            ? d.candidates.map((c) => (c.question && c.answer.trim() ? { ...c, question: null, description: `${c.description} (답변 반영: ${c.answer.trim().split("\n")[0]})` } : c))
            : makeCandidates(8),
          notes: refined ? d.notes : [],
          savedAt: null,
        }));
      const afterConfirm = (pid: string) => patchDoc(pid, () => ({ status: "confirmed", pendingSince: null, confirmedAt: nowIso() }));

      return {
        ...initial(),

        setCurrentUser: (id) => set({ currentUserId: id }),

        createProject: ({ name, startDate, endDate, inviteEmails }) => {
          const id = uid();
          const user = DEMO_USERS.find((u) => u.id === me());
          const creator: Member = { id: uid(), userId: me(), name: user?.name ?? "나", email: user?.email ?? "", role: "ADMIN", status: "active" };
          const invited: Member[] = inviteEmails.filter(emailOk).map((email) => ({
            id: uid(), userId: null, name: email.split("@")[0], email, role: "MEMBER", status: "invited",
            token: uid(), expiresAt: new Date(Date.now() + INVITE_DAYS * 86400000).toISOString(),
          }));
          const project: Project = { id, name, startDate, endDate, createdBy: me(), createdAt: nowIso(), members: [creator, ...invited] };
          set((s) => ({ projects: [project, ...s.projects], docs: { ...s.docs, [id]: emptyDoc() } }));
          return id;
        },

        inviteMember: (pid, email) => {
          const clean = email.trim();
          if (!emailOk(clean)) return fail("이메일 형식이 올바르지 않아요.");
          const project = get().projects.find((p) => p.id === pid);
          if (!project) return fail("프로젝트를 찾을 수 없어요.");
          if (!meAdmin(pid)) return fail("멤버 초대는 프로젝트 관리자만 할 수 있어요.");
          if (project.members.some((m) => m.email.toLowerCase() === clean.toLowerCase())) return fail("이미 멤버이거나 초대한 이메일이에요.");
          patchProject(pid, (p) => ({
            ...p,
            members: [...p.members, { id: uid(), userId: null, name: clean.split("@")[0], email: clean, role: "MEMBER", status: "invited", token: uid(), expiresAt: new Date(Date.now() + INVITE_DAYS * 86400000).toISOString() }],
          }));
          return { ok: true };
        },

        changeRole: (pid, memberId, role) => {
          const project = get().projects.find((p) => p.id === pid);
          const member = project?.members.find((m) => m.id === memberId);
          if (!project || !member) return fail("멤버를 찾을 수 없어요.");
          if (!meAdmin(pid)) return fail("권한 변경은 프로젝트 관리자만 할 수 있어요.");
          if (member.role === "ADMIN" && role === "MEMBER" && member.status === "active" && activeAdmins(project).length <= 1) return fail("마지막 관리자는 일반으로 바꿀 수 없어요. 다른 멤버를 먼저 관리자로 지정해 주세요.");
          patchProject(pid, (p) => ({ ...p, members: p.members.map((m) => (m.id === memberId ? { ...m, role } : m)) }));
          return { ok: true };
        },

        removeMember: (pid, memberId) => {
          const project = get().projects.find((p) => p.id === pid);
          const member = project?.members.find((m) => m.id === memberId);
          if (!project || !member) return fail("멤버를 찾을 수 없어요.");
          if (!meAdmin(pid)) return fail("멤버 제거는 프로젝트 관리자만 할 수 있어요.");
          if (member.role === "ADMIN" && member.status === "active" && activeAdmins(project).length <= 1) return fail("마지막 관리자는 뺄 수 없어요. 다른 멤버를 먼저 관리자로 지정해 주세요.");
          patchProject(pid, (p) => ({ ...p, members: p.members.filter((m) => m.id !== memberId) }));
          return { ok: true };
        },

        acceptInvite: (token) => {
          const project = get().projects.find((p) => p.members.some((m) => m.token === token));
          const member = project?.members.find((m) => m.token === token);
          if (!project || !member) return { ok: false, error: "초대 링크가 올바르지 않아요." };
          if (member.expiresAt && new Date(member.expiresAt).getTime() < Date.now()) return { ok: false, error: "초대 유효기간(7일)이 지났어요. 관리자에게 다시 초대를 요청해 주세요." };
          if (project.members.some((m) => m.userId === me() && m.status === "active")) return { ok: false, error: "이미 이 프로젝트의 멤버예요." };
          patchProject(project.id, (p) => ({ ...p, members: p.members.map((m) => (m.id === member.id ? { ...m, userId: me(), name: userName(me()), status: "active", token: undefined, expiresAt: undefined } : m)) }));
          return { ok: true, projectId: project.id };
        },

        startAnalysis: (pid, prompt, files) => {
          patchDoc(pid, () => ({ status: "analyzing", prompt, files, pendingSince: Date.now() }));
          setTimeout(() => afterAnalysis(pid, false), ANALYZE_MS);
        },
        refine: (pid, prompt, files) => {
          patchDoc(pid, (d) => ({ status: "analyzing", prompt: prompt || d.prompt, files: files.length ? files : d.files, pendingSince: Date.now() }));
          setTimeout(() => afterAnalysis(pid, true), REFINE_MS);
        },
        updateCandidate: (pid, id, patch) => patchDoc(pid, (d) => ({ candidates: d.candidates.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
        addCandidate: (pid) => {
          const id = uid();
          patchDoc(pid, (d) => ({
            candidates: [...d.candidates, { id, code: `REQ-${String(d.candidates.length + 1).padStart(3, "0")}`, name: "새 요구사항", kind: "기능", priority: "중간", description: "", quote: "(직접 추가한 항목이라 근거 문장이 없어요)", question: null, answer: "", included: true }],
          }));
          return id;
        },
        removeCandidate: (pid, id) => patchDoc(pid, (d) => ({ candidates: d.candidates.filter((c) => c.id !== id), notes: d.notes.filter((n) => n.candidateId !== id), lastViewedId: d.lastViewedId === id ? null : d.lastViewedId })),
        setLastViewed: (pid, id) => patchDoc(pid, () => ({ lastViewedId: id })),
        addNote: (pid, candidateId, text) => {
          const note: Note = { id: uid(), candidateId, text, author: userName(me()), at: nowIso() };
          patchDoc(pid, (d) => ({ notes: [note, ...d.notes] }));
        },
        saveDraft: (pid) => patchDoc(pid, () => ({ savedAt: nowIso() })),

        confirm: (pid) => {
          if (!meAdmin(pid)) return fail("요구사항 확정은 프로젝트 관리자만 할 수 있어요.");
          patchDoc(pid, () => ({ status: "confirming", pendingSince: Date.now(), savedAt: nowIso() }));
          setTimeout(() => afterConfirm(pid), CONFIRM_MS);
          return { ok: true };
        },
        reopen: (pid) => {
          if (!meAdmin(pid)) return fail("확정 뒤 수정은 프로젝트 관리자만 할 수 있어요.");
          patchDoc(pid, () => ({ status: "ready", confirmedAt: null }));
          return { ok: true };
        },

        // 새로고침으로 멈춘 작업을 이어서 끝낸다
        finishPending: () => {
          for (const [pid, d] of Object.entries(get().docs)) {
            if (d.status === "analyzing") afterAnalysis(pid, d.candidates.length > 0);
            if (d.status === "confirming") afterConfirm(pid);
          }
        },
        reset: () => set(initial()),
      };
    },
    {
      name: "maemusae-mock-v1",
      skipHydration: true,
      partialize: (s) => ({ projects: s.projects, docs: s.docs, currentUserId: s.currentUserId }),
    },
  ),
);

export function useCurrentUser(): DemoUser {
  const id = useMaemusae((s) => s.currentUserId);
  return DEMO_USERS.find((u) => u.id === id) ?? DEMO_USERS[0];
}
