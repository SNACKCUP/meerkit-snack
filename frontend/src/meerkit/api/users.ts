import type { ChangePasswordInput, MemberQuery, Page, UpdateProfileInput, User } from "../types";
import { api } from "./client";

export const usersApi = {
  list: (query: MemberQuery) =>
    api
      .get<Page<User>>("/users", {
        params: {
          q: query.q || undefined,
          role_id: query.roleId ?? undefined,
          status: query.status === "all" ? undefined : query.status,
          page: query.page,
          size: query.size,
        },
      })
      .then((r) => r.data),
  updateRole: (id: number, role_id: number) =>
    api.patch<User>(`/users/${id}/role`, { role_id }).then((r) => r.data),
  remove: (id: number) => api.delete(`/users/${id}`),
  updateMe: (input: UpdateProfileInput) => api.patch<User>("/users/me", input).then((r) => r.data),
  changePassword: (input: ChangePasswordInput) => api.patch("/users/me/password", input),
};
