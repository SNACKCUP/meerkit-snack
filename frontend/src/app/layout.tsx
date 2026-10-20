import type { Metadata } from "next";

import { MeerkitProvider } from "@/meerkit";

import "./globals.css";

export const metadata: Metadata = {
  title: "MeerKit",
  description: "더 빨리, 더 많이 시작하는 AI 서비스 스타터킷",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>
        <MeerkitProvider>{children}</MeerkitProvider>
      </body>
    </html>
  );
}
