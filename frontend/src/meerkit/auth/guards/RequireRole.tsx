"use client";

import { hasRole, type RoleName } from "../../roles";
import { useAuth } from "../hooks";
import { LoadingState } from "../../loading";
import { RequireAuth } from "./RequireAuth";

function RoleCheck({ role, children }: { role: RoleName; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <LoadingState fullPage />;
  if (!hasRole(user, role)) {
    return <p className="p-10 text-center text-sm text-destructive">접근 권한이 없습니다.</p>;
  }
  return <>{children}</>;
}

export function RequireRole({ role, children }: { role: RoleName; children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RoleCheck role={role}>{children}</RoleCheck>
    </RequireAuth>
  );
}
