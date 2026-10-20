"use client";

import type { RoleCode } from "../../types";
import { usePermission } from "../hooks";
import { RequireAuth } from "./RequireAuth";

/** 로그인 + 지정한 역할이 있어야 children을 보여 줍니다. 서버도 같은 규칙으로 403을 돌려줍니다. */
export function RequireRole({ role, children }: { role: RoleCode; children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RoleCheck role={role}>{children}</RoleCheck>
    </RequireAuth>
  );
}

function RoleCheck({ role, children }: { role: RoleCode; children: React.ReactNode }) {
  const allowed = usePermission(role);
  if (!allowed) {
    return (
      <p role="alert" className="text-destructive p-6">
        이 화면을 볼 권한이 없어요. (403)
      </p>
    );
  }
  return <>{children}</>;
}
