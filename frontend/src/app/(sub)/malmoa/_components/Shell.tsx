"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { UserMenu, useAuth, useLogout } from "@/meerkit";
import { cn } from "@/lib/utils";

import { THEME_STYLE, THEME_VARS } from "../_lib/theme";
import { Logo } from "./Logo";
import { pxButtonClass } from "./px";

// 화면이 하나씩 늘 때마다 여기에 추가한다. (연결되지 않은 메뉴는 두지 않는다)
const NAV: { href: string; label: string }[] = [{ href: "/malmoa", label: "처음" }];

// 말모아 전체의 틀: 전용 색을 한 번만 입히고, 상단 바(로고·메뉴·계정)와 바닥글을 둔다.
export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const logout = useLogout();

  // 대화상자는 body 아래에 그려지므로, 색을 html에도 입혀 둔다 (떠날 때 되돌린다)
  useEffect(() => {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(THEME_VARS)) root.style.setProperty(k, v);
    return () => {
      for (const k of Object.keys(THEME_VARS)) root.style.removeProperty(k);
    };
  }, []);

  return (
    <div style={THEME_STYLE} className="mp-root flex min-h-screen flex-col bg-background text-foreground antialiased">
      <header className="border-b-[3px] border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
          <Link href="/malmoa" aria-label="말모아 처음으로"><Logo /></Link>
          <nav className="flex items-center gap-4" aria-label="주요 메뉴">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={path === n.href ? "page" : undefined} className={cn("font-pixel text-lg hover:text-(--mk-gold)", path === n.href ? "text-(--mk-gold)" : "text-muted-foreground")}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {isLoading ? (
              <span className="h-10 w-28 bg-muted" aria-busy />
            ) : isAuthenticated && user ? (
              <UserMenu user={user} onLogout={() => logout.mutate()} />
            ) : (
              <>
                <Link href="/malmoa/login" className={pxButtonClass("ghost", "sm")}>로그인</Link>
                <Link href="/malmoa/signup" className={pxButtonClass("mint", "sm")}>가입하기</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <div key={path} className="flex-1">{children}</div>
      <footer className="mt-auto border-t-[3px] border-border bg-card">
        <p className="mx-auto max-w-6xl px-5 py-4 text-sm text-muted-foreground">말모아 — Meerkit 위에 얹은 서브 프로젝트 · 지금은 화면용 목 데이터로 동작합니다</p>
      </footer>
    </div>
  );
}
