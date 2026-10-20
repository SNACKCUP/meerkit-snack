"use client";

import { Button } from "@/components/ui/button";

import { useAuthDialog } from "../dialog-store";
import { useAuth } from "../hooks";

/** 로그인한 사용자에게만 children을 보여 줍니다. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const openDialog = useAuthDialog((s) => s.openDialog);

  if (isLoading) {
    return <p className="text-muted-foreground p-6 text-sm">불러오는 중...</p>;
  }
  if (!isAuthenticated) {
    return (
      <div className="grid justify-items-start gap-3 p-6">
        <p>로그인이 필요한 화면이에요.</p>
        <Button onClick={() => openDialog("login")}>로그인</Button>
      </div>
    );
  }
  return <>{children}</>;
}
