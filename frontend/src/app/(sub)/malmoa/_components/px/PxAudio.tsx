"use client";

import { useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { formatClock } from "../../_lib/format";

// Windows 98 미디어 플레이어 모양의 오디오 재생기. 브라우저 기본 <audio controls> 대신 쓴다.
// 녹음 직후의 webm은 길이를 알 수 없다고(Infinity) 보고하는 경우가 있어, 알고 있는 길이(durationHint)로 대신한다.
export function PxAudio({ src, label, durationHint, className }: { src: string; label: string; durationHint?: number; className?: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [length, setLength] = useState<number | null>(null);
  const [volume, setVolume] = useState(1);

  const total = length && Number.isFinite(length) ? length : (durationHint ?? 0);
  const seekMax = Math.max(total, time, 1);

  function toggle() {
    const a = ref.current;
    if (!a) return;
    if (a.paused) void a.play().catch(() => setPlaying(false));
    else a.pause();
  }
  function stop() {
    const a = ref.current;
    if (!a) return;
    a.pause();
    a.currentTime = 0;
    setTime(0);
  }
  function seek(v: number) {
    const a = ref.current;
    if (!a) return;
    a.currentTime = v;
    setTime(v);
  }

  return (
    <div role="group" aria-label={label} className={cn("w98-out grid gap-2 p-2 text-black", className)}>
      <audio
        ref={ref}
        src={src}
        preload="metadata"
        className="hidden"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setTime(0); }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setLength(e.currentTarget.duration)}
        onDurationChange={(e) => setLength(e.currentTarget.duration)}
      />
      <div className="flex items-center gap-2">
        <Ctl label={playing ? "일시정지" : "재생"} onClick={toggle}>
          <svg viewBox="0 0 8 8" width="14" height="14" shapeRendering="crispEdges" fill="currentColor" aria-hidden>
            {playing ? <path d="M1 1h2v6H1zM5 1h2v6H5z" /> : <path d="M2 1h1v6H2zM3 2h1v4H3zM4 3h1v2H4z" />}
          </svg>
        </Ctl>
        <Ctl label="정지" onClick={stop}>
          <svg viewBox="0 0 8 8" width="14" height="14" shapeRendering="crispEdges" fill="currentColor" aria-hidden><path d="M1 1h6v6H1z" /></svg>
        </Ctl>
        <input type="range" aria-label={`${label} 재생 위치`} className="w98-range min-w-0 flex-1" min={0} max={seekMax} step={0.1} value={Math.min(time, seekMax)} onChange={(e) => seek(Number(e.target.value))} />
        <span className="font-pixel w98-in bg-black px-2 py-0.5 text-sm tabular-nums text-[#33ff33]" aria-label="재생 시간">
          {formatClock(time).slice(3)} / {formatClock(total).slice(3)}
        </span>
      </div>
      <label className="flex items-center gap-2 text-xs">
        <span className="font-pixel">볼륨</span>
        <input
          type="range"
          aria-label="볼륨"
          className="w98-range w-28"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => {
            const v = Number(e.target.value);
            setVolume(v);
            if (ref.current) ref.current.volume = v;
          }}
        />
      </label>
    </div>
  );
}

function Ctl({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="w98-out grid size-8 shrink-0 place-items-center bg-(--mk-face) text-black outline-none active:shadow-[inset_-1px_-1px_#fff,inset_1px_1px_#0a0a0a,inset_-2px_-2px_#dfdfdf,inset_2px_2px_#808080]"
    >
      {children}
    </button>
  );
}
