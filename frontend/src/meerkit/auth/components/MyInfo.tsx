"use client";

import { Badge } from "@/components/ui/badge";

import { useAuth } from "../hooks";

/** 내 정보 카드 (/me) */
export function MyInfo() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <dl className="grid max-w-md grid-cols-[6rem_1fr] gap-x-4 gap-y-3 rounded-lg border p-6 text-sm">
      <dt className="text-muted-foreground">이름</dt>
      <dd>{user.name}</dd>
      <dt className="text-muted-foreground">이메일</dt>
      <dd>{user.email}</dd>
      <dt className="text-muted-foreground">역할</dt>
      <dd className="flex gap-1">
        {user.roles.map((role) => (
          <Badge key={role} variant={role === "ADMIN" ? "default" : "secondary"}>
            {role}
          </Badge>
        ))}
      </dd>
    </dl>
  );
}
