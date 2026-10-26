import type { Metadata } from "next";
import { Suspense } from "react";

import { Shell } from "./_components/Shell";

export const metadata: Metadata = { title: "매무새" };

export default function MaemusaeLayout({ children }: { children: React.ReactNode }) {
  // Shell이 현재 경로(usePathname)를 읽어서, 동적 경로에서는 Suspense 안에 두어야 빌드된다
  return (
    <Suspense fallback={null}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
