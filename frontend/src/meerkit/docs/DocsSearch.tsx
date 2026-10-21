"use client";

import { SearchX } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";

import { DocsShell } from "./DocsShell";
import { allDocs, docHref } from "./nav";
import { loadSearchIndex, search, type SearchEntry } from "./search-index";

function Highlight({ text, query }: { text: string; query: string }) {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return <>{text}</>;
  const pattern = new RegExp(`(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return (
    <>
      {text.split(pattern).map((part, i) =>
        tokens.includes(part.toLowerCase()) ? (
          <mark key={i} className="rounded bg-brand/15 px-0.5 text-foreground">{part}</mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function DocsSearch() {
  const query = (useSearchParams().get("q") ?? "").trim();
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);

  useEffect(() => {
    let alive = true;
    loadSearchIndex().then((e) => alive && setEntries(e));
    return () => {
      alive = false;
    };
  }, []);

  const hits = useMemo(() => (entries ? search(entries, query) : []), [entries, query]);

  return (
    <DocsShell query={query}>
      <main className="mk-rise min-w-0 px-5 py-10 lg:px-12">
        <div className="mx-auto max-w-[720px]">
          <h1 className="text-4xl font-semibold tracking-tight">Search</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            {!query ? "위 검색창에 찾을 내용을 입력하세요." : !entries ? "문서를 읽는 중…" : `"${query}" 검색 결과 ${hits.length}건`}
          </p>

          <div className="mt-8 grid gap-3">
            {hits.map(({ entry, heading, snippet }) => (
              <Link
                key={entry.slug}
                href={`${docHref(entry.slug)}${heading ? `#${heading.id}` : ""}`}
                className="rounded-2xl border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:bg-surface"
              >
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium"><Highlight text={entry.title} query={query} /></p>
                  <Badge variant="secondary">{entry.group}</Badge>
                  {heading && <span className="truncate text-xs text-muted-foreground">› {heading.text}</span>}
                </div>
                <p className="mt-2 text-[13px] leading-6 text-muted-foreground"><Highlight text={snippet} query={query} /></p>
              </Link>
            ))}

            {entries && query && hits.length === 0 && (
              <div className="grid justify-items-center gap-3 rounded-3xl border bg-card px-6 py-14 text-center shadow-soft">
                <SearchX className="size-8 text-muted-foreground" />
                <p className="text-sm font-medium">&quot;{query}&quot;와 맞는 문서가 없습니다.</p>
                <p className="text-xs text-muted-foreground">다른 단어로 검색하거나 아래 문서를 살펴보세요.</p>
              </div>
            )}

            {(!query || (entries && hits.length === 0)) && (
              <div className="grid gap-2 pt-2 sm:grid-cols-2">
                {allDocs.slice(0, 8).map((d) => (
                  <Link key={d.slug} href={docHref(d.slug)} className="rounded-xl border bg-card px-4 py-3 text-[13px] shadow-soft hover:bg-surface">
                    {d.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </DocsShell>
  );
}
