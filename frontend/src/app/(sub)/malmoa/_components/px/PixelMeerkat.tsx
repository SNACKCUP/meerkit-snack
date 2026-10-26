import { cn } from "@/lib/utils";

import { gridRuns, type Palette } from "./grid";

// 말모아 마스코트. 16×16 픽셀 미어캣이 레벨(1~10)에 따라 장비를 얻으며 진화한다.
const BASE = [
  "................",
  "....oo....oo....",
  "...obbo..obbo...",
  "...oobbbbbboo...",
  "..obbbbbbbbbbo..",
  "..obddbbbbddbo..",
  "..odwkdbbdkwdo..",
  "..obddbbbbddbo..",
  "..obbbboobbbbo..",
  "...obllllllbo...",
  "....obllllbo....",
  "...obbllllbbo...",
  "...obbllllbbo...",
  "....obbllbbo....",
  "....obbbbbbo....",
  "...ooo....ooo...",
];

const PALETTE: Palette = {
  o: "#2a1b3d",
  b: "#d9a066",
  l: "#f4dfb8",
  d: "#5b3a29",
  w: "#ffffff",
  k: "#14122b",
  g: "#3ddc97",
  s: "#4cc9f0",
  r: "#ff4d8d",
  y: "#ffd23f",
};

// [줄, 시작 칸, 글자들] — 기본 그림 위에 덮어쓰는 장비
type Patch = [number, number, string];
const LEAF: Patch[] = [[0, 7, "gg"], [1, 7, "gg"]];
const SCARF: Patch[] = [[10, 4, "ssssssss"], [11, 5, "ss"]];
const BAND_PINK: Patch[] = [[3, 5, "rrrrrr"]];
const BAND_GOLD: Patch[] = [[3, 5, "yyyyyy"]];
const CROWN: Patch[] = [[0, 5, "y.yy.y"], [1, 6, "yyyy"]];

export function meerkatTier(level: number): number {
  if (level <= 2) return 0;
  if (level <= 4) return 1;
  if (level <= 6) return 2;
  if (level <= 8) return 3;
  return 4;
}

function patchesFor(level: number): Patch[] {
  switch (meerkatTier(level)) {
    case 0: return LEAF;
    case 1: return SCARF;
    case 2: return [...SCARF, ...BAND_PINK];
    case 3: return [...SCARF, ...BAND_GOLD];
    default: return [...SCARF, ...CROWN];
  }
}

function compose(level: number): string[] {
  const rows = BASE.map((r) => r.split(""));
  for (const [y, x, chars] of patchesFor(level)) {
    [...chars].forEach((ch, i) => {
      if (ch !== ".") rows[y][x + i] = ch;
    });
  }
  return rows.map((r) => r.join(""));
}

export function PixelMeerkat({ level = 1, size = 96, bob = false, label, className }: { level?: number; size?: number; bob?: boolean; label?: string; className?: string }) {
  const runs = gridRuns(compose(level));
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={cn(bob && "mp-bob", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {runs.map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height={1} fill={PALETTE[r.ch]} />
      ))}
    </svg>
  );
}
