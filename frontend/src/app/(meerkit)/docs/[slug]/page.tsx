import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DocsView, allDocs, meerkitConfig } from "@/meerkit";

export function generateStaticParams() {
  return allDocs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/docs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const doc = allDocs.find((d) => d.slug === slug);
  if (!doc) return {};
  return { title: doc.title, description: doc.description, alternates: { canonical: `/docs/${slug}` }, openGraph: { title: `${doc.title} | Meerkit`, description: doc.description, url: `/docs/${slug}` } };
}

async function DocsBySlug({ params }: { params: PageProps<"/docs/[slug]">["params"] }) {
  const { slug } = await params;
  if (!meerkitConfig.showDocsPage || !allDocs.some((d) => d.slug === slug)) notFound();
  return <DocsView slug={slug} />;
}

// params는 Suspense 안에서 읽는다 (Cache Components 규칙)
export default function Page({ params }: PageProps<"/docs/[slug]">) {
  return (
    <Suspense>
      <DocsBySlug params={params} />
    </Suspense>
  );
}
