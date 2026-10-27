"use client";

import Link from "next/link";

import { AUDIENCES, docGroups, docHref, type Audience } from "../nav";

const ORDER: Audience[] = ["user", "admin", "common"];

type Item = { slug: string; title: string; description: string };

// 그룹마다 제목과 가는 선으로 나누고, 카드는 이름과 한 줄 설명을 보여 준다.
function Section({ title, items }: { title: string; items: Item[] }) {
  return (
    <section className="grid gap-4">
      <div className="flex items-baseline gap-2 border-b pb-2">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((it) => (
          <Link key={it.slug} href={docHref(it.slug)} className="grid content-start gap-1 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/60">
            <span className="text-[15px] font-medium">{it.title}</span>
            <span className="line-clamp-2 text-[13px] leading-5 text-muted-foreground">{it.description}</span>
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
    <div className="grid gap-12">
      {ORDER.map((aud) => {
        const items = components.filter((i) => i.audience === aud);
        return items.length ? <Section key={aud} title={AUDIENCES[aud].section} items={items} /> : null;
      })}
      <Section title="AI Components" items={ai} />
    </div>
  );
}
