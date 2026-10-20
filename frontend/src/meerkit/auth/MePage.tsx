"use client";

import { RequireAuth } from "./guards/RequireAuth";
import { useAuth } from "./hooks";

function MeContent() {
  const { user } = useAuth();
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">내 정보</h1>
      <dl className="mt-6 grid gap-2 text-sm">
        <dt className="text-muted-foreground">이메일</dt>
        <dd>{user?.email}</dd>
        <dt className="text-muted-foreground">역할</dt>
        <dd>{user?.roles.join(", ")}</dd>
      </dl>
    </main>
  );
}

export function MePage() {
  return (
    <RequireAuth>
      <MeContent />
    </RequireAuth>
  );
}
