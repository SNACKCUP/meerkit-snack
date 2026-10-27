"use client";

import { Check, Copy, ExternalLink, Info, TriangleAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");

export function H2({ children, id }: { children: string; id?: string }) {
  return (
    <h2 id={id ?? slugify(children)} className="mt-12 scroll-mt-24 text-xl font-semibold tracking-tight first:mt-0">
      {children}
    </h2>
  );
}

export function H3({ children, id }: { children: string; id?: string }) {
  return (
    <h3 id={id ?? slugify(children)} className="mt-7 scroll-mt-24 text-base font-semibold tracking-tight">
      {children}
    </h3>
  );
}

export function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-[15px] leading-7 text-foreground/80", className)}>{children}</p>;
}

export function Ic({ children }: { children: React.ReactNode }) {
  return <code className="rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground">{children}</code>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="grid list-disc gap-2 pl-5 text-[15px] leading-7 text-foreground/80 marker:text-muted-foreground">{children}</ul>;
}

export function OL({ children }: { children: React.ReactNode }) {
  return <ol className="grid list-decimal gap-2 pl-5 text-[15px] leading-7 text-foreground/80 marker:text-muted-foreground">{children}</ol>;
}

export function Callout({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "warn" }) {
  const Icon = tone === "warn" ? TriangleAlert : Info;
  return (
    <div className={cn("flex gap-3 rounded-2xl border p-4 text-sm leading-6", tone === "warn" ? "border-destructive/20 bg-destructive/5" : "bg-surface shadow-soft")}>
      <Icon className={cn("mt-0.5 size-4 shrink-0", tone === "warn" ? "text-destructive" : "text-brand")} />
      <div className="text-foreground/80">{children}</div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      aria-label="복사"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        });
      }}
      className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
    >
      {done ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  );
}

export function CodeBlock({ code, title }: { code: string; title?: string }) {
  const text = code.replace(/^\n|\n$/g, "");
  return (
    <div className="overflow-hidden rounded-2xl bg-[#12141a] text-[#e8e9ef] dark:border dark:border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="font-mono text-xs text-white/50">{title ?? ""}</span>
        <CopyButton text={text} />
      </div>
      <pre className="mk-scroll overflow-x-auto p-4 font-mono text-[13px] leading-6"><code>{text}</code></pre>
    </div>
  );
}

const managers = [
  ["pnpm", "pnpm dlx"],
  ["npm", "npx"],
  ["yarn", "yarn dlx"],
  ["bun", "bunx"],
] as const;

// "npx" 로 시작하는 명령을 패키지 매니저별로 보여 준다.
export function PkgTabs({ command }: { command: string }) {
  const [active, setActive] = useState<string>("npm");
  const runner = managers.find(([name]) => name === active)![1];
  const text = command.replace(/^npx/, runner);
  return (
    <div className="overflow-hidden rounded-2xl bg-[#12141a] text-[#e8e9ef] dark:border dark:border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <div className="flex gap-1">
          {managers.map(([name]) => (
            <button
              key={name}
              type="button"
              onClick={() => setActive(name)}
              className={cn("rounded-lg px-2.5 py-1 font-mono text-xs transition-colors", active === name ? "bg-white/15 text-white" : "text-white/50 hover:text-white")}
            >
              {name}
            </button>
          ))}
        </div>
        <CopyButton text={text} />
      </div>
      <pre className="mk-scroll overflow-x-auto p-4 font-mono text-[13px] leading-6"><code>{text}</code></pre>
    </div>
  );
}

// 위쪽은 실제 컴포넌트 미리보기, 아래는 사용 코드.
export function Preview({ children, code }: { children: React.ReactNode; code?: string }) {
  return (
    <div className="grid gap-3">
      <div className="flex min-h-48 items-center justify-center rounded-3xl border bg-card p-6 shadow-soft">
        <div className="w-full max-w-sm">{children}</div>
      </div>
      {code && <CodeBlock code={code} title="tsx" />}
    </div>
  );
}

export function PreviewWide({ children, code }: { children: React.ReactNode; code?: string }) {
  return (
    <div className="grid gap-3">
      <div className="overflow-hidden rounded-3xl border bg-card p-3 shadow-soft">{children}</div>
      {code && <CodeBlock code={code} title="tsx" />}
    </div>
  );
}

