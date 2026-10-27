"use client";

import Link from "next/link";

import { PixelIcon, PxBadge, PxCard, pxButtonClass } from "./_components/px";

export default function MalmoaLanding() {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:py-12">
      <section className="grid items-start gap-6 md:grid-cols-[1.4fr_1fr]">
        <div data-rise>
          <PxCard title="말모아.exe">
            <div className="grid gap-5">
              <PxBadge tone="gold" className="w-fit">회의 기록 도우미</PxBadge>
              <h1 className="font-pixel text-4xl leading-tight sm:text-5xl">회의는 말로,<br />기록은 글로.</h1>
              <p className="max-w-xl leading-relaxed">말을 글로 모아 AI가 회의록으로 만들어 줍니다. 녹음하거나 파일을 올리면 텍스트와 회의록이 차례로 만들어져요.</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/malmoa/home" className={pxButtonClass("mint", "lg")}><PixelIcon name="mic" size={18} />녹음 시작</Link>
                <Link href="/malmoa/guide" className={pxButtonClass("ghost", "lg")}>사용 안내</Link>
              </div>
            </div>
          </PxCard>
        </div>
        <div data-rise>
          <PxCard title="시스템 정보">
            <dl className="w98-in grid gap-3 bg-white p-4 text-sm">
              {[["자동 저장", "10초마다"], ["AI 회의록", "8개 항목"], ["업로드", "최대 500MB"], ["보관", "이 브라우저 안"]].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-3 border-b border-dotted border-black pb-1.5 last:border-0 last:pb-0">
                  <dt>{k}</dt>
                  <dd className="font-pixel text-base">{v}</dd>
                </div>
              ))}
            </dl>
          </PxCard>
        </div>
      </section>

      <section data-rise>
        <PxCard title="시작하기">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-pixel text-xl">처음이라면 사용 안내부터 확인해 보세요.</p>
            <Link href="/malmoa/guide" className={pxButtonClass("mint", "lg")}>사용 안내 보기</Link>
          </div>
        </PxCard>
      </section>
    </div>
  );
}
