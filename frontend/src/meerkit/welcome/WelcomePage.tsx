"use client";

import { ArrowRight, BookOpen, Container, LayoutGrid, ShieldCheck, Terminal, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { UserMenu } from "../auth/components/UserMenu";
import { useAuthDialog } from "../auth/dialog-store";
import { useAuth } from "../auth/hooks";
import { useLogout } from "../auth/mutations";
import { meerkitConfig } from "../config";

const features = [
  { icon: UserPlus, title: "회원가입 · 로그인", desc: "모달 UI, 토큰 보관, 자동 갱신까지 연결되어 있습니다." },
  { icon: ShieldCheck, title: "역할 기반 권한", desc: "admin / user 역할과 라우트 가드를 바로 사용합니다." },
  { icon: LayoutGrid, title: "shadcn/ui", desc: "토큰 한 곳만 고치면 전체 색과 모양이 바뀝니다." },
  { icon: Container, title: "원커맨드 세팅", desc: "DB, 백엔드, 프론트를 한 번에 실행합니다." },
];

const steps = ["npx create-meerkit my-app", "cd my-app", "npx meerkit setup"];

export function WelcomePage() {
  const { user, isAuthenticated } = useAuth();
  const openDialog = useAuthDialog((s) => s.openDialog);
  const logout = useLogout();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
            <Image src="/meerkit-logo.png" alt="" width={32} height={32} className="size-8 object-contain" />
            MeerKit
          </div>
          <nav className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <a href={meerkitConfig.docsUrl} target="_blank" rel="noreferrer">문서</a>
            </Button>
            {meerkitConfig.showUiPage && (
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href={meerkitConfig.routes.ui}>UI 모음</Link>
              </Button>
            )}
            {isAuthenticated && user ? (
              <UserMenu user={user} onLogout={() => logout.mutate()} />
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => openDialog("login")}>로그인</Button>
                <Button size="sm" onClick={() => openDialog("signup")}>회원가입</Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        <section className="flex flex-col items-center gap-6 pb-16 pt-20 text-center">
          <Image src="/meerkit-logo.png" alt="MeerKit 로고" width={220} height={220} priority className="h-auto w-44 sm:w-56" />
          <Badge variant="warm">AI 서비스 스타터킷</Badge>
          <h1 className="max-w-2xl text-balance text-4xl font-extrabold tracking-tight sm:text-6xl">
            더 빨리, 더 많이 <span className="text-primary">시작</span>하세요
          </h1>
          <p className="max-w-xl text-balance text-lg text-muted-foreground">
            인증, 권한, 관리자 화면까지 갖춘 Next.js + FastAPI 킷. 명령어 한 줄이면 로컬에서 바로 돌아갑니다.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button size="lg" onClick={() => openDialog("signup")}>
              지금 시작하기 <ArrowRight />
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={meerkitConfig.docsUrl} target="_blank" rel="noreferrer">
                <BookOpen /> 사용 설명서
              </a>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-2xl pb-16">
          <div className="overflow-hidden rounded-xl border bg-navy text-cream shadow-lg">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-xs text-white/60">
              <Terminal className="size-3.5" /> Quick start
              <span className="ml-auto flex gap-1.5">
                <i className="size-2.5 rounded-full bg-paw" />
                <i className="size-2.5 rounded-full bg-meerkat" />
                <i className="size-2.5 rounded-full bg-primary" />
              </span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-sm leading-7">
              {steps.map((s) => (
                <div key={s}><span className="text-paw">$</span> {s}</div>
              ))}
            </pre>
          </div>
        </section>

        <section className="grid gap-4 pb-24 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <CardHeader>
                <div className="mb-1 flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Icon className="size-4.5" />
                </div>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">© MeerKit</footer>
    </div>
  );
}
