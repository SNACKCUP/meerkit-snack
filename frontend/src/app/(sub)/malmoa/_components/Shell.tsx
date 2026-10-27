"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useRecorderPrefs } from "../_lib/prefs";
import { RecorderProvider } from "../_lib/recorder";
import { useMalmoa } from "../_lib/store";
import { useReveal } from "../_lib/useReveal";
import { useStill } from "../_lib/useStill";
import { THEME_STYLE, THEME_VARS } from "../_lib/theme";
import { Logo } from "./Logo";
import { RecordingDock } from "./RecordingDock";
import { pxButtonClass } from "./px";

// 화면이 하나씩 늘 때마다 여기에 추가한다. (연결되지 않은 메뉴는 두지 않는다)
const NAV: { href: string; label: string }[] = [
  { href: "/malmoa", label: "처음" },
  { href: "/malmoa/home", label: "녹음" },
  { href: "/malmoa/meetings", label: "회의 목록" },
  { href: "/malmoa/guide", label: "사용 안내" },
  { href: "/malmoa/settings", label: "설정" },
];

// 말모아 전체의 틀: 전용 색을 한 번만 입히고, 상단 작업표시줄(로고·메뉴·시계)와 바닥글을 둔다.
export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  // 동적 경로의 미리 그린 화면에서는 현재 경로를 알 수 없으므로, 메뉴 강조는 마운트 뒤에 계산한다 (하이드레이션 불일치 방지)
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const mainRef = useRef<HTMLElement>(null);
  const still = useStill();
  useReveal(mainRef, still);
  const [open, setOpen] = useState(false);
  // 작업표시줄 시계 (마운트 뒤에만 그린다: 서버 HTML과 어긋나지 않게)
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const first = setTimeout(() => setNow(new Date()), 0);
    const t = setInterval(() => setNow(new Date()), 15_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);

  // 대화상자는 body 아래에 그려지므로, 색을 html에도 입혀 둔다 (떠날 때 되돌린다)
  useEffect(() => {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(THEME_VARS)) root.style.setProperty(k, v);
    return () => {
      for (const k of Object.keys(THEME_VARS)) root.style.removeProperty(k);
    };
  }, []);

  // 설정의 "움직임 끄기": 말모아 화면에 있는 동안만 전체 애니메이션을 끈다
  const reduceMotion = useRecorderPrefs((s) => s.reduceMotion);
  useEffect(() => {
    if (!reduceMotion) return;
    const root = document.documentElement;
    const before = root.dataset.mkMotion;
    root.dataset.mkMotion = "off";
    return () => {
      if (before === undefined) delete root.dataset.mkMotion;
      else root.dataset.mkMotion = before;
    };
  }, [reduceMotion]);

  // 저장해 둔 목 데이터·녹음 설정을 불러온다 (서버가 그린 화면과 어긋나지 않게 마운트 뒤에 한다)
  useEffect(() => {
    let cancelled = false;
    Promise.all([useMalmoa.persist.rehydrate(), useRecorderPrefs.persist.rehydrate()]).then(() => {
      if (!cancelled) useMalmoa.getState().finishHydration();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <RecorderProvider>
    <div style={THEME_STYLE} className="mp-root flex min-h-screen flex-col text-black antialiased">
      <a href="#malmoa-main" className="sr-only z-50 bg-(--mk-face) px-4 py-2 text-black focus:not-sr-only focus:fixed focus:left-3 focus:top-3">본문으로 건너뛰기</a>
      <header className="w98-out sticky top-0 z-30">
        <div className="mx-auto flex h-11 max-w-6xl items-center gap-2 px-2">
          <Link href="/malmoa" aria-label="말모아 처음으로" onClick={() => setOpen(false)} className={cn(pxButtonClass("mint", "md"), "gap-2 px-3")}><Logo /></Link>
          <span aria-hidden className="h-6 w-0.5 bg-(--mk-shade) shadow-[1px_0_0_#fff]" />
          <nav className="hidden items-center gap-1 md:flex" aria-label="주요 메뉴">
            {NAV.map((n) => {
              const here = mounted && (n.href === "/malmoa" ? path === n.href : path.startsWith(n.href));
              return (
                <Link key={n.href} href={n.href} aria-current={here ? "page" : undefined} className={cn(pxButtonClass("ghost", "md"), "min-w-0", here && "w98-in bg-[repeating-conic-gradient(#fff_0%_25%,#c0c0c0_0%_50%)] bg-[length:2px_2px] font-bold shadow-none [box-shadow:inset_-1px_-1px_#fff,inset_1px_1px_#808080,inset_-2px_-2px_#dfdfdf,inset_2px_2px_#0a0a0a]")}>
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span suppressHydrationWarning className="font-pixel w98-in hidden h-7 items-center px-3 text-sm sm:inline-flex" aria-label="현재 시각">
              {now ? `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}` : "--:--"}
            </span>
            <button type="button" aria-label={open ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={open} aria-controls="malmoa-menu" onClick={() => setOpen((v) => !v)} className={cn(pxButtonClass("ghost", "sm"), "min-w-0 px-2 md:hidden")}>
              <span className="font-pixel">{open ? "×" : "≡"}</span>
            </button>
          </div>
        </div>
        <nav id="malmoa-menu" aria-label="모바일 메뉴" className={cn("grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out md:hidden", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <ul className="min-h-0">
            {NAV.map((n) => {
              const here = mounted && (n.href === "/malmoa" ? path === n.href : path.startsWith(n.href));
              return (
                <li key={n.href}>
                  <Link href={n.href} tabIndex={open ? 0 : -1} aria-current={here ? "page" : undefined} onClick={() => setOpen(false)} className={cn("font-pixel block border-t border-white px-4 py-2.5 text-base text-black", here && "bg-[#000080] text-white")}>{n.label}</Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
      <main ref={mainRef} id="malmoa-main" tabIndex={-1} key={path} className="flex-1 outline-none">{children}</main>
      <footer className="w98-out mt-auto">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-2 py-1.5 text-sm">
          <p className="w98-flat px-2 py-0.5">말모아 · 서브 프로젝트 · 지금은 예시 데이터로 동작합니다</p>
          <button type="button" className={pxButtonClass("ghost", "sm")} onClick={() => { if (window.confirm("예시 데이터를 처음 상태로 되돌릴까요?")) useMalmoa.getState().reset(); }}>데이터 초기화</button>
        </div>
      </footer>
      <RecordingDock />
    </div>
    </RecorderProvider>
  );
}
