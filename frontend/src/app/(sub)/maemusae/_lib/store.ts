"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { emptyDoc, makeCandidates } from "./seed";
import type { Candidate, ConfirmedDoc, Note, NoteField, RequirementDoc } from "./types";

/*
  매무새 목 데이터 저장소.
  프로젝트·멤버·초대·올린 파일은 서버 API(queries.ts)를 쓴다.
  여기에는 AI 분석(M3)·확정(M4) API가 생기기 전까지 요구사항 후보·입력한 내용·확정 기록만 브라우저 안에서 흉내 낸다.
  - 실제 프로젝트 id를 키로 쓰고, 새로고침해도 남도록 localStorage에 저장한다.
  - AI가 일하는 구간(분류, 다시 정제, 확정)은 시간 지연으로 흉내 낸다.
  - 확정 같은 관리자 검사는 화면이 프로젝트 역할(서버 응답)로 막는다. M4에서 서버가 같은 검사를 한다.
*/

export const ANALYZE_MS = 4800;
export const REFINE_MS = 3200;
export const CONFIRM_MS = 2600;
const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Math.random()).slice(2));
const nowIso = () => new Date().toISOString();

interface State {
  docs: Record<string, RequirementDoc>;
  /** 프로젝트별 확정 문서 기록 (최신이 앞) */
  history: Record<string, ConfirmedDoc[]>;

  startAnalysis: (projectId: string, prompt: string, files: string[]) => void;
  refine: (projectId: string, prompt: string, files: string[]) => void;
  updateCandidate: (projectId: string, id: string, patch: Partial<Candidate>) => void;
  addCandidate: (projectId: string) => string;
  removeCandidate: (projectId: string, id: string) => void;
  setLastViewed: (projectId: string, id: string | null) => void;
  addNote: (projectId: string, candidateId: string, field: NoteField, text: string, author: string) => void;
  saveDraft: (projectId: string) => void;
  /** by: 확정을 시작한 사람 이름 (확정 문서 기록에 남는다) */
  confirm: (projectId: string, by: string) => void;
  reopen: (projectId: string) => void;
  finishPending: () => void;
  reset: () => void;
}

const initial = () => ({ docs: {} as Record<string, RequirementDoc>, history: {} as Record<string, ConfirmedDoc[]> });

export const useMaemusae = create<State>()(
  persist(
    (set, get) => {
      const patchDoc = (pid: string, fn: (d: RequirementDoc) => Partial<RequirementDoc>) =>
        set((s) => ({ docs: { ...s.docs, [pid]: { ...(s.docs[pid] ?? emptyDoc()), ...fn(s.docs[pid] ?? emptyDoc()) } } }));

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
      const afterConfirm = (pid: string) => {
        const at = nowIso();
        const doc = get().docs[pid] ?? emptyDoc();
        const by = doc.confirmedBy ?? "";
        patchDoc(pid, () => ({ status: "confirmed", pendingSince: null, confirmedAt: at }));
        set((s) => {
          const prev = s.history[pid] ?? [];
          const entry: ConfirmedDoc = { id: uid(), projectId: pid, title: "요구사항정의서", kind: "요구사항정의서", revision: prev.length + 1, confirmedAt: at, confirmedBy: by, items: structuredClone(doc.candidates.filter((c) => c.included)) };
          return { history: { ...s.history, [pid]: [entry, ...prev] } };
        });
      };

      return {
        ...initial(),

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
            candidates: [...d.candidates, { id, code: `REQ-${String(d.candidates.length + 1).padStart(3, "0")}`, name: "새 요구사항", kind: "FUNCTIONAL", priority: "중간", description: "", quote: "(직접 추가한 항목이라 근거 문장이 없어요)", question: null, answer: "", included: true, manual: true }],
          }));
          return id;
        },
        removeCandidate: (pid, id) => patchDoc(pid, (d) => ({ candidates: d.candidates.filter((c) => c.id !== id), notes: d.notes.filter((n) => n.candidateId !== id), lastViewedId: d.lastViewedId === id ? null : d.lastViewedId })),
        setLastViewed: (pid, id) => patchDoc(pid, () => ({ lastViewedId: id })),
        addNote: (pid, candidateId, field, text, author) => {
          // 후보 하나에 입력 칸(설명, AI 질문 답변)마다 한 건씩만 둔다. 다시 고치면 그 항목을 최신 내용으로 바꾼다
          const note: Note = { id: uid(), candidateId, field, text, author, at: nowIso() };
          patchDoc(pid, (d) => {
            const same = (n: Note) => n.candidateId === candidateId && n.field === field;
            return { notes: d.notes.some(same) ? d.notes.map((n) => (same(n) ? { ...note, id: n.id } : n)) : [note, ...d.notes] };
          });
        },
        saveDraft: (pid) => patchDoc(pid, () => ({ savedAt: nowIso() })),

        confirm: (pid, by) => {
          patchDoc(pid, () => ({ status: "confirming", pendingSince: Date.now(), savedAt: nowIso(), confirmedBy: by }));
          setTimeout(() => afterConfirm(pid), CONFIRM_MS);
        },
        reopen: (pid) => patchDoc(pid, () => ({ status: "ready", confirmedAt: null })),

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
      name: "maemusae-mock-v4",
      skipHydration: true,
      partialize: (s) => ({ docs: s.docs, history: s.history }),
    },
  ),
);
