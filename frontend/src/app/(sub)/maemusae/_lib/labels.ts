import type { DocStatus } from "./types";

export const DOC_STATUS: Record<DocStatus, { label: string; tone: "plain" | "yellow" | "dark" | "orange" }> = {
  empty: { label: "시작 전", tone: "plain" },
  analyzing: { label: "AI 분석 중", tone: "yellow" },
  ready: { label: "확정 대기", tone: "yellow" },
  confirming: { label: "확정 중", tone: "yellow" },
  confirmed: { label: "확정됨", tone: "dark" },
};

export const ROLE_LABEL = { ADMIN: "관리자", MEMBER: "일반" } as const;
