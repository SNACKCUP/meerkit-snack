"use client";

import { useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { PixelIcon, type PixelIconName } from "./px";

export interface DeskItem {
  id: string;
  title: string;
  icon: PixelIconName;
  x: number;
  y: number;
  w: number;
  h?: number; // 없으면 내용 높이
  minW?: number;
  minH?: number;
  node: ReactNode;
}

interface Win {
  x: number;
  y: number;
  w: number;
  h: number | null;
  open: boolean;
  min: boolean;
  max: boolean;
  z: number;
}

const TASKBAR = 36;
const KEY_STEP = 16;
const query = "(min-width: 768px)";
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(query);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

// 바탕화면: 창을 끌어 옮기고, 최소화·최대화·닫기·크기 조절을 할 수 있다.
// 좁은 화면(모바일)에서는 창을 위에서 아래로 쌓기만 하고 끌기는 끈다.
// 위치·크기는 계속 바뀌는 값이라 style로 준다 (CLAUDE.md "인라인 스타일 금지"의 예외: 끌기 좌표).
export function Desk({ items, className }: { items: DeskItem[]; className?: string }) {
  const floating = useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
  // 바탕화면이 좁으면(1060px 미만) 창을 겹쳐 쌓고, 넓으면 정해 둔 자리에 펼친다. (이 화면은 브라우저 데이터를 기다린 뒤 그려지므로 서버 HTML과 어긋나지 않는다)
  const [wins, setWins] = useState<Record<string, Win>>(() => {
    const deskW = typeof window === "undefined" ? 1152 : Math.min(1152, window.innerWidth) - 32;
    const cascade = deskW < 1060;
    return Object.fromEntries(
      items.map((it, i) => [
        it.id,
        {
          x: cascade ? 104 + i * 26 : it.x,
          y: cascade ? 12 + i * 34 : it.y,
          w: cascade ? Math.min(it.w, Math.max(280, deskW - 104 - i * 26 - 8)) : it.w,
          h: it.h ?? null,
          open: true,
          min: false,
          max: false,
          z: items.length - i,
        },
      ]),
    );
  });
  const zRef = useRef(items.length + 1);
  const deskRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; mode: "move" | "size"; sx: number; sy: number; ox: number; oy: number; ow: number; oh: number } | null>(null);

  const patch = (id: string, p: Partial<Win>) => setWins((s) => ({ ...s, [id]: { ...s[id], ...p } }));
  const front = (id: string) => {
    zRef.current += 1;
    patch(id, { z: zRef.current });
  };
  const show = (id: string) => {
    zRef.current += 1;
    patch(id, { open: true, min: false, z: zRef.current });
  };
  const topId = items
    .filter((it) => wins[it.id].open && !wins[it.id].min)
    .sort((a, b) => wins[b.id].z - wins[a.id].z)[0]?.id;

  function begin(e: PointerEvent<HTMLElement>, id: string, mode: "move" | "size") {
    if (e.button !== 0 || !floating) return;
    if (mode === "move" && (e.target as HTMLElement).closest("button")) return;
    const w = wins[id];
    if (w.max) return;
    const el = e.currentTarget.closest("section");
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id, mode, sx: e.clientX, sy: e.clientY, ox: w.x, oy: w.y, ow: w.w, oh: w.h ?? el?.offsetHeight ?? 200 };
  }
  function move(e: PointerEvent<HTMLElement>) {
    const d = drag.current;
    const desk = deskRef.current;
    if (!d || !desk) return;
    const item = items.find((it) => it.id === d.id)!;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (d.mode === "move") {
      patch(d.id, { x: clamp(d.ox + dx, 80 - d.ow, desk.clientWidth - 80), y: clamp(d.oy + dy, 0, desk.clientHeight - TASKBAR - 28) });
    } else {
      patch(d.id, { w: Math.max(item.minW ?? 260, d.ow + dx), h: Math.max(item.minH ?? 160, d.oh + dy) });
    }
  }
  const end = () => {
    drag.current = null;
  };
  function keys(e: KeyboardEvent<HTMLElement>, id: string) {
    const w = wins[id];
    if (!floating || w.max) return;
    const d = { ArrowLeft: [-KEY_STEP, 0], ArrowRight: [KEY_STEP, 0], ArrowUp: [0, -KEY_STEP], ArrowDown: [0, KEY_STEP] }[e.key];
    if (!d) return;
    e.preventDefault();
    patch(id, { x: w.x + d[0], y: Math.max(0, w.y + d[1]) });
  }

  const topbar = (it: DeskItem, w: Win) => {
    const active = it.id === topId;
    return (
      <header
        tabIndex={floating ? 0 : undefined}
        aria-label={floating ? `${it.title} 창 (방향키로 이동)` : undefined}
        onPointerDown={(e) => begin(e, it.id, "move")}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onKeyDown={(e) => keys(e, it.id)}
        onDoubleClick={() => floating && patch(it.id, { max: !w.max })}
        className={cn("flex touch-none select-none items-center justify-between gap-2 px-1.5 py-[3px] text-white outline-none", floating && !w.max && "cursor-move", !floating || active ? "w98-title" : "bg-[linear-gradient(90deg,#808080,#b5b5b5)]")}
      >
        <h2 className="font-pixel flex min-w-0 items-center gap-1.5 text-[15px]"><PixelIcon name={it.icon} size={14} className="shrink-0" /><span className="truncate">{it.title}</span></h2>
        {floating ? (
          <div className="flex shrink-0 gap-[2px]">
            <WinButton label={`${it.title} 최소화`} onClick={() => patch(it.id, { min: true })}>_</WinButton>
            <WinButton label={w.max ? `${it.title} 이전 크기로` : `${it.title} 최대화`} onClick={() => { patch(it.id, { max: !w.max }); front(it.id); }}>{w.max ? "❐" : "□"}</WinButton>
            <WinButton label={`${it.title} 닫기`} onClick={() => patch(it.id, { open: false })}>×</WinButton>
          </div>
        ) : null}
      </header>
    );
  };

  if (!floating) {
    return (
      <div className={cn("grid gap-4", className)}>
        {items.map((it) => (
          <section key={it.id} aria-label={it.title} className="w98-out p-[3px] text-black">
            {topbar(it, wins[it.id])}
            <div className="m-0">{it.node}</div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div ref={deskRef} className={cn("relative overflow-hidden", className)}>
      <ul className="absolute left-2 top-3 z-0 grid gap-4" aria-label="바탕화면 아이콘">
        {items.map((it) => (
          <li key={it.id}>
            <button type="button" onClick={() => show(it.id)} className="mp-title group grid w-[88px] justify-items-center gap-1 p-1 text-center text-xs outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-dotted focus-visible:outline-white">
              <span className="grid size-10 place-items-center bg-[#c0c0c0] text-black shadow-[inset_-1px_-1px_#0a0a0a,inset_1px_1px_#fff] group-hover:bg-white"><PixelIcon name={it.icon} size={24} /></span>
              <span className="font-pixel leading-tight break-keep">{it.title}</span>
            </button>
          </li>
        ))}
      </ul>

      {items.map((it) => {
        const w = wins[it.id];
        const hidden = !w.open || w.min;
        return (
          <section
            key={it.id}
            aria-label={it.title}
            hidden={hidden}
            onPointerDownCapture={() => it.id !== topId && front(it.id)}
            style={w.max ? { left: 0, top: 0, width: "100%", height: `calc(100% - ${TASKBAR}px)`, zIndex: w.z } : { left: w.x, top: w.y, width: w.w, height: w.h ?? undefined, zIndex: w.z }}
            className={cn("w98-out absolute flex flex-col p-[3px] text-black shadow-[2px_2px_0_0_rgba(0,0,0,0.45)]", hidden && "hidden")}
          >
            {topbar(it, w)}
            <div className="min-h-0 flex-1 overflow-auto">{it.node}</div>
            {!w.max ? (
              <span
                aria-hidden
                onPointerDown={(e) => begin(e, it.id, "size")}
                onPointerMove={move}
                onPointerUp={end}
                onPointerCancel={end}
                className="absolute bottom-0 right-0 size-3.5 cursor-se-resize touch-none bg-[linear-gradient(135deg,transparent_50%,#808080_50%,#808080_58%,transparent_58%,transparent_70%,#808080_70%,#808080_78%,transparent_78%)]"
              />
            ) : null}
          </section>
        );
      })}

      <nav aria-label="작업 표시줄" className="w98-out absolute inset-x-0 bottom-0 z-[999] flex h-9 items-center gap-1 overflow-x-auto px-1">
        {items.filter((it) => wins[it.id].open).map((it) => {
          const w = wins[it.id];
          const pressed = it.id === topId;
          return (
            <button
              key={it.id}
              type="button"
              aria-pressed={pressed}
              onClick={() => (w.min ? show(it.id) : pressed ? patch(it.id, { min: true }) : front(it.id))}
              className={cn("font-pixel flex h-7 w-36 shrink-0 items-center gap-1.5 truncate px-2 text-left text-sm text-black outline-none", pressed ? "w98-in bg-[repeating-conic-gradient(#fff_0%_25%,#c0c0c0_0%_50%)] bg-[length:2px_2px] font-bold" : "w98-out")}
            >
              <PixelIcon name={it.icon} size={14} className="shrink-0" />
              <span className="truncate">{it.title}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function WinButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="font-pixel w98-out grid size-4 place-items-center bg-(--mk-face) text-[12px] leading-none text-black active:shadow-[inset_-1px_-1px_#fff,inset_1px_1px_#0a0a0a]">
      <span aria-hidden>{children}</span>
    </button>
  );
}
