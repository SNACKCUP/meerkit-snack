import { cn } from "@/lib/utils";

// Windows 98 진행 막대: 움푹 들어간 흰 칸 안에 남색 블록이 채워진다. 입력 레벨·업로드·처리 진행률에 쓴다.
export function PxBar({ value, max = 100, segments = 20, tone = "mint", label, className }: { value: number; max?: number; segments?: number; tone?: "mint" | "gold" | "pink" | "sky"; label: string; className?: string }) {
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const filled = Math.floor(ratio * segments + 1e-9);
  const fill = { mint: "bg-[#000080]", gold: "bg-[#808000]", pink: "bg-[#c00000]", sky: "bg-[#008080]" }[tone];
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(Math.max(value, 0), max)}
      className={cn("w98-in flex h-5 gap-[2px] bg-white p-[3px]", className)}
    >
      {Array.from({ length: segments }, (_, i) => (
        <span key={i} className={cn("h-full flex-1", i < filled ? fill : "bg-transparent")} />
      ))}
    </div>
  );
}
