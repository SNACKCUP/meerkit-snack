import { notFound } from "next/navigation";

import { meerkitConfig } from "@/meerkit";
import { AdminMembersPage } from "@/meerkit/admin/AdminMembersPage";

export default function Page() {
  if (meerkitConfig.docsOnly) notFound();
  return <AdminMembersPage />;
}
