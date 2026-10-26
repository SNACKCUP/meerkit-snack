import type { DocStatus } from "./types";

export const DOC_STATUS: Record<DocStatus, { label: string; tone: "plain" | "yellow" | "dark" | "orange" }> = {
  empty: { label: "시작 전", tone: "plain" },
  analyzing: { label: "AI 분석 중", tone: "yellow" },
  ready: { label: "확정 대기", tone: "yellow" },
  confirming: { label: "확정 중", tone: "yellow" },
  confirmed: { label: "확정됨", tone: "dark" },
};

export const ROLE_LABEL = { ADMIN: "관리자", MEMBER: "일반" } as const;

export const DOC_KINDS = ["요구사항정의서", "기능정의서", "중간보고서"] as const;
export const revisionLabel = (revision: number) => (revision <= 1 ? "확정" : `수정 후 확정 (v${revision})`);
