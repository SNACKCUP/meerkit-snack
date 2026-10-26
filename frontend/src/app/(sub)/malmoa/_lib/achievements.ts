import { levelOf } from "./levels";
import type { PixelIconName } from "../_components/px";
import type { Meeting, Share } from "./types";

export interface Snapshot {
  meetings: Meeting[];
  shares: Record<string, Share>;
  streak: number;
  xp: number;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: PixelIconName;
  done: (s: Snapshot) => boolean;
}

const completed = (s: Snapshot) => s.meetings.filter((m) => m.status === "COMPLETED");

// 업적은 저장하지 않고 지금 데이터에서 계산한다. (서버가 생기면 서버가 달성 시각까지 기록한다)
export const ACHIEVEMENTS: Achievement[] = [
  { id: "first", title: "첫 회의", desc: "회의를 한 건 기록했어요", icon: "mic", done: (s) => completed(s).length >= 1 },
  { id: "five", title: "단골 서기", desc: "회의를 5건 기록했어요", icon: "star", done: (s) => completed(s).length >= 5 },
  { id: "long", title: "마라톤 회의", desc: "1시간 넘는 회의를 기록했어요", icon: "bolt", done: (s) => completed(s).some((m) => (m.durationSec ?? 0) >= 3600) },
  { id: "minutes", title: "첫 회의록", desc: "AI 회의록을 만들었어요", icon: "doc", done: (s) => s.meetings.some((m) => m.minutesReady) },
  { id: "photo", title: "화이트보드 탐정", desc: "사진 속 글자를 읽었어요", icon: "camera", done: (s) => completed(s).some((m) => m.source === "image") },
  { id: "share", title: "소문내기", desc: "회의록을 공유했어요", icon: "share", done: (s) => Object.keys(s.shares).length > 0 },
  { id: "streak3", title: "3일 연속", desc: "3일 연속으로 기록했어요", icon: "check", done: (s) => s.streak >= 3 },
  { id: "streak7", title: "일주일 개근", desc: "7일 연속으로 기록했어요", icon: "lock", done: (s) => s.streak >= 7 },
  { id: "lv5", title: "기록가", desc: "레벨 5에 도달했어요", icon: "star", done: (s) => levelOf(s.xp) >= 5 },
];
