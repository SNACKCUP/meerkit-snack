"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// 메모장 창의 내용. 이 브라우저에만 저장한다. (Shell에서 마운트 뒤에 수동으로 불러온다)
interface MemoState {
  text: string;
  setText: (text: string) => void;
}

export const useMemoPad = create<MemoState>()(
  persist((set) => ({ text: "", setText: (text) => set({ text }) }), { name: "malmoa-memo", skipHydration: true }),
);
