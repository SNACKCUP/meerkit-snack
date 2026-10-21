import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DocsSearch, meerkitConfig } from "@/meerkit";

export default function Page() {
  if (!meerkitConfig.showDocsPage) notFound();
  // useSearchParams는 Suspense 안에서 읽어야 한다.
  return (
    <Suspense>
      <DocsSearch />
    </Suspense>
  );
}
