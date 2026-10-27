"use client";

import Link from "next/link";

import { AUDIENCES, docGroups, docHref, type Audience } from "../nav";
import { H2, P } from "../ui";

const ORDER: Audience[] = ["user", "admin", "common"];

function Grid({ items }: { items: { slug: string; title: string; description: string }[] }) {
  return (
    <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <Link key={it.slug} href={docHref(it.slug)} title={it.description} className="rounded-lg px-2 py-2 text-[15px] font-medium transition-colors hover:bg-accent">
          {it.title}
        </Link>
      ))}
    </div>
  );
}

// 헤더의 Components를 누르면 오는 목록. nav.ts의 Components·AI Components 그룹을 그대로 읽어서 항상 최신이다.
export function ComponentsListDoc() {
  const components = docGroups.find((g) => g.label === "Components")?.items.filter((i) => i.slug !== "components") ?? [];
  const ai = docGroups.find((g) => g.label === "AI Components")?.items ?? [];
  const total = components.length + ai.length;
  return (
    <>
      <P>킷이 제공하는 컴포넌트 {total}개입니다. 이름을 누르면 미리보기와 사용법을 볼 수 있습니다.</P>
      {ORDER.map((aud) => {
        const items = components.filter((i) => i.audience === aud);
        if (items.length === 0) return null;
        return (
          <section key={aud} className="grid gap-3">
            <H2>{AUDIENCES[aud].section}</H2>
            <P className="text-muted-foreground">{AUDIENCES[aud].hint}</P>
            <Grid items={items} />
          </section>
        );
      })}
      <section className="grid gap-3">
        <H2>AI Components</H2>
        <Grid items={ai} />
      </section>
    </>
  );
}
