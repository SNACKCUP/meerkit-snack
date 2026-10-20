import type { Role, User } from "../types";
import { api } from "./client";

export const usersApi = {
  list: () => api.get<User[]>("/admin/users").then((r) => r.data),
  updateRole: (id: number, role: Role) =>
    api.patch<User>(`/admin/users/${id}/role`, { role }).then((r) => r.data),
  updateActive: (id: number, is_active: boolean) =>
    api.patch<User>(`/admin/users/${id}/active`, { is_active }).then((r) => r.data),
};
