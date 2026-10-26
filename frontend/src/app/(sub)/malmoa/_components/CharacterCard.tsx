"use client";

import { useAuth } from "@/meerkit";

import { levelProgress, titleOf } from "../_lib/levels";
import { useMalmoa } from "../_lib/store";
import { PixelIcon, PixelMeerkat, PxBadge, PxBar, PxCard } from "./px";

export function CharacterCard() {
  const xp = useMalmoa((s) => s.xp);
  const streak = useMalmoa((s) => s.streak);
  const { user } = useAuth();
  const p = levelProgress(xp);
  const name = user ? (user.nickname || user.name) : "게스트";
  return (
    <PxCard title={`${name}의 캐릭터`} action={<PxBadge tone="gold">Lv.{p.level}</PxBadge>}>
      <div className="grid justify-items-center gap-3">
        <PixelMeerkat level={p.level} size={128} bob label={`레벨 ${p.level} 미어캣`} />
        <p className="font-pixel text-xl">{titleOf(p.level)}</p>
        <div className="grid w-full gap-1">
          <PxBar value={p.into} max={p.need} label="경험치" />
          <p className="font-pixel text-right text-sm text-muted-foreground">{p.maxed ? "MAX LEVEL" : `EXP ${p.into} / ${p.need}`}</p>
        </div>
        <p className="font-pixel flex items-center gap-2 text-base text-(--mk-gold)">
          <PixelIcon name="bolt" size={16} />연속 {streak}일째
        </p>
      </div>
    </PxCard>
  );
}
