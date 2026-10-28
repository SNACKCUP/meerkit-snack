import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocsView, meerkitConfig } from "@/meerkit";

export const metadata: Metadata = { title: "문서", description: "Meerkit이 무엇이고 무엇을 제공하는지 소개합니다.", alternates: { canonical: "/docs" } };

export default function Page() {
  if (!meerkitConfig.showDocsPage) notFound();
  return <DocsView slug="introduction" />;
}
