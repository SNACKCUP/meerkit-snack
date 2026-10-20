"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { meerkitConfig } from "../../config";
import { useAuth } from "../hooks";
import { useLogout } from "../mutations";

/** 로그인 후 헤더 메뉴: 이메일, 내 정보, (관리자) 관리자 페이지, 로그아웃 */
export function UserMenu() {
  const { user, isAdmin } = useAuth();
  const logout = useLogout();
  if (!user) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={meerkitConfig.routes.me} className="text-sm font-medium hover:underline">
        {user.email}
      </Link>
      {isAdmin && (
        <Button asChild variant="outline" size="sm">
          <Link href={meerkitConfig.routes.adminMembers}>관리자 페이지</Link>
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
      >
        로그아웃
      </Button>
    </div>
  );
}
