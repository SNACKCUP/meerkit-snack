import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { usersApi } from "../api/users";
import type { MemberQuery } from "../types";

const membersKey = ["meerkit", "admin", "members"] as const;

// 조건이 바뀌어도 새 결과가 오기 전까지 이전 목록을 보여 줘서 화면이 깜빡이지 않는다.
export function useMembers(query: MemberQuery) {
  return useQuery({
    queryKey: [...membersKey, query],
    queryFn: () => usersApi.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roleId }: { id: number; roleId: number }) => usersApi.updateRole(id, roleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membersKey }),
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membersKey }),
  });
}
