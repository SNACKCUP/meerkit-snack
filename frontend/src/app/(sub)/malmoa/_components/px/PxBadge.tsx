import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const TONE = {
  mint: "bg-(--mk-mint) text-(--mk-ink)",
  gold: "bg-(--mk-gold) text-(--mk-ink)",
  pink: "bg-(--mk-pink) text-(--mk-ink)",
  sky: "bg-(--mk-sky) text-(--mk-ink)",
  muted: "bg-muted text-muted-foreground",
} as const;

export function PxBadge({ tone = "muted", className, ...props }: ComponentProps<"span"> & { tone?: keyof typeof TONE }) {
  return <span className={cn("font-pixel inline-flex items-center gap-1 border-2 border-(--mk-px-edge) px-2 text-sm leading-6", TONE[tone], className)} {...props} />;
}
