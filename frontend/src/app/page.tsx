import { redirect } from "next/navigation";

import { WelcomePage, meerkitConfig } from "@/meerkit";

export default function HomePage() {
  if (meerkitConfig.docsOnly) redirect(meerkitConfig.routes.docs);
  return <WelcomePage />;
}
