"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";

import { UserMenu } from "../auth/components/UserMenu";
import { useAuthDialog } from "../auth/dialog-store";
import { useAuth } from "../auth/hooks";
import { meerkitConfig } from "../config";

/** 킷의 초기 화면. app/page.tsx 를 자기 화면으로 바꾸면 이 화면은 더 이상 쓰이지 않습니다. */
export function WelcomePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const openDialog = useAuthDialog((s) => s.openDialog);

  return (
    <main className="bg-sand-50 flex min-h-dvh items-center justify-center px-4 py-16">
      <section className="grid max-w-md justify-items-center gap-6 text-center">
        <Image src="/meerkit-logo.svg" alt="MeerKit 로고" width={96} height={96} priority />
        <div className="grid gap-2">
          <h1 className="text-4xl font-bold tracking-tight">MeerKit</h1>
          <p className="text-muted-foreground">더 빨리, 더 많이 시작하는 AI 서비스 스타터킷</p>
        </div>

        <div className="flex min-h-10 flex-wrap items-center justify-center gap-3">
          {isLoading ? null : isAuthenticated ? (
            <div className="grid justify-items-center gap-3">
              <p className="text-sm">{user?.name}님, 반가워요.</p>
              <UserMenu />
            </div>
          ) : (
            <>
              <Button size="lg" onClick={() => openDialog("login")}>
                로그인
              </Button>
              <Button size="lg" variant="outline" onClick={() => openDialog("signup")}>
                회원가입
              </Button>
            </>
          )}
          <Button asChild size="lg" variant="link">
            <a href={meerkitConfig.docsUrl} target="_blank" rel="noreferrer">
              사용 설명서
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
}
