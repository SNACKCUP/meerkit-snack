import { gridRuns } from "./grid";

// 8×8 픽셀 아이콘. 색은 글자색(currentColor)을 따른다.
const ICONS = {
  mic: ["..####..", "..####..", "..####..", "#.####.#", "#.####.#", "##....##", ".######.", "...##..."],
  upload: ["...##...", "..####..", ".######.", "...##...", "...##...", "........", "#......#", "########"],
  camera: ["........", "..####..", "########", "#.####.#", "#.#..#.#", "#.####.#", "########", "........"],
  check: ["........", "......##", ".....##.", "#...##..", "##.##...", ".###....", "..#.....", "........"],
  star: ["...##...", "...##...", "########", ".######.", "..####..", ".##..##.", ".#....#.", "........"],
  share: ["......##", "....#.##", "..##....", "###.....", "###.....", "..##....", "....#.##", "......##"],
  doc: ["#####...", "#...##..", "#...#.#.", "#...####", "#......#", "#.####.#", "#......#", "########"],
  lock: ["..####..", ".#....#.", ".#....#.", "########", "###..###", "###..###", "########", "########"],
  bolt: ["....##..", "...##...", "..##....", ".######.", "...##...", "..##....", ".##.....", "##......"],
} as const;

export type PixelIconName = keyof typeof ICONS;
export const PIXEL_ICON_NAMES = Object.keys(ICONS) as PixelIconName[];

export function PixelIcon({ name, size = 16, label, className }: { name: PixelIconName; size?: number; label?: string; className?: string }) {
  const d = gridRuns(ICONS[name]).map((r) => `M${r.x} ${r.y}h${r.w}v1h-${r.w}z`).join("");
  return (
    <svg
      viewBox="0 0 8 8"
      width={size}
      height={size}
      fill="currentColor"
      shapeRendering="crispEdges"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={d} />
    </svg>
  );
}
