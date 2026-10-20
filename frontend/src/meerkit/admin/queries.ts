import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { errorMessage } from "../api/client";
import { usersApi } from "../api/users";
import type { RoleCode, User } from "../types";

const membersKey = ["meerkit", "members"] as const;

export function useMembers() {
  return useQuery({ queryKey: membersKey, queryFn: usersApi.list });
}

function useUpdateMember<T>(mutationFn: (vars: T) => Promise<User>, successText: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (updated) => {
      // 목록에 즉시 반영
      queryClient.setQueryData<User[]>(membersKey, (members) =>
        members?.map((m) => (m.id === updated.id ? updated : m)),
      );
      toast.success(successText);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useUpdateRole() {
  return useUpdateMember(
    ({ userId, roles }: { userId: number; roles: RoleCode[] }) => usersApi.updateRoles(userId, roles),
    "역할을 바꿨어요.",
  );
}

export function useUpdateActive() {
  return useUpdateMember(
    ({ userId, isActive }: { userId: number; isActive: boolean }) =>
      usersApi.updateActive(userId, isActive),
    "계정 상태를 바꿨어요.",
  );
}
