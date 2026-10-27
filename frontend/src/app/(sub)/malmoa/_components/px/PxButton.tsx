import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type PxVariant = "mint" | "gold" | "pink" | "sky" | "ghost";
export type PxSize = "sm" | "md" | "lg";

// Windows 98 단추: 모두 회색 입체. mint는 "기본 단추"(검은 바깥 테두리), pink는 위험한 동작(붉은 글자).
const VARIANT: Record<PxVariant, string> = {
  mint: "outline outline-1 outline-black",
  gold: "",
  pink: "text-(--mk-pink)",
  sky: "",
  ghost: "",
};
const SIZE: Record<PxSize, string> = {
  sm: "h-7 min-w-16 px-3 text-sm",
  md: "h-8 min-w-20 px-4 text-[15px]",
  lg: "h-10 min-w-28 px-6 text-base",
};

// 링크(<a>)에도 같은 모양을 입힐 수 있게 클래스만 따로 내보낸다. 눌리면 즉시 들어간다.
export function pxButtonClass(variant: PxVariant = "mint", size: PxSize = "md", className?: string) {
  return cn(
    "font-pixel w98-out w98-focus inline-flex select-none items-center justify-center gap-2 whitespace-nowrap bg-(--mk-face) text-black outline-none",
    "active:shadow-[inset_-1px_-1px_#fff,inset_1px_1px_#0a0a0a,inset_-2px_-2px_#dfdfdf,inset_2px_2px_#808080] active:[&>*]:translate-x-px active:[&>*]:translate-y-px",
    "disabled:pointer-events-none disabled:text-(--mk-shade) disabled:[text-shadow:1px_1px_0_#fff]",
    VARIANT[variant],
    SIZE[size],
    className,
  );
}

export function PxButton({ variant, size, className, type = "button", ...props }: ComponentProps<"button"> & { variant?: PxVariant; size?: PxSize }) {
  return <button type={type} className={pxButtonClass(variant, size, className)} {...props} />;
}
