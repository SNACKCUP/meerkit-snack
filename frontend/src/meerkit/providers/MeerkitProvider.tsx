"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Toaster } from "@/components/ui/sonner";

import { refreshAccessToken } from "../api/client";
import { AuthDialog } from "../auth/components/AuthDialog";

/** 킷 전체를 감싸는 Provider. app/layout.tsx 에서 한 번만 사용합니다. */
export function MeerkitProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      {children}
      <AuthDialog />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}

// 새로고침 직후 리프레시 쿠키로 로그인 상태를 되살립니다.
function AuthBootstrap() {
  useEffect(() => {
    void refreshAccessToken();
  }, []);
  return null;
}
