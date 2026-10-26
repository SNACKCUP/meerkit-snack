export type MeetingSource = "recording" | "upload" | "image";
export type MeetingStatus = "QUEUED" | "TRANSCRIBING" | "SUMMARIZING" | "COMPLETED" | "FAILED";

export interface Meeting {
  id: string;
  fileName: string;
  source: MeetingSource;
  createdAt: string; // ISO 8601
  sizeBytes: number;
  durationSec: number | null;
  status: MeetingStatus;
  progress: number | null; // 0~100, 처리 중일 때만
  stage: string | null;
  errorMessage: string | null;
  transcriptReady: boolean;
  minutesReady: boolean;
}

export interface XpEntry {
  id: string;
  at: string;
  amount: number;
  reason: string;
}

export interface LevelUp {
  from: number;
  to: number;
}

export interface Segment {
  start: number;
  end: number;
  text: string;
  confidence?: number;
}

export interface MinutesDoc {
  markdown: string;
  generatedAt: string;
  model: string;
  edited: boolean;
}
