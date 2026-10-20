"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { User } from "../../types";
import { useUpdateRole } from "../queries";

/** 일반 사용자 ↔ 관리자 전환. (USER 역할은 서버가 항상 유지합니다) */
export function RoleSelect({ member, disabled }: { member: User; disabled?: boolean }) {
  const updateRole = useUpdateRole();
  const value = member.roles.includes("ADMIN") ? "ADMIN" : "USER";

  return (
    <Select
      value={value}
      disabled={disabled || updateRole.isPending}
      onValueChange={(next) =>
        updateRole.mutate({ userId: member.id, roles: next === "ADMIN" ? ["ADMIN"] : ["USER"] })
      }
    >
      <SelectTrigger size="sm" className="w-32" aria-label={`${member.email} 역할`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="USER">일반 사용자</SelectItem>
        <SelectItem value="ADMIN">관리자</SelectItem>
      </SelectContent>
    </Select>
  );
}
