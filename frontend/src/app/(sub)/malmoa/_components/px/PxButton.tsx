import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type PxVariant = "mint" | "gold" | "pink" | "sky" | "ghost";
export type PxSize = "sm" | "md" | "lg";

const VARIANT: Record<PxVariant, string> = {
  mint: "bg-(--mk-mint) text-(--mk-ink)",
  gold: "bg-(--mk-gold) text-(--mk-ink)",
  pink: "bg-(--mk-pink) text-(--mk-ink)",
  sky: "bg-(--mk-sky) text-(--mk-ink)",
  ghost: "bg-card text-foreground",
};
const SIZE: Record<PxSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-lg",
};

// 링크(<a>)에도 같은 모양을 입힐 수 있게 클래스만 따로 내보낸다.
export function pxButtonClass(variant: PxVariant = "mint", size: PxSize = "md", className?: string) {
  return cn(
    "font-pixel inline-flex select-none items-center justify-center gap-2 whitespace-nowrap border-[3px] border-(--mk-px-edge) outline-none",
    "shadow-[4px_4px_0_0_var(--mk-px-edge)] hover:brightness-110",
    "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_var(--mk-px-edge)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mk-sky)",
    "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
    VARIANT[variant],
    SIZE[size],
    className,
  );
}

export function PxButton({ variant, size, className, type = "button", ...props }: ComponentProps<"button"> & { variant?: PxVariant; size?: PxSize }) {
  return <button type={type} className={pxButtonClass(variant, size, className)} {...props} />;
}
