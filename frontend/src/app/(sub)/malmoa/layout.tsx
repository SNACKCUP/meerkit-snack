import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
import { Suspense } from "react";

import { Shell } from "./_components/Shell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const TITLE = "말모아 — 회의는 말로, 기록은 글로";
const DESCRIPTION = "회의 내용을 말로 모으면 AI가 문서로 만들어 주는 회의록 서비스입니다. 옛 윈도우 같은 도트 화면으로 동작합니다.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s | 말모아" },
  description: DESCRIPTION,
  applicationName: "말모아",
  alternates: { canonical: "/malmoa" },
  openGraph: { type: "website", locale: "ko_KR", siteName: "말모아", url: "/malmoa", title: TITLE, description: DESCRIPTION },
};

export const viewport: Viewport = { themeColor: "#008080", colorScheme: "light" };

export default function MalmoaLayout({ children }: { children: React.ReactNode }) {
  // 픽셀 글꼴은 말모아 화면에서만 미리 받는다
  preload("/malmoa/fonts/DungGeunMo.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  // Shell이 훅을 쓰는 동적 경로 대비: Suspense 안에 둔다
  return (
    <Suspense fallback={null}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