// 짧은 값(라벨, 단계, 코드 한 단어)은 줄바꿈하지 않고, 나머지 칸도 최소 너비를 둬서 한 글자씩 꺾이지 않게 한다.
// 긴 설명은 그대로 줄바꿈된다.
function isShort(cell: React.ReactNode): boolean {
  if (typeof cell === "number") return true;
  if (typeof cell === "string") return cell.length <= 14;
  if (React.isValidElement<{ children?: React.ReactNode }>(cell)) {
    const child = cell.props.children;
    return typeof child === "string" ? child.length <= 14 : false;
  }
  return false;
}

export function DocTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
      <Table>
        <TableHeader>
          <TableRow>{head.map((h) => <TableHead key={h} className="min-w-[5.5rem]">{h}</TableHead>)}</TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {row.map((cell, j) => (
                <TableCell key={j} className={cn("min-w-[5.5rem] align-top", isShort(cell) ? "whitespace-nowrap" : "whitespace-normal")}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function PropsTable({ rows }: { rows: [name: string, type: string, desc: string, required?: boolean][] }) {
  return (
    <DocTable
      head={["Prop", "Type", "설명"]}
      rows={rows.map(([name, type, desc, required]) => [
        <span key="n" className="inline-flex w-max items-center gap-2"><Ic>{name}</Ic>{required && <Badge variant="brand">필수</Badge>}</span>,
        <code key="t" className="font-mono text-xs text-muted-foreground">{type}</code>,
        desc,
      ])}
    />
  );
}

export function LinkCards({ items }: { items: { href: string; title: string; desc: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((it) => (
        <Link key={it.href} href={it.href} className="rounded-2xl border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:bg-surface">
          <p className="text-sm font-medium">{it.title}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{it.desc}</p>
        </Link>
      ))}
    </div>
  );
}

/** 킷 위에 만든 서브 프로젝트를 화면 캡처와 함께 카드로 보여 준다. 누르면 해당 프로젝트로 이동한다 */
export function SubProjectCards({ items }: { items: { href: string; title: string; desc: string; image: string }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((it) => (
        <Link key={it.href} href={it.href} className="group overflow-hidden rounded-2xl border bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:bg-surface">
          <div className="relative aspect-[16/10] overflow-hidden border-b bg-muted">
            <Image src={it.image} alt={`${it.title} 메인 화면`} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]" />
          </div>
          <div className="flex items-start justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-semibold">{it.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{it.desc}</p>
            </div>
            <ExternalLink className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden />
          </div>
        </Link>
      ))}
    </div>
  );
}

export function Tree({ children }: { children: string }) {
  return (
    <pre className="mk-scroll overflow-x-auto rounded-2xl border bg-card p-4 font-mono text-[13px] leading-6 text-foreground/80 shadow-soft">{children.replace(/^\n|\n$/g, "")}</pre>
  );
}

// 이 페이지가 기대고 있는 shadcn/ui, Tailwind 문서를 상단에 걸어 둔다.
export function DocLinks({ items }: { items: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <a
          key={it.href}
          href={it.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border bg-surface px-3 py-1 text-xs font-medium text-foreground/80 shadow-soft transition-all hover:-translate-y-px hover:text-foreground"
        >
          {it.label}
          <ExternalLink className="size-3 text-muted-foreground" />
        </a>
      ))}
    </div>
  );
}

const SHADCN = "https://ui.shadcn.com/docs";
const TAILWIND = "https://tailwindcss.com/docs";

export const links = {
  shadcnTheming: { label: "shadcn/ui · Theming", href: `${SHADCN}/theming` },
  shadcnInstall: { label: "shadcn/ui · Installation", href: `${SHADCN}/installation` },
  tailwindTheme: { label: "Tailwind CSS · Theme variables", href: `${TAILWIND}/theme` },
  tailwindInstall: { label: "Tailwind CSS · Installation", href: `${TAILWIND}/installation` },
  tailwindCustom: { label: "Tailwind CSS · Custom styles", href: `${TAILWIND}/adding-custom-styles` },
  component: (name: string, label: string) => ({ label: `shadcn/ui · ${label}`, href: `${SHADCN}/components/${name}` }),
};
