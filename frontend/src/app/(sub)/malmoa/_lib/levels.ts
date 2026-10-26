// 경험치와 레벨. 레벨 n → n+1에 필요한 경험치는 n × 100, 레벨 n에 도달하는 누적 경험치는 50·n·(n-1).
export const MAX_LEVEL = 10;

export const LEVEL_TITLES = [
  "새싹 서기",
  "견습 서기",
  "스카프 서기",
  "서기관",
  "기록가",
  "숙련 기록가",
  "베테랑 기록가",
  "기록 마스터",
  "회의의 왕",
  "회의의 신",
] as const;

export const xpForLevel = (level: number) => 50 * level * (level - 1);

export function levelOf(xp: number): number {
  let lv = 1;
  while (lv < MAX_LEVEL && xp >= xpForLevel(lv + 1)) lv++;
  return lv;
}

export function titleOf(level: number): string {
  return LEVEL_TITLES[Math.min(Math.max(level, 1), MAX_LEVEL) - 1];
}

// 현재 레벨 안에서의 진행: { into: 이번 레벨에서 모은 양, need: 다음 레벨까지 필요한 총량 }
export function levelProgress(xp: number): { level: number; into: number; need: number; maxed: boolean } {
  const level = levelOf(xp);
  if (level >= MAX_LEVEL) return { level, into: 1, need: 1, maxed: true };
  const base = xpForLevel(level);
  return { level, into: xp - base, need: xpForLevel(level + 1) - base, maxed: false };
}
