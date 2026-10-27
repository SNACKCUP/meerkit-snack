import type { CSSProperties } from "react";

// 말모아 전용 색 ("Windows 98"): 청록 바탕화면 + 회색 창 + 남색 제목 막대.
// Meerkit 컴포넌트(입력창, 체크박스, 대화상자)도 이 값을 따라간다.
// 적용은 Shell에서 한 번만 한다. (CLAUDE.md의 "인라인 스타일 금지"의 예외: .claude/harness/rules/tailwind-v4.md 참고)
export const DESKTOP = "#008080";
export const FACE = "#c0c0c0";
export const LIGHT = "#dfdfdf";
export const SHADOW = "#808080";
export const NAVY = "#000080";
export const TITLE_END = "#1084d0";
export const BLACK = "#000000";
export const WHITE = "#ffffff";

export const THEME_VARS: Record<string, string> = {
  "--mk-background": FACE,
  "--mk-foreground": BLACK,
  "--mk-card": FACE,
  "--mk-surface": FACE,
  "--mk-muted": LIGHT,
  "--mk-muted-foreground": "#404040",
  "--mk-accent": LIGHT,
  "--mk-border": SHADOW,
  "--mk-primary": NAVY,
  "--mk-primary-foreground": WHITE,
  "--mk-brand": NAVY,
  "--mk-destructive": "#b00000",
  // 말모아 안에서 쓰는 이름 (예전 이름을 유지해 화면 코드를 덜 건드린다): 모두 흰 배경·회색 위에서 읽히는 어두운 색
  "--mk-desktop": DESKTOP,
  "--mk-mint": NAVY,
  "--mk-gold": "#6b5200",
  "--mk-pink": "#b00000",
  "--mk-sky": "#006060",
  "--mk-paper": WHITE,
  "--mk-ink": BLACK,
  "--mk-px-edge": BLACK,
  "--mk-face": FACE,
  "--mk-light": LIGHT,
  "--mk-shade": SHADOW,
  "--mk-title-a": NAVY,
  "--mk-title-b": TITLE_END,
  "--mk-radius": "0px",
  "--mk-shadow-soft": "1px 1px 0 0 #000",
  // 글자 크기: 작고 또렷하게 (Tailwind 글자 크기 변수를 말모아 안에서만 덮어쓴다)
  "--text-sm": "0.8125rem",
  "--text-base": "0.9375rem",
  "--text-lg": "1.0625rem",
  "--text-xl": "1.1875rem",
  "--text-2xl": "1.4rem",
  "--text-3xl": "1.7rem",
  "--text-4xl": "2.05rem",
  "--text-5xl": "2.5rem",
  "--text-6xl": "3.1rem",
};

export const THEME_STYLE = { ...THEME_VARS } as CSSProperties;
