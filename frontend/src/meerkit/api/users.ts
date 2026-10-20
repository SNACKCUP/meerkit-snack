import { api } from "./client";
import type { RoleCode, User } from "../types";

// 관리자 전용 API
export const usersApi = {
  list: () => api.get<User[]>("/users").then((r) => r.data),
  updateRoles: (userId: number, roles: RoleCode[]) =>
    api.put<User>(`/users/${userId}/roles`, { roles }).then((r) => r.data),
  updateActive: (userId: number, isActive: boolean) =>
    api.patch<User>(`/users/${userId}/active`, { is_active: isActive }).then((r) => r.data),
};
