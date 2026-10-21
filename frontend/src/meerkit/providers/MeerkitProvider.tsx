"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Toaster } from "@/components/ui/sonner";

import { AuthDialog } from "../auth/components/AuthDialog";
import { useLockoutStore } from "../auth/lockout";
import { useAuthStore } from "../auth/store";
import { meerkitConfig } from "../config";

// 새로고침 시 리프레시 쿠키로 액세스 토큰을 복원한다.
function useRestoreSession() {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  useEffect(() => {
    fetch(`${meerkitConfig.apiBaseUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data?.access_token && setAccessToken(data.access_token))
      .catch(() => {});
  }, [setAccessToken]);
}

export function MeerkitProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  useRestoreSession();
  // 로그인 실패 횟수·잠금 시각을 sessionStorage에서 복원한다 (새로고침해도 유지)
  useEffect(() => {
    useLockoutStore.persist.rehydrate();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <AuthDialog />
      <Toaster />
    </QueryClientProvider>
  );
}
