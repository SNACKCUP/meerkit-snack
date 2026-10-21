import { notFound } from "next/navigation";

import { meerkitConfig } from "@/meerkit";
import { MePage } from "@/meerkit/auth/MePage";

export default function Page() {
  if (meerkitConfig.docsOnly) notFound();
  return <MePage />;
}
