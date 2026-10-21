import { notFound } from "next/navigation";

import { meerkitConfig } from "@/meerkit";
import { LegalPage } from "@/meerkit/legal/LegalPage";

export default function Page() {
  if (meerkitConfig.docsOnly) notFound();
  return <LegalPage kind="terms" />;
}
