import { ROLES } from "../../roles";
import type { User } from "../../types";

export const roleOf = (id: number) => {
  const r = ROLES.find((x) => x.id === id) ?? ROLES[2];
  return { id: r.id, name: r.name };
};

const at = (day: number) => `2026-10-${String(day).padStart(2, "0")}T09:00:00Z`;

// docs 미리보기에서만 쓰는 목 데이터. 백엔드 없이도 화면이 열린다.
export const mockUsers: User[] = [
  { id: 1, user_id: "master01", email: "master@example.com", name: "김관리", role: roleOf(1), is_active: true, created_at: at(1), updated_at: at(1), deleted_at: null },
  { id: 2, user_id: "writer01", email: "writer@example.com", name: "이작성", role: roleOf(4), is_active: true, created_at: at(5), updated_at: at(5), deleted_at: null },
  { id: 3, user_id: "viewer01", email: "viewer@example.com", name: "박조회", role: roleOf(3), is_active: false, created_at: at(12), updated_at: at(12), deleted_at: null },
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
    role: roleOf(roleId),
    is_active: n % 5 !== 0,
    created_at: `2026-10-${day}T09:00:00Z`,
    updated_at: `2026-10-${day}T09:00:00Z`,
    deleted_at: n === 7 || n === 14 ? "2026-10-20T09:00:00Z" : null,
  };
});

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 미리보기용 이메일 인증 핸들러. 인증번호는 항상 123456 이다.
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

// 미리보기용 주소 검색. 실제 팝업 대신 고정된 주소를 돌려준다.
export const demoAddressSearch = async () => {
  await delay(500);
  return { postcode: "06236", address: "서울특별시 강남구 테헤란로 152" };
};
