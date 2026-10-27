"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { formatClock } from "../_lib/format";
import { useRecorder } from "../_lib/recorder";
import { PxButton, pxButtonClass } from "./px";

// 홈이 아닌 화면에서 녹음 중이면 오른쪽 아래에 뜨는 작은 녹음 막대. 종료는 실수 방지를 위해 홈에서만 한다.
export function RecordingDock() {
  const r = useRecorder();
  const path = usePathname();
  if ((r.state !== "recording" && r.state !== "paused") || path === "/malmoa/home") return null;
  return (
    <div role="status" aria-label="녹음 상태" className="w98-out fixed bottom-4 right-4 z-40 flex flex-wrap items-center gap-3 p-3 shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]">
      <span className="font-pixel flex items-center gap-2 text-lg">
        {r.state === "recording" ? <span className="mp-blink text-[#b00000]">●</span> : <span>Ⅱ</span>}
        {r.state === "recording" ? "녹음 중" : "일시정지"} {formatClock(r.elapsed)}
      </span>
      {r.state === "recording" ? <PxButton size="sm" variant="gold" onClick={r.pause}>일시정지</PxButton> : <PxButton size="sm" variant="sky" onClick={r.resume}>재개</PxButton>}
      <Link href="/malmoa/home" className={pxButtonClass("mint", "sm")}>녹음 화면으로</Link>
    </div>
  );
}
