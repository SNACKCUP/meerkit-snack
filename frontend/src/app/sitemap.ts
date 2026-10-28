import type { MetadataRoute } from "next";

import { meerkitConfig } from "@/meerkit";
import { allDocs, docHref } from "@/meerkit/docs/nav";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = meerkitConfig.docsOnly ? [] : ["/", "/terms", "/privacy"];
  const docs = meerkitConfig.showDocsPage ? allDocs.map((d) => docHref(d.slug)) : [];
  return [...pages, ...docs].map((path) => ({ url: `${SITE_URL}${path === "/" ? "" : path}` }));
}
