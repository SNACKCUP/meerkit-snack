import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DocsSearch, meerkitConfig } from "@/meerkit";

export const metadata: Metadata = { title: "문서 검색", robots: { index: false, follow: false } };

export default function Page() {
  if (!meerkitConfig.showDocsPage) notFound();
  // useSearchParams는 Suspense 안에서 읽어야 한다.
  return (
    <Suspense>
      <DocsSearch />
    </Suspense>
  );
}
