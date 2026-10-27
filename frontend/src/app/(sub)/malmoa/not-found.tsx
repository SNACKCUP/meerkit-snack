import type { Metadata } from "next";
import Link from "next/link";

import { PxCard, pxButtonClass } from "./_components/px";

export const metadata: Metadata = { title: "페이지를 찾을 수 없어요", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <section className="mx-auto grid max-w-md px-5 py-16">
      <PxCard title="오류">
        <div className="grid gap-4">
          <h1 className="font-pixel text-xl">페이지를 찾을 수 없습니다 (404)</h1>
          <p className="text-sm">주소가 바뀌었거나 없어진 페이지일 수 있어요. 처음 화면에서 다시 시작해 보세요.</p>
          <div className="flex justify-end">
            <Link href="/malmoa" className={pxButtonClass("mint", "md")}>확인</Link>
          </div>
        </div>
      </PxCard>
    </section>
  );
}
