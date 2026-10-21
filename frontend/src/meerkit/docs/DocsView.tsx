"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { docContent } from "./content";
import { DocsShell } from "./DocsShell";
import { allDocs, docHref } from "./nav";

interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}

// 이전 페이지는 숨김 상태로 DOM에 남아 있을 수 있다. 목차와 앵커는 항상 이 페이지의 article 안에서만 찾는다.
function scrollToHeading(root: HTMLElement | null, id: string, smooth = true) {
  const el = root?.querySelector<HTMLElement>(`[id="${CSS.escape(id)}"]`);
  el?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  return !!el;
}

function Toc({ slug, articleRef }: { slug: string; articleRef: React.RefObject<HTMLElement | null> }) {
  const [heads, setHeads] = useState<TocItem[]>([]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const root = articleRef.current;
    const els = Array.from(root?.querySelectorAll<HTMLElement>("h2[id], h3[id]") ?? []);
    // 렌더가 끝난 뒤 목차를 만든다 (이펙트 안에서 동기 setState 금지)
    const frame = requestAnimationFrame(() => {
      setHeads(els.map((el) => ({ id: el.id, text: el.textContent ?? "", depth: el.tagName === "H3" ? 3 : 2 })));
      setActive(els[0]?.id ?? "");
    });
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [slug, articleRef]);

  if (heads.length === 0) return null;
  return (
    <div className="grid gap-2">
      <p className="text-xs font-medium">On This Page</p>
      <div className="grid gap-1.5 border-l pl-3">
        {heads.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            onClick={(e) => {
              e.preventDefault();
              if (scrollToHeading(articleRef.current, h.id)) history.replaceState(null, "", `#${h.id}`);
            }}
            className={cn(
              "-ml-3 border-l pl-3 text-[13px] transition-colors",
              h.depth === 3 && "pl-6",
              active === h.id ? "border-foreground font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {h.text}
          </a>
        ))}
      </div>
    </div>
  );
}

export function DocsView({ slug }: { slug: string }) {
  const doc = allDocs.find((d) => d.slug === slug);
  const Content = docContent[slug];
  const index = allDocs.findIndex((d) => d.slug === slug);
  const prev = allDocs[index - 1];
  const next = allDocs[index + 1];

  const articleRef = useRef<HTMLElement>(null);

  // 검색 결과에서 #앵커로 들어오면 해당 제목으로 이동한다.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) scrollToHeading(articleRef.current, id, false);
  }, [slug]);

  if (!doc || !Content) notFound();

  return (
    <DocsShell slug={slug} aside={<Toc slug={slug} articleRef={articleRef} />}>
      <main key={slug} className="mk-rise min-w-0 px-5 py-10 lg:px-12">
        <article ref={articleRef} className="mx-auto max-w-[720px]">
          <h1 className="text-4xl font-semibold tracking-tight">{doc.title}</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">{doc.description}</p>
          <div className="mt-8 grid gap-4">
            <Content />
          </div>
        </article>

        <div className="mx-auto mt-16 flex max-w-[720px] justify-between gap-3">
          {prev ? (
            <Button asChild variant="outline" size="sm"><Link href={docHref(prev.slug)}><ArrowLeft /> {prev.title}</Link></Button>
          ) : <span />}
          {next && (
            <Button asChild variant="outline" size="sm"><Link href={docHref(next.slug)}>{next.title} <ArrowRight /></Link></Button>
          )}
        </div>
      </main>
    </DocsShell>
  );
}
