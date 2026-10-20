import { useQuery } from "@tanstack/react-query";

import { authApi } from "../api/auth";
import { useAuthStore } from "./store";

export const meKey = ["meerkit", "me"] as const;

export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({ queryKey: meKey, queryFn: authApi.me, enabled: !!accessToken, retry: false });
}
