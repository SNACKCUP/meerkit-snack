import type { CSSProperties } from "react";

// 말모아 전용 색 ("Night Quest": 어두운 남색 바탕 + 네온 포인트).
// Meerkit 컴포넌트(입력창, 체크박스, 대화상자)도 이 값을 따라간다.
// 적용은 Shell에서 한 번만 한다. (CLAUDE.md의 "인라인 스타일 금지"의 예외: .claude/harness/rules/tailwind-v4.md 참고)
export const NIGHT = "#14122b";
export const PANEL = "#1f1b45";
export const LINE = "#3b3478";
export const MINT = "#3ddc97";
export const GOLD = "#ffd23f";
export const PINK = "#ff4d8d";
export const SKY = "#4cc9f0";
export const PAPER = "#f4efe0";
export const INK = "#14122b";

export const THEME_VARS: Record<string, string> = {
  "--mk-background": NIGHT,
  "--mk-foreground": "#f1eeff",
  "--mk-card": PANEL,
  "--mk-surface": PANEL,
  "--mk-muted": "#2a2559",
  "--mk-muted-foreground": "#a9a3d6",
  "--mk-accent": "#2a2559",
  "--mk-border": LINE,
  "--mk-primary": MINT,
  "--mk-primary-foreground": INK,
  "--mk-brand": SKY,
  "--mk-destructive": PINK,
  "--mk-mint": MINT,
  "--mk-gold": GOLD,
  "--mk-pink": PINK,
  "--mk-sky": SKY,
  "--mk-paper": PAPER,
  "--mk-ink": INK,
  // 픽셀 테두리·그림자에 쓰는 가장 어두운 색
  "--mk-px-edge": "#0a0919",
  "--mk-radius": "0px",
  "--mk-shadow-soft": "4px 4px 0 0 rgba(0, 0, 0, 0.45)",
};

export const THEME_STYLE = { ...THEME_VARS } as CSSProperties;
