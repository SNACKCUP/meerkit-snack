import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { usersApi } from "../api/users";
import type { Role } from "../types";

const membersKey = ["meerkit", "admin", "members"] as const;

export function useMembers() {
  return useQuery({ queryKey: membersKey, queryFn: usersApi.list });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: Role }) => usersApi.updateRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membersKey }),
  });
}

export function useUpdateActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => usersApi.updateActive(id, active),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membersKey }),
  });
}
