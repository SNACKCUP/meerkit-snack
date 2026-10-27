"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

import { AUDIENCES, docGroups, docHref, type Audience } from "../nav";

const ORDER: Audience[] = ["user", "admin", "common"];

const AI_TONE = { box: "border-emerald-500/25 bg-emerald-500/8", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300" };

function Box({ title, tone, items }: { title: string; tone: { box: string; dot: string; text: string }; items: { slug: string; title: string; description: string }[] }) {
  return (
    <section className={cn("grid gap-4 rounded-3xl border p-5", tone.box)}>
      <h2 className={cn("flex items-center gap-2 text-sm font-semibold", tone.text)}>
        <span className={cn("size-2 rounded-full", tone.dot)} />
        {title}
        <span className="rounded-full bg-background/70 px-2 py-px text-[11px] font-medium text-muted-foreground">{items.length}</span>
      </h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Link
            key={it.slug}
            href={docHref(it.slug)}
            title={it.description}
            className="rounded-xl border bg-card px-3 py-2.5 text-[14px] font-medium shadow-soft transition-colors hover:bg-accent"
          >
            {it.title}
          </Link>
        ))}
      </div>
    </section>
  );
}

// 헤더의 Components를 누르면 오는 목록. nav.ts의 Components·AI Components 그룹을 그대로 읽어서 항상 최신이다.
export function ComponentsListDoc() {
  const components = docGroups.find((g) => g.label === "Components")?.items.filter((i) => i.slug !== "components") ?? [];
  const ai = docGroups.find((g) => g.label === "AI Components")?.items ?? [];
  return (
    <div className="grid gap-8">
      {ORDER.map((aud) => {
        const items = components.filter((i) => i.audience === aud);
        return items.length ? <Box key={aud} title={AUDIENCES[aud].section} tone={AUDIENCES[aud].tone} items={items} /> : null;
      })}
      <Box title="AI Components" tone={AI_TONE} items={ai} />
    </div>
  );
}
