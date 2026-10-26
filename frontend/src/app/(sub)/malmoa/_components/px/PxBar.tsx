import { cn } from "@/lib/utils";

// 칸이 채워지는 게이지. 경험치·업로드·처리 진행률에 쓴다.
export function PxBar({ value, max = 100, segments = 20, tone = "mint", label, className }: { value: number; max?: number; segments?: number; tone?: "mint" | "gold" | "pink" | "sky"; label: string; className?: string }) {
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const filled = Math.floor(ratio * segments + 1e-9);
  const fill = { mint: "bg-(--mk-mint)", gold: "bg-(--mk-gold)", pink: "bg-(--mk-pink)", sky: "bg-(--mk-sky)" }[tone];
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(Math.max(value, 0), max)}
      className={cn("flex h-5 gap-[2px] border-[3px] border-(--mk-px-edge) bg-(--mk-px-edge) p-[2px]", className)}
    >
      {Array.from({ length: segments }, (_, i) => (
        <span key={i} className={cn("h-full flex-1 transition-colors duration-500", i < filled ? fill : "bg-muted")} />
      ))}
    </div>
  );
}
