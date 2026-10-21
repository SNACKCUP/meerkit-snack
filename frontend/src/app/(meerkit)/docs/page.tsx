import { notFound } from "next/navigation";

import { DocsView, meerkitConfig } from "@/meerkit";

export default function Page() {
  if (!meerkitConfig.showDocsPage) notFound();
  return <DocsView slug="introduction" />;
}
