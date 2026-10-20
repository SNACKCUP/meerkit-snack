import { KitHeader } from "@/meerkit";

// (meerkit) 폴더는 URL에 나타나지 않습니다. /me, /admin/members 같은 킷 화면의 공통 레이아웃입니다.
export default function KitLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <KitHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </>
  );
}
