"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthPanel } from "@/meerkit";

import { PixelMeerkat, PxCard } from "../_components/px";

export default function Page() {
  const router = useRouter();
  return (
    <div className="mx-auto grid w-full max-w-md gap-6 px-5 py-12">
      <div className="flex items-end gap-4" data-rise>
        <PixelMeerkat level={1} size={72} bob />
        <div>
          <p className="font-pixel text-sm text-(--mk-mint)">새 게임</p>
          <h1 className="font-pixel text-4xl">회원가입</h1>
        </div>
      </div>
      <p className="text-muted-foreground" data-rise>정보를 입력해 계정을 만드세요.</p>
      <PxCard data-rise>
        <AuthPanel mode="signup" onSuccess={() => router.push("/malmoa")} />
      </PxCard>
      <p className="text-center text-sm text-muted-foreground" data-rise>
        이미 계정이 있으신가요? <Link href="/malmoa/login" className="font-pixel text-base text-(--mk-gold) underline underline-offset-4">로그인</Link>
      </p>
    </div>
  );
}
