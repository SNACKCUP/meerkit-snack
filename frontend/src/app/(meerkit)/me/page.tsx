import { MyInfo, RequireAuth } from "@/meerkit";

export default function MePage() {
  return (
    <RequireAuth>
      <h1 className="mb-6 text-2xl font-bold">내 정보</h1>
      <MyInfo />
    </RequireAuth>
  );
}
