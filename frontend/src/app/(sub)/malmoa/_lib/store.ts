"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { localDay } from "./format";
import { levelOf } from "./levels";
import { SEED_XP, seedMeetings, seedXpLog } from "./seed";
import type { LevelUp, Meeting, MeetingSource, XpEntry } from "./types";

/*
  말모아 목 데이터 저장소.
  백엔드에 회의·변환·경험치 API가 만들어지기 전까지, 같은 동작을 브라우저 안에서 흉내 낸다.
  - 새로고침해도 남도록 localStorage에 저장한다.
  - 변환(음성→텍스트, 사진→글자)은 시간 지연으로 흉내 낸다. 진행 중에 새로고침하면 "실패"로 표시하고 다시 시도할 수 있다.
  - 경험치·연속 기록 계산은 화면용이다. 실제로는 서버가 같은 계산을 해야 한다(어뷰징 방지).
*/

const TICK_MS = 450;
const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Math.random()).slice(2));
const nowIso = () => new Date().toISOString();

export interface NewMeeting {
  fileName: string;
  source: MeetingSource;
  sizeBytes: number;
  durationSec: number | null;
}

interface State {
  meetings: Meeting[];
  xp: number;
  xpLog: XpEntry[];
  streak: number;
  lastActiveDay: string | null;
  seeded: boolean;
  // 저장하지 않는 값
  hydrated: boolean;
  levelUp: LevelUp | null;

  addMeeting: (input: NewMeeting) => string;
  retry: (id: string) => void;
  dismissLevelUp: () => void;
  reset: () => void;
  finishHydration: () => void;
}

const timers = new Map<string, ReturnType<typeof setInterval>>();

const stageFor = (m: Meeting, progress: number) => {
  if (m.source === "image") return "사진에서 글자 읽는 중";
  const total = Math.max(1, Math.ceil((m.durationSec ?? 300) / 300));
  return `구간 ${Math.min(total, Math.floor((progress / 100) * total) + 1)}/${total} 변환 중`;
};

export const useMalmoa = create<State>()(
  persist(
    (set, get) => {
      const patch = (id: string, p: Partial<Meeting>) => set((s) => ({ meetings: s.meetings.map((m) => (m.id === id ? { ...m, ...p } : m)) }));

      function award(m: Meeting) {
        const { xp, streak, lastActiveDay } = get();
        const today = localDay(new Date());
        const yesterday = localDay(new Date(Date.now() - 86_400_000));
        const nextStreak = lastActiveDay === today ? streak : lastActiveDay === yesterday ? streak + 1 : 1;
        const base = m.source === "image" ? 20 : 50;
        const lengthBonus = m.durationSec ? Math.floor(m.durationSec / 600) * 5 : 0;
        const streakBonus = lastActiveDay === today ? 0 : 5 * Math.min(nextStreak - 1, 7);
        const amount = base + lengthBonus + streakBonus;
        const nextXp = xp + amount;
        const from = levelOf(xp);
        const to = levelOf(nextXp);
        set((s) => ({
          xp: nextXp,
          streak: nextStreak,
          lastActiveDay: today,
          xpLog: [{ id: uid(), at: nowIso(), amount, reason: m.source === "image" ? "사진 글자 읽기 완료" : "회의 변환 완료" }, ...s.xpLog].slice(0, 50),
          levelUp: to > from ? { from, to } : s.levelUp,
        }));
      }

      function run(id: string) {
        if (timers.has(id)) return;
        patch(id, { status: "QUEUED", progress: 0, stage: "변환 순서 대기 중", errorMessage: null });
        let progress = 0;
        const timer = setInterval(() => {
          const m = get().meetings.find((x) => x.id === id);
          if (!m) {
            clearInterval(timer);
            timers.delete(id);
            return;
          }
          progress = Math.min(100, progress + (m.source === "image" ? 20 : 8));
          if (progress >= 100) {
            clearInterval(timer);
            timers.delete(id);
            const finished: Meeting = { ...m, status: "COMPLETED", progress: null, stage: null, transcriptReady: true };
            patch(id, { status: "COMPLETED", progress: null, stage: null, transcriptReady: true });
            award(finished);
            return;
          }
          patch(id, { status: "TRANSCRIBING", progress, stage: stageFor(m, progress) });
        }, TICK_MS);
        timers.set(id, timer);
      }

      return {
        meetings: [],
        xp: 0,
        xpLog: [],
        streak: 0,
        lastActiveDay: null,
        seeded: false,
        hydrated: false,
        levelUp: null,

        addMeeting: (input) => {
          const id = uid();
          const meeting: Meeting = {
            id, ...input, createdAt: nowIso(), status: "QUEUED", progress: 0,
            stage: input.source === "image" ? "글자 읽기 대기" : "변환 대기", errorMessage: null, transcriptReady: false, minutesReady: false,
          };
          set((s) => ({ meetings: [meeting, ...s.meetings] }));
          run(id);
          return id;
        },
        retry: (id) => run(id),
        dismissLevelUp: () => set({ levelUp: null }),
        reset: () => {
          for (const t of timers.values()) clearInterval(t);
          timers.clear();
          set({ meetings: seedMeetings(), xp: SEED_XP, xpLog: seedXpLog(), streak: 0, lastActiveDay: null, seeded: true, levelUp: null });
        },
        // 저장된 값을 불러온 뒤 한 번 부른다: 처음이면 예시 데이터를 채우고, 진행 중이던 작업은 실패로 바꾼다
        finishHydration: () => {
          if (!get().seeded) get().reset();
          set((s) => ({
            hydrated: true,
            meetings: s.meetings.map((m) =>
              m.status === "QUEUED" || m.status === "TRANSCRIBING" || m.status === "SUMMARIZING"
                ? { ...m, status: "FAILED" as const, progress: null, stage: null, errorMessage: "페이지가 새로 고쳐져 중단되었습니다. 다시 시도하면 처음부터 변환합니다." }
                : m,
            ),
          }));
        },
      };
    },
    {
      name: "malmoa-mock",
      skipHydration: true,
      partialize: (s) => ({ meetings: s.meetings, xp: s.xp, xpLog: s.xpLog, streak: s.streak, lastActiveDay: s.lastActiveDay, seeded: s.seeded }),
    },
  ),
);
