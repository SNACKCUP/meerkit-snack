import { ROLES, type RoleName } from "../../roles";
import type { User } from "../../types";

export const roleOf = (id: number) => {
  const r = ROLES.find((x) => x.id === id) ?? ROLES[2];
  return { id: r.id, name: r.name };
};

/** 역할 이름 목록 → 서버 응답과 같은 roles 배열 (ROLES 순서) */
export const rolesOf = (names: readonly RoleName[]) =>
  ROLES.filter((r) => names.includes(r.name)).map((r) => ({ id: r.id, name: r.name }));

const at = (day: number) => `2026-10-${String(day).padStart(2, "0")}T09:00:00Z`;

// docs 미리보기에서만 쓰는 목 데이터. 백엔드 없이도 화면이 열린다.
export const mockUsers: User[] = [
  { id: 1, user_id: "master01", email: "master@example.com", name: "김관리", email_verified: true, roles: [roleOf(1)], is_active: true, created_at: at(1), updated_at: at(1), deactivated_at: null, deleted_at: null },
  { id: 2, user_id: "writer01", email: "writer@example.com", name: "이작성", email_verified: true, roles: [roleOf(3), roleOf(4)], is_active: true, created_at: at(5), updated_at: at(5), deactivated_at: null, deleted_at: null },
  { id: 3, user_id: "viewer01", email: "viewer@example.com", name: "박조회", email_verified: false, roles: [roleOf(3)], is_active: false, created_at: at(12), updated_at: at(12), deactivated_at: null, deleted_at: null },
];

// 멤버 디렉터리 미리보기용 27명. 검색·필터·페이지네이션을 체험할 수 있다.
export const mockMembers: User[] = Array.from({ length: 27 }, (_, i) => {
  const n = i + 1;
  const roleId = n === 1 ? 1 : [2, 3, 4][n % 3];
  const day = String((n % 28) + 1).padStart(2, "0");
  return {
    id: n,
    user_id: `user${String(n).padStart(2, "0")}`,
    email: `user${String(n).padStart(2, "0")}@example.com`,
    name: `사용자${String(n).padStart(2, "0")}`,
    email_verified: true,
    roles: [roleOf(roleId)],
    is_active: n % 5 !== 0 && n !== 7 && n !== 14,
    created_at: `2026-10-${day}T09:00:00Z`,
    updated_at: `2026-10-${day}T09:00:00Z`,
    // 탈퇴한 계정: 탈퇴 시각만 있고, 개인정보 삭제(deleted_at)는 1년 뒤
    deactivated_at: n === 7 || n === 14 ? "2026-10-20T09:00:00Z" : null,
    deleted_at: null,
  };
});

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 미리보기용 이메일 인증 핸들러. 인증번호는 항상 123456 이다.
// 미리보기용 아이디 중복 확인. admin, master01 은 이미 있는 아이디로 친다.
export const demoCheckUserId = async (userId: string) => {
  await delay(400);
  return !["admin", "master01"].includes(userId);
};

export const demoEmailHandlers = {
  sendCode: async () => {
    await delay(600);
  },
  verifyCode: async (_email: string, code: string) => {
    await delay(600);
    if (code !== "123456") throw new Error("인증번호가 올바르지 않습니다.");
    return "demo-token";
  },
};

// 주소 검색 창 미리보기용 데이터 150건. 결과가 많을 때 "더 보기"가 어떻게 동작하는지 체험할 수 있다.
const ROADS = ["테헤란로", "봉은사로", "선릉로", "강남대로", "역삼로", "논현로"];
const BUILDINGS = ["", "", "미어캣타워", "", "", "스타터빌딩", "", "", "그린오피스", ""];
const addressData = ROADS.flatMap((road, r) =>
  Array.from({ length: 25 }, (_, i) => {
    const n = i + 1;
    const building = BUILDINGS[(r + n) % BUILDINGS.length];
    return {
      postcode: String(6000 + r * 40 + n).padStart(5, "0"),
      address: `서울특별시 강남구 ${road} ${n}`,
      jibun_address: `서울특별시 강남구 역삼동 ${700 + r * 30 + n}-${n}`,
      building_name: building || undefined,
    };
  }),
);

export const demoAddressProvider = async (query: string, page: number, size: number) => {
  await delay(450);
  // 오류 화면을 보여 주기 위한 데모용 입력
  if (query.trim() === "오류") throw new Error("서버에 연결할 수 없습니다.");
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matched = addressData.filter((a) => {
    const hay = `${a.address} ${a.jibun_address} ${a.building_name ?? ""}`.toLowerCase();
    return tokens.every((t) => hay.includes(t));
  });
  const start = (page - 1) * size;
  return { items: matched.slice(start, start + size), total: matched.length, isEnd: start + size >= matched.length };
};

// ── 멤버 AI 사용량 미리보기용 목 데이터 (현재는 프론트 UI만 있고 실제 집계는 추후 적용) ──
export const mockUsage = {
  ok: { used: 3200, limit: 10000, unit: "토큰", resetAt: new Date(Date.now() + 9 * 86_400_000).toISOString() },
  warn: { used: 8100, limit: 10000, unit: "토큰", resetAt: new Date(Date.now() + 4 * 86_400_000).toISOString() },
  danger: { used: 9650, limit: 10000, unit: "토큰", resetAt: new Date(Date.now() + 2 * 86_400_000).toISOString() },
  unlimited: { used: 42300, limit: null, unit: "토큰" },
};

const dayValues = [120, 340, 210, 480, 390, 150, 90, 520, 610, 430, 380, 260, 700, 560];
export const mockUsageHistory = {
  day: dayValues.map((value, i) => ({ label: `10/${String(i + 7).padStart(2, "0")}`, value })),
  week: [1800, 2400, 1950, 3100, 2750, 3300, 2900, 3650].map((value, i) => ({ label: `${i + 1}주`, value })),
  month: [6200, 7800, 9100, 8400, 10300, 11800].map((value, i) => ({ label: `${i + 5}월`, value })),
};
