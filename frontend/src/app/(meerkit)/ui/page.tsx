import { notFound } from "next/navigation";

import { meerkitConfig, UiShowcase } from "@/meerkit";

export default function UiPage() {
  if (!meerkitConfig.showUiPage) notFound();
  return <UiShowcase />;
}
