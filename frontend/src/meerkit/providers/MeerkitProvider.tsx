"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Toaster } from "@/components/ui/sonner";

import { AuthDialog } from "../auth/components/AuthDialog";
import { useLockoutStore } from "../auth/lockout";
import { hasSessionHint, setSessionHint } from "../auth/session-hint";
import { useAuthStore } from "../auth/store";
import { meerkitConfig } from "../config";

// 새로고침 시 리프레시 쿠키로 액세스 토큰을 복원한다.
// 로그인한 적이 있는 브라우저에서만 요청한다 (처음 온 방문자나 문서만 보는 사람에게는 요청이 나가지 않는다).
function useRestoreSession() {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  useEffect(() => {
    if (meerkitConfig.docsOnly || !hasSessionHint()) return;
    fetch(`${meerkitConfig.apiBaseUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((r) => {
        if (r.status === 401) setSessionHint(false); // 세션이 끝났으면 표시를 지운다
        return r.ok ? r.json() : null;
      })
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
