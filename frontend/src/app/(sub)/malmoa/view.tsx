"use client";

import { useState } from "react";

import { PIXEL_ICON_NAMES, PixelIcon, PixelMeerkat, PxBadge, PxBar, PxButton, PxCard, PxDialog } from "./_components/px";

// M1 확인용 임시 화면(부품 모음). M2에서 랜딩으로 교체한다.
export default function MalmoaHome() {
  const [open, setOpen] = useState(false);
  const [xp, setXp] = useState(35);
  return (
    <main className="mx-auto grid max-w-4xl gap-6 px-5 py-12">
      <h1 className="font-pixel text-4xl text-(--mk-gold)">말모아 <span className="mp-blink">_</span></h1>

      <PxCard title="미어캣 진화">
        <div className="flex flex-wrap items-end gap-4">
          {[1, 3, 5, 7, 9].map((lv) => (
            <figure key={lv} className="grid justify-items-center gap-1">
              <PixelMeerkat level={lv} size={88} bob={lv === 1} label={`레벨 ${lv} 미어캣`} />
              <figcaption className="font-pixel text-sm">Lv.{lv}</figcaption>
            </figure>
          ))}
        </div>
      </PxCard>

      <PxCard title="경험치 · 게이지" action={<PxBadge tone="gold">Lv.3</PxBadge>}>
        <div className="grid gap-3">
          <PxBar value={xp} label="경험치" />
          <PxBar value={xp} tone="sky" segments={10} label="업로드 진행률" />
          <div className="flex gap-2">
            <PxButton size="sm" onClick={() => setXp((v) => Math.min(100, v + 10))}>+10 XP</PxButton>
            <PxButton size="sm" variant="ghost" onClick={() => setXp(0)}>초기화</PxButton>
          </div>
        </div>
      </PxCard>

      <PxCard title="버튼 · 배지">
        <div className="flex flex-wrap items-center gap-3">
          <PxButton><PixelIcon name="mic" />녹음 시작</PxButton>
          <PxButton variant="gold"><PixelIcon name="upload" />업로드</PxButton>
          <PxButton variant="pink"><PixelIcon name="camera" />사진</PxButton>
          <PxButton variant="sky" size="lg"><PixelIcon name="share" size={20} />공유</PxButton>
          <PxButton variant="ghost" disabled>비활성</PxButton>
          <PxButton variant="ghost" onClick={() => setOpen(true)}>대화상자 열기</PxButton>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <PxBadge tone="mint">텍스트 변환 완료</PxBadge>
          <PxBadge tone="sky">변환 중</PxBadge>
          <PxBadge tone="pink">실패</PxBadge>
          <PxBadge>대기</PxBadge>
        </div>
      </PxCard>

      <PxCard title="아이콘">
        <div className="flex flex-wrap gap-4">
          {PIXEL_ICON_NAMES.map((n) => (
            <span key={n} className="grid justify-items-center gap-1 text-sm"><PixelIcon name={n} size={32} label={n} />{n}</span>
          ))}
        </div>
      </PxCard>

      <PxCard title="회의록 (종이 패널)" tone="paper">
        <p>본문은 Pretendard로 읽기 편하게 둡니다. 담당자: <b>확인 필요</b></p>
      </PxCard>

      <PxDialog open={open} onOpenChange={setOpen} title="레벨 업!" description="Lv.3 기록가가 되었습니다.">
        <PxButton onClick={() => setOpen(false)}>확인</PxButton>
      </PxDialog>
    </main>
  );
}
