"use client";

import { useRef } from "react";

import { formatClock } from "../_lib/format";
import { useMemoPad } from "../_lib/memo";
import { useRecorder } from "../_lib/recorder";
import { PxButton } from "./px";

// 메모장: 회의 중 적어 두는 메모. 녹음 중이면 "시각 넣기"가 지금 녹음 시각을 찍어 준다.
export function MemoPanel() {
  const text = useMemoPad((s) => s.text);
  const setText = useMemoPad((s) => s.setText);
  const r = useRecorder();
  const ref = useRef<HTMLTextAreaElement>(null);
  const recording = r.state === "recording" || r.state === "paused";

  function stamp() {
    const now = new Date();
    const clock = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const tag = recording ? `[녹음 ${formatClock(r.elapsed)}] ` : `[${clock}] `;
    const el = ref.current;
    const at = el ? el.selectionStart : text.length;
    const end = el ? el.selectionEnd : text.length;
    const next = text.slice(0, at) + tag + text.slice(end);
    setText(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(at + tag.length, at + tag.length);
    });
  }
  function download() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    a.download = "말모아_메모.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  return (
    <div className="grid h-full grid-rows-[1fr_auto] gap-2 p-3">
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="메모"
        placeholder="회의 중 메모를 적어 두세요. 이 브라우저에만 저장됩니다."
        className="w98-in min-h-40 w-full resize-none bg-white p-2 font-mono text-sm text-black outline-none placeholder:text-[#808080]"
      />
      <div className="flex flex-wrap items-center gap-2">
        <PxButton size="sm" onClick={stamp}>{recording ? "녹음 시각 넣기" : "시각 넣기"}</PxButton>
        <PxButton size="sm" variant="ghost" disabled={!text} onClick={download}>.txt로 저장</PxButton>
        <PxButton size="sm" variant="pink" disabled={!text} onClick={() => { if (window.confirm("메모를 모두 지울까요?")) setText(""); }}>지우기</PxButton>
        <span className="ml-auto text-xs text-[#404040]">{text.length.toLocaleString()}자</span>
      </div>
    </div>
  );
}
