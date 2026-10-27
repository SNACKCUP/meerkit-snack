import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const TONE = {
  mint: "bg-[#000080] text-white",
  gold: "bg-[#ffffa0] text-black",
  pink: "bg-[#c00000] text-white",
  sky: "bg-[#008080] text-white",
  muted: "bg-(--mk-light) text-black",
} as const;

export function PxBadge({ tone = "muted", className, ...props }: ComponentProps<"span"> & { tone?: keyof typeof TONE }) {
  return <span className={cn("font-pixel inline-flex items-center gap-1 border border-black px-2 text-sm leading-5", TONE[tone], className)} {...props} />;
}
