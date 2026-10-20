import { MemberTable, RequireRole } from "@/meerkit";

export default function AdminMembersPage() {
  return (
    <RequireRole role="ADMIN">
      <h1 className="mb-6 text-2xl font-bold">멤버 관리</h1>
      <MemberTable />
    </RequireRole>
  );
}
