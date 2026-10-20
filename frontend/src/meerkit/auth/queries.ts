import { useQuery } from "@tanstack/react-query";

import { authApi } from "../api/auth";
import { useAuthStore } from "./store";

export const meQueryKey = ["meerkit", "me"] as const;

/** 내 정보. 로그인 상태일 때만 서버에 요청합니다. */
export function useMe() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: meQueryKey,
    queryFn: authApi.me,
    enabled: status === "authenticated",
    staleTime: 60_000,
  });
}
