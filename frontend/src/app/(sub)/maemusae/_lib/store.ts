"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ConfirmedDoc, ConfirmedItem } from "./types";

/*
  매무새 목 데이터 저장소.
  요구사항 후보·입력·분석·버전은 서버 API(queries.ts)를 쓴다.
  여기에는 확정(M4) API가 생기기 전까지 "확정됨" 상태와 확정 기록만 브라우저 안에서 흉내 낸다.
  - 실제 프로젝트 id를 키로 쓰고, 새로고침해도 남도록 localStorage에 저장한다.
  - 확정 같은 관리자 검사는 화면이 프로젝트 역할(서버 응답)로 막는다. M4에서 서버가 같은 검사를 한다.
*/

const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Math.random()).slice(2));

interface Confirmed {
  at: string;
  by: string;
  items: ConfirmedItem[];
}

interface State {
  /** 프로젝트별 지금 확정된 내용. 확정 후 수정을 누르면 지운다 */
  confirmed: Record<string, Confirmed>;
  /** 프로젝트별 확정 문서 기록 (최신이 앞) */
  history: Record<string, ConfirmedDoc[]>;

  confirm: (projectId: string, by: string, items: ConfirmedItem[]) => void;
  reopen: (projectId: string) => void;
  reset: () => void;
}

const initial = () => ({ confirmed: {} as Record<string, Confirmed>, history: {} as Record<string, ConfirmedDoc[]> });

export const useMaemusae = create<State>()(
  persist(
    (set) => ({
      ...initial(),

      confirm: (pid, by, items) => {
        const at = new Date().toISOString();
        set((s) => {
          const prev = s.history[pid] ?? [];
          const entry: ConfirmedDoc = { id: uid(), projectId: pid, title: "요구사항정의서", kind: "요구사항정의서", revision: prev.length + 1, confirmedAt: at, confirmedBy: by, items };
          return { confirmed: { ...s.confirmed, [pid]: { at, by, items } }, history: { ...s.history, [pid]: [entry, ...prev] } };
        });
      },
      reopen: (pid) =>
        set((s) => {
          const rest = { ...s.confirmed };
          delete rest[pid];
          return { confirmed: rest };
        }),
      reset: () => set(initial()),
    }),
    {
      // v4까지는 후보·입력도 브라우저에 있었다. 모양이 달라서 키를 바꿔 예전 목 데이터는 버린다
      name: "maemusae-mock-v5",
      skipHydration: true,
      partialize: (s) => ({ confirmed: s.confirmed, history: s.history }),
    },
  ),
);
