"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// 녹음 설정(마이크, 회의실 모드)은 이 브라우저에만 기억한다.
interface Prefs {
  deviceId: string;
  meetingRoom: boolean;
  setDeviceId: (id: string) => void;
  setMeetingRoom: (on: boolean) => void;
}

export const useRecorderPrefs = create<Prefs>()(
  persist(
    (set) => ({
      deviceId: "",
      meetingRoom: true,
      setDeviceId: (deviceId) => set({ deviceId }),
      setMeetingRoom: (meetingRoom) => set({ meetingRoom }),
    }),
    { name: "malmoa-recorder", skipHydration: true },
  ),
);
