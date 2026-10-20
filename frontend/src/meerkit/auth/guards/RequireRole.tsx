"use client";

import type { Role } from "../../types";
import { useAuth } from "../hooks";
import { RequireAuth } from "./RequireAuth";

function RoleCheck({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <p className="p-6 text-sm text-muted-foreground">불러오는 중…</p>;
  if (!user.roles.includes(role)) {
    return <p className="p-10 text-center text-sm text-destructive">접근 권한이 없습니다.</p>;
  }
  return <>{children}</>;
}

export function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RoleCheck role={role}>{children}</RoleCheck>
    </RequireAuth>
  );
}
