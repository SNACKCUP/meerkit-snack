import { notFound } from "next/navigation";
import { Suspense } from "react";

import { meerkitConfig } from "@/meerkit";
import { ResetPasswordPage } from "@/meerkit/auth/ResetPasswordPage";

export default function Page() {
  if (meerkitConfig.docsOnly) notFound();
  // useSearchParams는 Suspense 안에서 읽어야 한다.
  return (
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  );
}
