"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// 녹음 설정(마이크, 회의실 모드)은 이 브라우저에만 기억한다.
interface Prefs {
  deviceId: string;
  meetingRoom: boolean;
  reduceMotion: boolean;
  setDeviceId: (id: string) => void;
  setMeetingRoom: (on: boolean) => void;
  setReduceMotion: (on: boolean) => void;
}

export const useRecorderPrefs = create<Prefs>()(
  persist(
    (set) => ({
      deviceId: "",
      meetingRoom: true,
      reduceMotion: false,
      setDeviceId: (deviceId) => set({ deviceId }),
      setMeetingRoom: (meetingRoom) => set({ meetingRoom }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
    }),
    { name: "malmoa-recorder", skipHydration: true },
  ),
);
