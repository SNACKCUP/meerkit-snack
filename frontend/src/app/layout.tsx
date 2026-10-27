import type { Metadata } from "next";

import { MeerkitProvider, meerkitConfig, themeInitScript } from "@/meerkit";

import "./globals.css";

export const metadata: Metadata = {
  title: "Meerkit",
  description: "인증과 유저 관리를 갖춘 AI 서비스 스타터킷",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" suppressHydrationWarning data-mk-theme={meerkitConfig.theme} data-mk-motion={meerkitConfig.motion ? "on" : "off"}>
      <head>
        {/* 첫 화면이 그려지기 전에 저장된 테마를 적용해서 새로고침 때 깜빡이지 않게 한다 */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <MeerkitProvider>{children}</MeerkitProvider>
      </body>
    </html>
  );
}
