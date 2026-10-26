import type { Metadata } from "next";
import Link from "next/link";

import { PixelMeerkat, pxButtonClass } from "./_components/px";

export const metadata: Metadata = { title: "페이지를 찾을 수 없어요", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <section className="mx-auto grid max-w-xl justify-items-center gap-5 px-5 py-16 text-center">
      <p className="font-pixel text-[96px] leading-none text-(--mk-pink) sm:text-[140px]">4<span className="mp-blink text-(--mk-gold)">0</span>4</p>
      <PixelMeerkat level={1} size={96} label="길을 잃은 미어캣" />
      <h1 className="font-pixel text-3xl">GAME OVER? 아니요, 길을 잃었어요</h1>
      <p className="text-muted-foreground">주소가 바뀌었거나 없어진 페이지일 수 있어요.<br />처음 화면에서 다시 시작해 보세요.</p>
      <Link href="/malmoa" className={pxButtonClass("mint", "lg")}>처음으로</Link>
    </section>
  );
}
