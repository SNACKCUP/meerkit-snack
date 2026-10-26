"use client";

import { useEffect, type ReactNode } from "react";

import { THEME_STYLE, THEME_VARS } from "../_lib/theme";

// 말모아 전체의 틀: 전용 색을 한 번만 입힌다. (M2에서 상단 바·내비 추가)
export function Shell({ children }: { children: ReactNode }) {
  // 대화상자는 body 아래에 그려지므로, 색을 html에도 입혀 둔다 (떠날 때 되돌린다)
  useEffect(() => {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(THEME_VARS)) root.style.setProperty(k, v);
    return () => {
      for (const k of Object.keys(THEME_VARS)) root.style.removeProperty(k);
    };
  }, []);

  return (
    <div style={THEME_STYLE} className="min-h-screen bg-background text-foreground antialiased">
      {children}
    </div>
  );
}
