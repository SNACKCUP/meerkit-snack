import type { Meeting, XpEntry } from "./types";

const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

const done = (id: string, fileName: string, source: Meeting["source"], minAgo: number, sizeBytes: number, durationSec: number | null): Meeting => ({
  id, fileName, source, createdAt: ago(minAgo), sizeBytes, durationSec,
  status: "COMPLETED", progress: null, stage: null, errorMessage: null, transcriptReady: true, minutesReady: source !== "image",
});

// 처음 열었을 때 보이는 예시 회의. "데이터 초기화"로 언제든 되돌릴 수 있다.
export function seedMeetings(): Meeting[] {
  return [
    done("seed-3", "IMG_6240.jpg", "image", 60 * 20, 1_300_000, null),
    done("seed-2", "주간 스프린트 회의.m4a", "upload", 60 * 30, 14_100_000, 30 * 60),
    done("seed-1", "말모아_녹음_예시.webm", "recording", 60 * 52, 547_000, 70),
  ];
}

export function seedXpLog(): XpEntry[] {
  return [
    { id: "seed-x2", at: ago(60 * 30), amount: 35, reason: "회의 변환 완료" },
    { id: "seed-x1", at: ago(60 * 52), amount: 25, reason: "회의 변환 완료" },
  ];
}

export const SEED_XP = 60;
