import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

// 기본은 어두운 패널, paper는 회의록처럼 오래 읽는 글에 쓰는 밝은 종이 패널. 픽셀 테두리 + 계단 그림자.
export function PxCard({ title, action, tone = "default", className, children, ...props }: Omit<ComponentProps<"section">, "title"> & { title?: ReactNode; action?: ReactNode; tone?: "default" | "paper" }) {
  const paper = tone === "paper";
  return (
    <section
      className={cn(
        "border-[3px] shadow-[4px_4px_0_0_var(--mk-px-edge)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--mk-px-edge)]",
        paper ? "border-(--mk-px-edge) bg-(--mk-paper) text-(--mk-ink)" : "border-border bg-card text-foreground",
        className,
      )}
      {...props}
    >
      {title ? (
        <header className={cn("flex items-center justify-between gap-3 border-b-[3px] px-4 py-2", paper ? "border-(--mk-px-edge) bg-(--mk-gold)" : "border-border bg-muted")}>
          <h2 className={cn("font-pixel text-base", paper && "text-(--mk-ink)")}>{title}</h2>
          {action}
        </header>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}
