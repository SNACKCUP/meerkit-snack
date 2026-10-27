import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

// Windows 98 창. title이 있으면 남색 제목 막대, paper는 문서 보기처럼 흰 안쪽 영역에 검은 글자.
export function PxCard({ title, action, tone = "default", className, children, ...props }: Omit<ComponentProps<"section">, "title"> & { title?: ReactNode; action?: ReactNode; tone?: "default" | "paper" }) {
  const paper = tone === "paper";
  return (
    <section className={cn("w98-out p-[3px] text-black", className)} {...props}>
      {title ? (
        <header className="w98-title flex items-center justify-between gap-3 px-1.5 py-[3px] text-white">
          <h2 className="font-pixel truncate text-[15px]">{title}</h2>
          <div className="flex shrink-0 items-center gap-1">
            {action}
            <span aria-hidden className="flex gap-[2px]">
              {["_", "□", "×"].map((g) => (
                <span key={g} className="font-pixel w98-out grid size-4 place-items-center text-[12px] leading-none text-black">{g}</span>
              ))}
            </span>
          </div>
        </header>
      ) : null}
      <div className={cn("p-3", paper && "w98-in m-[3px] bg-white p-4")}>{children}</div>
    </section>
  );
}

// 창 안에 들어갈 때(bare)는 테두리 없이 내용만, 단독으로 쓸 때는 PxCard로 감싼다.
export function PxPanel({ title, bare, action, children }: { title: ReactNode; bare?: boolean; action?: ReactNode; children: ReactNode }) {
  if (bare) return <div className="p-3">{children}</div>;
  return <PxCard title={title} action={action}>{children}</PxCard>;
}
