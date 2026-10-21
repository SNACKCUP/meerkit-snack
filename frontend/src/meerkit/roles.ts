// 회의 정리 기준 역할 4종. 값이 확정되면 이 파일만 고친다.
export const ROLES = [
  { id: 1, name: "MASTER", description: "시스템 전체 관리자", crud: "CRUD" },
  { id: 2, name: "OWNER", description: "자신이 소유한 데이터 관리", crud: "CRUD" },
  { id: 3, name: "VIEWER", description: "조회 전용 사용자", crud: "R" },
  { id: 4, name: "WRITER", description: "데이터 작성 및 수정 사용자", crud: "CRU" },
] as const;

export type RoleName = (typeof ROLES)[number]["name"];

export const ADMIN_ROLE: RoleName = "MASTER";
