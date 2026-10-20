"use client";

import { RequireRole } from "../auth/guards/RequireRole";
import { MemberTable } from "./components/MemberTable";
import { useMembers, useUpdateActive, useUpdateRole } from "./queries";

function Members() {
  const { data, isLoading, isError } = useMembers();
  const updateRole = useUpdateRole();
  const updateActive = useUpdateActive();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">멤버 관리</h1>
      {isLoading && <p className="text-sm text-muted-foreground">불러오는 중…</p>}
      {isError && <p className="text-sm text-destructive">목록을 불러오지 못했습니다.</p>}
      {data && (
        <MemberTable
          members={data}
          onRoleChange={(id, role) => updateRole.mutate({ id, role })}
          onActiveChange={(id, active) => updateActive.mutate({ id, active })}
        />
      )}
    </main>
  );
}

export function AdminMembersPage() {
  return (
    <RequireRole role="admin">
      <Members />
    </RequireRole>
  );
}
