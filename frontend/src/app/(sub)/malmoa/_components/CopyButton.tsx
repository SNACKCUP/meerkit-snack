"use client";

import { useState, type ReactNode } from "react";

import { copyText } from "../_lib/clipboard";
import { PxButton, type PxVariant } from "./px";

// 누르면 복사하고 잠깐 "복사했어요!"로 바뀌는 버튼
export function CopyButton({ text, children, variant = "ghost", hint }: { text: () => string; children: ReactNode; variant?: PxVariant; hint?: string }) {
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");
  async function onClick() {
    setState((await copyText(text())) ? "ok" : "fail");
    setTimeout(() => setState("idle"), 2000);
  }
  return (
    <div className="grid justify-items-start gap-1">
      <PxButton variant={state === "fail" ? "pink" : state === "ok" ? "mint" : variant} onClick={() => void onClick()}>
        {state === "ok" ? "복사했어요!" : state === "fail" ? "복사하지 못했어요" : children}
      </PxButton>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}
