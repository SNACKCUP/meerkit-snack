"use client";

import { ThinkingOrb } from "@/meerkit";

import { Btn } from "./_components/ui";

// 시작하기: 로그인한 뒤 처음 만나는 짧은 소개. 누르면 프로젝트 리스트로 간다.
export default function MaemusaeHome() {
  return (
    <section className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr]">
      <div data-rise>
        <h1 className="text-[44px] leading-[1.08] tracking-[-0.04em] sm:text-[60px]">
          <span className="block font-light">모호한 요청을</span>
          <span className="block font-extrabold">명확한 정의서로</span>
        </h1>
        <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-[#55534c]">고객이 보낸 문서를 올리면 AI가 요구사항을 가려내고, 확정은 프로젝트 관리자가 하고, 기능정의서는 이어서 만들어져요.</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Btn href="/maemusae/projects" variant="primary" size="lg">시작하기 →</Btn>
          <span className="text-xs text-[#6c6a62]">프로젝트를 만들고 팀과 함께 정리해 보세요</span>
        </div>
      </div>
      <div className="relative mx-auto hidden h-[360px] w-full max-w-[520px] md:block" data-rise aria-hidden>
        <div className="absolute inset-x-8 top-4 h-[290px] overflow-hidden rounded-[36px] bg-[#e3dfd1]">
          <div className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 text-[#111]"><ThinkingOrb state="composing" size={210} /></div>
        </div>
        <div className="absolute bottom-6 left-10 h-[70px] w-[320px] rounded-[26px] bg-[#111]" />
        <div className="absolute bottom-[34px] left-[50px] w-[310px] -rotate-[5deg] rounded-[24px] bg-[#f2f69a] px-6 py-3.5 text-center text-[15px] font-extrabold">확인해 보셨나요?</div>
        <div className="absolute right-2 top-0 grid h-[96px] w-[96px] place-items-end rounded-[26px] bg-[#111] p-4"><div className="flex h-full items-end gap-[6px]">{[40, 70, 30, 85, 50].map((h, i) => <span key={i} className={`w-[5px] rounded-full ${i === 3 ? "bg-[#f2f69a]" : "bg-white/30"}`} style={{ height: `${h}%` }} />)}</div></div>
      </div>
    </section>
  );
}
