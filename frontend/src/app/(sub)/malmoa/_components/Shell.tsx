"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import { UserMenu, useAuth, useLogout } from "@/meerkit";
import { cn } from "@/lib/utils";

import { useRecorderPrefs } from "../_lib/prefs";
import { RecorderProvider } from "../_lib/recorder";
import { useMalmoa } from "../_lib/store";
import { useReveal } from "../_lib/useReveal";
import { useStill } from "../_lib/useStill";
import { THEME_STYLE, THEME_VARS } from "../_lib/theme";
import { LevelUpDialog } from "./LevelUpDialog";
import { Logo } from "./Logo";
import { RecordingDock } from "./RecordingDock";
import { pxButtonClass } from "./px";

// 화면이 하나씩 늘 때마다 여기에 추가한다. (연결되지 않은 메뉴는 두지 않는다)
const NAV: { href: string; label: string }[] = [
  { href: "/malmoa", label: "처음" },
  { href: "/malmoa/home", label: "퀘스트 보드" },
  { href: "/malmoa/meetings", label: "회의 목록" },
  { href: "/malmoa/profile", label: "내 캐릭터" },
  { href: "/malmoa/guide", label: "사용 안내" },
  { href: "/malmoa/settings", label: "설정" },
];

// 말모아 전체의 틀: 전용 색을 한 번만 입히고, 상단 바(로고·메뉴·계정)와 바닥글을 둔다.
export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  // 동적 경로의 미리 그린 화면에서는 현재 경로를 알 수 없으므로, 메뉴 강조는 마운트 뒤에 계산한다 (하이드레이션 불일치 방지)
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const logout = useLogout();
  const mainRef = useRef<HTMLElement>(null);
  const still = useStill();
  useReveal(mainRef, still);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
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
    <div style={THEME_STYLE} className="mp-root flex min-h-screen flex-col bg-background text-foreground antialiased">
      <a href="#malmoa-main" className="sr-only z-50 bg-(--mk-gold) px-4 py-2 text-(--mk-ink) focus:not-sr-only focus:fixed focus:left-3 focus:top-3">본문으로 건너뛰기</a>
      <header className={cn("sticky top-0 z-30 transition-[background-color,border-color,backdrop-filter] duration-500", scrolled || open ? "border-b-2 border-white/10 bg-background/70 backdrop-blur-xl" : "border-b-2 border-transparent")}>
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5">
          <Link href="/malmoa" aria-label="말모아 처음으로" onClick={() => setOpen(false)}><Logo /></Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="주요 메뉴">
            {NAV.map((n) => {
              const here = mounted && (n.href === "/malmoa" ? path === n.href : path.startsWith(n.href));
              return (
                <Link key={n.href} href={n.href} aria-current={here ? "page" : undefined} className={cn("group relative px-3 py-1.5 font-pixel text-[15px] transition-colors duration-300", here ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  {n.label}
                  <span aria-hidden className={cn("absolute inset-x-3 -bottom-0.5 h-0.5 origin-left bg-(--mk-gold) transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", here ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {isLoading ? (
              <span className="h-8 w-24 bg-muted" aria-busy />
            ) : isAuthenticated && user ? (
              <UserMenu user={user} onLogout={() => logout.mutate()} />
            ) : (
              <>
                <Link href="/malmoa/login" className={cn(pxButtonClass("ghost", "sm"), "hidden sm:inline-flex")}>로그인</Link>
                <Link href="/malmoa/signup" className={pxButtonClass("mint", "sm")}>시작하기</Link>
              </>
            )}
            <button type="button" aria-label={open ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={open} aria-controls="malmoa-menu" onClick={() => setOpen((v) => !v)} className="grid size-9 place-items-center border-2 border-border text-foreground transition-colors hover:bg-white/[0.08] md:hidden">
              {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
            </button>
          </div>
        </div>
        <nav id="malmoa-menu" aria-label="모바일 메뉴" className={cn("grid overflow-hidden transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <ul className="min-h-0">
            {NAV.map((n) => {
              const here = mounted && (n.href === "/malmoa" ? path === n.href : path.startsWith(n.href));
              return (
                <li key={n.href}>
                  <Link href={n.href} tabIndex={open ? 0 : -1} aria-current={here ? "page" : undefined} onClick={() => setOpen(false)} className={cn("font-pixel block border-t-2 border-border px-5 py-3 text-base", here ? "text-(--mk-gold)" : "text-muted-foreground")}>{n.label}</Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
      <main ref={mainRef} id="malmoa-main" tabIndex={-1} key={path} className="flex-1 outline-none">{children}</main>
      <footer className="mt-auto border-t-2 border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-4 text-sm text-muted-foreground">
          <p>말모아 — Meerkit 위에 얹은 서브 프로젝트 · 지금은 화면용 목 데이터로 동작합니다</p>
          <button type="button" className="underline underline-offset-4" onClick={() => { if (window.confirm("목 데이터를 처음 상태로 되돌릴까요?")) useMalmoa.getState().reset(); }}>데이터 초기화</button>
        </div>
      </footer>
      <RecordingDock />
      <LevelUpDialog />
    </div>
    </RecorderProvider>
  );
}
