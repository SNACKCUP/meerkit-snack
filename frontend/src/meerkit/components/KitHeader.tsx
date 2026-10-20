"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { UserMenu } from "../auth/components/UserMenu";
import { useAuthDialog } from "../auth/dialog-store";
import { useAuth } from "../auth/hooks";
import { meerkitConfig } from "../config";

/** 킷 화면(/me, /admin/...) 위쪽 헤더 */
export function KitHeader() {
  const { isAuthenticated, isLoading } = useAuth();
  const openDialog = useAuthDialog((s) => s.openDialog);

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href={meerkitConfig.routes.home} className="flex items-center gap-2 font-semibold">
          <Image src="/meerkit-logo.svg" alt="" width={28} height={28} />
          MeerKit
        </Link>
        {!isLoading &&
          (isAuthenticated ? (
            <UserMenu />
          ) : (
            <Button size="sm" onClick={() => openDialog("login")}>
              로그인
            </Button>
          ))}
      </div>
    </header>
  );
}
