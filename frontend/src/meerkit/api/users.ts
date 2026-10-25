import type { RoleName } from "../roles";
import type { ChangePasswordInput, MemberQuery, Page, UpdateProfileInput, User, WithdrawInput } from "../types";
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
  // 역할을 통째로 바꾼다. 역할 코드 목록을 보낸다 (예: ["WRITER", "OWNER"])
  updateRoles: (id: number, roles: RoleName[]) =>
    api.put<User>(`/users/${id}/roles`, { roles }).then((r) => r.data),
  remove: (id: number) => api.delete(`/users/${id}`),
  updateMe: (input: Partial<UpdateProfileInput>) => api.patch<User>("/users/me", input).then((r) => r.data),
  changePassword: (input: ChangePasswordInput) => api.patch("/users/me/password", input),
  // 탈퇴: 계정이 막히고, 보관 기간이 지나면 개인정보가 지워진다
  withdraw: (input: WithdrawInput) => api.delete("/users/me", { data: input }),
};
