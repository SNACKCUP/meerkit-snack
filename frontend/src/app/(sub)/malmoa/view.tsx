"use client";

import Link from "next/link";

import { Spotlight } from "./_components/Spotlight";
import { PixelIcon, PixelMeerkat, PxBadge, PxBar, PxCard, pxButtonClass, type PixelIconName } from "./_components/px";

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
  { icon: "share", title: "링크로 공유", body: "로그인하지 않은 동료도 회의록을 읽을 수 있습니다." },
  { icon: "star", title: "레벨업", body: "회의를 기록할수록 경험치가 쌓이고 미어캣이 진화합니다." },
];

export default function MalmoaLanding() {
  return (
    <div className="mx-auto grid max-w-6xl gap-24 px-5 py-10 sm:py-14">
      <section className="relative grid items-center gap-12 py-6 md:grid-cols-[1.25fr_1fr] md:py-14">
        <Spotlight />
        <div className="grid gap-6">
          <PxBadge tone="mint" className="w-fit" data-rise>회의를 기록할수록 자라는 서비스</PxBadge>
          <h1 className="font-pixel text-[2.6rem] leading-[1.1] sm:text-6xl" data-rise>
            회의는 <span className="text-(--mk-mint)">말로</span>,<br />기록은 <span className="text-(--mk-gold)">글로</span><span className="mp-blink text-(--mk-pink)">.</span>
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg" data-rise>
            말을 글로 모아 AI가 회의록으로 만들어 줍니다. 회의를 할수록 경험치가 쌓이고, 레벨이 오르면 미어캣이 진화해요.
          </p>
          <div className="flex flex-wrap gap-3" data-rise>
            <Link href="/malmoa/signup" className={pxButtonClass("mint", "lg")}><PixelIcon name="bolt" size={18} />시작하기</Link>
            <Link href="/malmoa/login" className={pxButtonClass("ghost", "lg")}>로그인</Link>
          </div>
          <dl className="mt-4 flex flex-wrap gap-x-10 gap-y-3 border-t-2 border-border pt-6 text-sm" data-rise>
            {[["10초", "마다 자동 저장"], ["8개 항목", "AI 회의록"], ["500MB", "까지 업로드"]].map(([k, v]) => (
              <div key={k}><dt className="font-pixel text-xl">{k}</dt><dd className="text-muted-foreground">{v}</dd></div>
            ))}
          </dl>
        </div>
        <div data-rise>
          <PxCard title="내 캐릭터" action={<PxBadge tone="gold">Lv.1</PxBadge>} className="mx-auto max-w-sm">
            <div className="grid justify-items-center gap-4">
              <PixelMeerkat level={1} size={150} bob label="새싹 서기 미어캣" />
              <p className="font-pixel text-xl">새싹 서기</p>
              <div className="grid w-full gap-2">
                <PxBar value={60} label="경험치 예시" />
                <p className="text-right text-xs text-muted-foreground">EXP 60 / 100</p>
              </div>
            </div>
          </PxCard>
        </div>
      </section>

      <section className="grid gap-5" aria-labelledby="how">
        <h2 id="how" className="font-pixel text-3xl" data-rise>이렇게 진행돼요</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.title} data-rise>
              <PxCard className="h-full">
                <PixelIcon name={s.icon} size={40} className="text-(--mk-mint)" />
                <h3 className="mt-4 font-pixel text-xl">{s.title}</h3>
                <p className="mt-1 text-muted-foreground">{s.body}</p>
              </PxCard>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-5" aria-labelledby="levels">
        <h2 id="levels" className="font-pixel text-3xl" data-rise>레벨업하면 진화해요</h2>
        <PxCard data-rise>
          <ul className="flex flex-wrap items-end justify-around gap-6">
            {[
              [1, "새싹 서기"],
              [3, "스카프 서기"],
              [5, "기록가"],
              [7, "베테랑 기록가"],
              [9, "회의의 왕"],
            ].map(([lv, name]) => (
              <li key={lv} className="grid justify-items-center gap-1">
                <PixelMeerkat level={lv as number} size={96} label={`레벨 ${lv} ${name}`} />
                <span className="font-pixel text-lg">Lv.{lv}</span>
                <span className="text-sm text-muted-foreground">{name}</span>
              </li>
            ))}
          </ul>
        </PxCard>
      </section>

      <section className="grid gap-5" aria-labelledby="features">
        <h2 id="features" className="font-pixel text-3xl" data-rise>가진 기능</h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title} data-rise>
              <PxCard className="h-full">
                <div className="flex items-center gap-2">
                  <PixelIcon name={f.icon} size={24} className="text-(--mk-gold)" />
                  <h3 className="font-pixel text-xl">{f.title}</h3>
                </div>
                <p className="mt-2 text-muted-foreground">{f.body}</p>
              </PxCard>
            </li>
          ))}
        </ul>
      </section>

      <section data-rise>
        <PxCard tone="paper">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-pixel text-2xl">오늘 회의부터 첫 경험치를 모아 보세요!</p>
            <Link href="/malmoa/signup" className={pxButtonClass("pink", "lg")}>무료로 시작</Link>
          </div>
        </PxCard>
      </section>
    </div>
  );
}
