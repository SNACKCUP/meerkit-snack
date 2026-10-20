"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { meerkitConfig } from "../../config";
import type { User } from "../../types";

interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const isAdmin = user.roles.includes("admin");
  return (
    <div className="flex items-center gap-3 text-sm">
      <Link href={meerkitConfig.routes.me} className="hover:underline">{user.email}</Link>
      {isAdmin && (
        <Link href={meerkitConfig.routes.adminMembers} className="font-medium text-primary hover:underline">관리자</Link>
      )}
      <Button variant="outline" size="sm" onClick={onLogout}>로그아웃</Button>
    </div>
  );
}
