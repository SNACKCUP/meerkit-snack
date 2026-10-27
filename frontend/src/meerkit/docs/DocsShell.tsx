"use client";

import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { LogoMark } from "../brand/LogoMark";
import { ThemeToggle } from "../theme/ThemeToggle";
import { meerkitConfig } from "../config";
import { DocsFooter } from "./DocsFooter";
import { ScrollTopButton } from "./ScrollTopButton";
import { AUDIENCES, docGroups, docHref, type Audience, type DocMeta } from "./nav";

function NavLink({ item, slug, onNavigate }: { item: DocMeta; slug?: string; onNavigate?: () => void }) {
  const active = item.slug === slug;
  return (
    <Link
      href={docHref(item.slug)}
      onClick={onNavigate}
      data-active={active}
      className={cn(
        "rounded-lg px-2.5 py-1.5 text-[13px] transition-colors",
        active ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
      )}
    >
      {item.title}
    </Link>
  );
}

const AUDIENCE_ORDER: Audience[] = ["user", "admin", "common"];

function Sidebar({ slug, onNavigate }: { slug?: string; onNavigate?: () => void }) {
  return (
    <nav className="grid pb-[55vh]">
      {docGroups.map((group, index) => {
        const active = group.items.some((i) => i.slug === slug);
        const split = group.items.some((i) => i.audience);
        return (
          <div key={group.label} className={cn("grid gap-1 py-5", index > 0 && "border-t")}>
            {/* 카테고리 제목: 진한 글씨 + 항목 수. 현재 보고 있는 카테고리는 막대로 표시한다 */}
            <div className="mb-1 flex items-center gap-2 px-3">
              <span className={cn("h-3.5 w-1 rounded-full transition-colors duration-300", active ? "bg-brand" : "bg-border")} />
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-foreground">{group.label}</p>
              <span className="ml-auto rounded-full bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground">{group.items.length}</span>
            </div>
            {split ? (
              // 컴포넌트는 2단으로 나눈다: 카테고리 안에서 다시 사용자 / 관리자 / 공통
              <div className="ml-[18px] grid gap-3 border-l pl-2.5">
                {AUDIENCE_ORDER.map((aud) => {
                  const items = group.items.filter((i) => i.audience === aud);
                  if (items.length === 0) return null;
                  return (
                    <div key={aud} className={cn("grid gap-0.5 border-l-2 pl-2", AUDIENCES[aud].tone.bar)}>
                      <p className="flex items-center px-2.5 pb-0.5 pt-1 text-[11px] font-semibold text-muted-foreground">
                        {AUDIENCES[aud].section}
                        <span className="ml-auto font-normal opacity-60">{items.length}</span>
                      </p>
                      {items.map((item) => <NavLink key={item.slug} item={item} slug={slug} onNavigate={onNavigate} />)}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="ml-[18px] grid gap-0.5 border-l pl-2.5">
                {group.items.map((item) => <NavLink key={item.slug} item={item} slug={slug} onNavigate={onNavigate} />)}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

// 현재 페이지의 링크를 사이드바 스크롤 영역 안에서 화면 세로 중앙으로 가져온다.
// 처음 열 때는 바로, 메뉴를 눌러 이동했을 때는 부드럽게 움직인다.
function centerActiveLink(container: HTMLElement | null, smooth: boolean) {
  const el = container?.querySelector<HTMLElement>('[data-active="true"]');
  if (!container || !el || container.clientHeight === 0) return;
  const rect = el.getBoundingClientRect();
  const delta = rect.top + rect.height / 2 - window.innerHeight / 2;
  container.scrollTo({ top: Math.max(0, container.scrollTop + delta), behavior: smooth ? "smooth" : "auto" });
}

// 검색은 /docs/search?q=... 페이지에서 한다. 헤더 입력창은 그 주소로 이동시킨다.
function HeaderSearch({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  return (
    <form
      role="search"
      className="hidden items-center gap-2 rounded-xl border bg-surface px-3 py-1.5 text-[13px] text-muted-foreground sm:flex"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        router.push(q ? `/docs/search?q=${encodeURIComponent(q)}` : "/docs/search");
      }}
    >
      <Search className="size-3.5" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search documentation…"
        className="w-44 bg-transparent outline-none placeholder:text-muted-foreground"
      />
    </form>
  );
}

interface DocsShellProps {
  slug?: string;
  query?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}

export function DocsShell({ slug, query, children, aside }: DocsShellProps) {
  const [open, setOpen] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    centerActiveLink(asideRef.current, !first.current);
    first.current = false;
  }, [slug]);
  useEffect(() => {
    if (open) centerActiveLink(drawerRef.current, false);
  }, [open]);

  // 헤더에서 지금 보고 있는 구역을 진하게 표시한다
  const section = slug?.startsWith("api-") ? "api" : slug === "components" || docGroups.find((g) => g.label.includes("Components"))?.items.some((i) => i.slug === slug) ? "components" : "docs";
  const navCls = (active: boolean) => (active ? "font-medium text-foreground" : "hover:text-foreground");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4 lg:px-6">
          <button type="button" aria-label="메뉴" className="rounded-lg p-1.5 hover:bg-accent lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="size-5" />
          </button>
          <Link href={meerkitConfig.routes.home} className="flex items-center gap-2 text-sm font-semibold">
            <LogoMark className="size-8 rounded-xl" /> Meerkit
          </Link>
          <nav className="ml-4 hidden items-center gap-5 text-[13px] text-muted-foreground md:flex">
            <Link href={meerkitConfig.routes.home} className="hover:text-foreground">Home</Link>
            <Link href="/docs" className={navCls(section === "docs")}>Docs</Link>
            <Link href="/docs/components" className={navCls(section === "components")}>Components</Link>
            <Link href="/docs/api-overview" className={navCls(section === "api")}>API</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <HeaderSearch key={query ?? ""} initial={query} />
            <Button asChild size="sm" variant="outline">
              <a href={meerkitConfig.githubUrl} target="_blank" rel="noreferrer">GitHub</a>
            </Button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="닫기" className="absolute inset-0 bg-foreground/25" onClick={() => setOpen(false)} />
          <div ref={drawerRef} className="mk-scroll relative h-full w-72 overflow-y-auto bg-background p-4 shadow-2xl">
            <button type="button" aria-label="닫기" className="mb-4 rounded-lg p-1.5 hover:bg-accent" onClick={() => setOpen(false)}><X className="size-5" /></button>
            <Sidebar slug={slug} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-[1400px] lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_220px]">
        <aside ref={asideRef} className="mk-scroll sticky top-14 hidden h-[calc(100vh-3.5rem)] overflow-y-auto px-4 py-8 lg:block">
          <Sidebar slug={slug} />
        </aside>
        {children}
        <aside className="mk-scroll sticky top-14 hidden h-[calc(100vh-3.5rem)] overflow-y-auto py-10 xl:block">{aside}</aside>
      </div>
      <DocsFooter />
      <ScrollTopButton />
    </div>
  );
}
