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

// 회의 하나당 공유 링크 하나. 끄면 revoked, 다시 켜면 같은 주소가 되살아난다.
export interface Share {
  token: string;
  meetingId: string;
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
}
