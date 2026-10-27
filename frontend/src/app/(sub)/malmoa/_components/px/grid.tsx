// 문자 격자 → SVG 경로. 같은 줄에서 이어지는 칸은 하나의 사각형으로 합친다.
export type Palette = Record<string, string>;

export function gridRuns(rows: readonly string[], skip = "."): { x: number; y: number; w: number; ch: string }[] {
  const runs: { x: number; y: number; w: number; ch: string }[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === skip) {
        x++;
        continue;
      }
      let w = 1;
      while (x + w < row.length && row[x + w] === ch) w++;
      runs.push({ x, y, w, ch });
      x += w;
    }
  });
  return runs;
}
