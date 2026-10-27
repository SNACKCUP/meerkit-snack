"use client";

import Link from "next/link";

import { PixelIcon, PxBadge, PxCard, pxButtonClass, type PixelIconName } from "./_components/px";

const STEPS: { icon: PixelIconName; title: string; body: string }[] = [
  { icon: "mic", title: "1. 말하기", body: "회의를 녹음하거나 파일·화이트보드 사진을 올립니다." },
  { icon: "doc", title: "2. 글로 모으기", body: "말이 시간 표시가 붙은 텍스트로 바뀝니다." },
  { icon: "bolt", title: "3. 문서로 만들기", body: "AI가 논의·결정·할 일을 회의록으로 정리합니다." },
];

const FEATURES: { icon: PixelIconName; title: string; body: string }[] = [
  { icon: "mic", title: "직접 녹음", body: "10초마다 자동 저장되어 탭이 꺼져도 이어서 복구할 수 있습니다." },
  { icon: "upload", title: "파일 업로드", body: "MP3, WAV, M4A, WEBM 녹음 파일을 최대 500MB까지 올립니다." },
  { icon: "camera", title: "화이트보드 사진", body: "사진 속 글자를 읽어 텍스트로 바꿉니다." },
  { icon: "doc", title: "AI 회의록", body: "8개 항목으로 정리하고, 모르는 내용은 지어내지 않고 ‘확인 필요’로 남깁니다." },
  { icon: "share", title: "링크로 공유", body: "누구나 링크로 회의록을 읽을 수 있습니다. 언제든 끌 수 있어요." },
  { icon: "lock", title: "내 브라우저에 보관", body: "녹음 조각은 이 브라우저에만 저장되고, 음성은 AI로 보내지 않습니다." },
];

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

      <section className="grid gap-4" aria-labelledby="how">
        <h2 id="how" className="mp-title font-pixel text-2xl" data-rise>이렇게 진행돼요</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.title} data-rise>
              <PxCard title={s.title} className="h-full">
                <PixelIcon name={s.icon} size={32} />
                <p className="mt-3 text-sm leading-relaxed">{s.body}</p>
              </PxCard>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4" aria-labelledby="features">
        <h2 id="features" className="mp-title font-pixel text-2xl" data-rise>가진 기능</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title} data-rise>
              <PxCard title={f.title} className="h-full">
                <div className="flex gap-3">
                  <PixelIcon name={f.icon} size={24} className="mt-0.5 shrink-0" />
                  <p className="text-sm leading-relaxed">{f.body}</p>
                </div>
              </PxCard>
            </li>
          ))}
        </ul>
      </section>

      <section data-rise>
        <PxCard title="시작하기">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-pixel text-xl">오늘 회의부터 바로 기록해 보세요.</p>
            <Link href="/malmoa/home" className={pxButtonClass("mint", "lg")}>녹음 화면으로</Link>
          </div>
        </PxCard>
      </section>
    </div>
  );
}
