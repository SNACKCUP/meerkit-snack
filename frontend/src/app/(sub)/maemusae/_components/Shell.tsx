"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { NativeSelect } from "@/components/ui/native-select";
import { UserAvatar } from "@/meerkit";
import { cn } from "@/lib/utils";

import { useRise } from "../_lib/motion";
import { DEMO_USERS } from "../_lib/seed";
import { useMaemusae, useCurrentUser } from "../_lib/store";
import { THEME_STYLE, THEME_VARS } from "../_lib/theme";
import { Logo } from "./Logo";

const NAV = [
  { href: "/maemusae/about", label: "소개" },
  { href: "/maemusae/guide", label: "가이드" },
  { href: "/maemusae/pricing", label: "요금제" },
  { href: "/maemusae/projects", label: "프로젝트" },
];

// 매무새 전체의 틀: 전용 색과 글꼴을 한 번만 입히고, 상단 바와 데모 계정 전환을 둔다.
export function Shell({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const user = useCurrentUser();
  const setUser = useMaemusae((s) => s.setCurrentUser);
  const path = usePathname();

  // 대화상자는 body 아래에 그려지므로, 색을 html에도 입혀 둔다 (떠날 때 되돌린다)
  useEffect(() => {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(THEME_VARS)) root.style.setProperty(k, v);
    return () => {
      for (const k of Object.keys(THEME_VARS)) root.style.removeProperty(k);
    };
  }, []);

  // 저장해 둔 목 데이터를 불러온 뒤에 화면을 그린다 (서버와 화면이 어긋나지 않게)
  useEffect(() => {
    let cancelled = false;
    Promise.resolve(useMaemusae.persist.rehydrate()).then(() => {
      if (cancelled) return;
      useMaemusae.getState().finishPending();
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={THEME_STYLE} className="min-h-screen bg-[#d9d9d6] p-3 text-[#111] antialiased sm:p-6">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;800&display=swap" />
      <div className="flex min-h-[calc(100vh-1.5rem)] w-full flex-col overflow-x-clip rounded-[32px] bg-[#f6f6f3] px-5 pb-8 pt-5 sm:min-h-[calc(100vh-3rem)] sm:px-12 sm:pt-7">
        <header className="grid items-center gap-x-5 gap-y-3 rounded-[28px] border-2 border-[#111] bg-white px-4 py-2.5 shadow-[5px_5px_0_#111] lg:rounded-full lg:pl-6 lg:pr-3 lg:grid-cols-[1fr_auto_1fr]">
          <Link href="/maemusae" aria-label="매무새 홈" className="flex w-fit items-center"><Logo /></Link>
          <nav className="flex flex-wrap items-center gap-2 text-[13px] lg:justify-self-center" aria-label="주요 메뉴">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={path.startsWith(n.href) ? "page" : undefined} className={cn("rounded-full border-2 px-3.5 py-1 font-semibold transition-colors", path.startsWith(n.href) ? "border-[#111] bg-[#f2f69a]" : "border-transparent hover:border-[#111]")}>{n.label}</Link>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-2 lg:justify-self-end">
            <label className="flex items-center gap-2 rounded-full border-2 border-dashed border-[#111] bg-[#f2f69a] py-0.5 pl-3 pr-0.5 text-[11px] font-bold">
              데모 계정
              <NativeSelect aria-label="데모 계정 바꾸기" value={user.id} onChange={(e) => setUser(e.target.value)} className="h-8 rounded-full border-2 border-[#111] bg-white text-[12px] font-semibold text-[#111]">
                {DEMO_USERS.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </NativeSelect>
            </label>
            <span className="hidden items-center gap-1 text-[12px] font-semibold md:flex"><Link href="/maemusae/login" className="rounded-full px-3 py-1.5 hover:bg-[#ebeae4]">로그인</Link><Link href="/maemusae/signup" className="rounded-full border-2 border-[#111] bg-[#ff5a14] px-3.5 py-1 text-white shadow-[2px_2px_0_#111] transition-[transform,box-shadow] hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_#111]">회원가입</Link></span>
            <span className="flex items-center gap-2 rounded-full bg-[#ebeae4] py-1 pl-1 pr-3 text-[13px] font-semibold"><UserAvatar user={{ name: user.name, nickname: null, avatar_url: null }} size="sm" />{user.name}</span>
          </div>
        </header>
        <main className="mt-12 flex-1 sm:mt-16">{ready ? <Rise key={path}>{children}</Rise> : <div className="h-[50vh]" aria-busy />}</main>
        <footer className="mt-16 flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-[#111]/15 pt-5 text-[12px] text-[#6c6a62]">
          <span>매무새 — Meerkit 위에 얹은 서브 프로젝트 · 지금은 화면용 목 데이터로 동작합니다</span>
          <button type="button" className="underline underline-offset-4" onClick={() => { if (window.confirm("목 데이터를 처음 상태로 되돌릴까요?")) useMaemusae.getState().reset(); }}>데이터 초기화</button>
        </footer>
      </div>
    </div>
  );
}

function Rise({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useRise(ref);
  return <div ref={ref}>{children}</div>;
}
