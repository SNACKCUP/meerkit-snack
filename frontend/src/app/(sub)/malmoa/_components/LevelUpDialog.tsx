"use client";

import { titleOf } from "../_lib/levels";
import { useMalmoa } from "../_lib/store";
import { PixelMeerkat, PxButton, PxDialog } from "./px";

export function LevelUpDialog() {
  const levelUp = useMalmoa((s) => s.levelUp);
  const dismiss = useMalmoa((s) => s.dismissLevelUp);
  return (
    <PxDialog open={!!levelUp} onOpenChange={(o) => { if (!o) dismiss(); }} title="LEVEL UP!" description={levelUp ? `Lv.${levelUp.from} → Lv.${levelUp.to} · ${titleOf(levelUp.to)}` : undefined}>
      {levelUp ? <div className="grid justify-items-center"><PixelMeerkat level={levelUp.to} size={128} bob label={`레벨 ${levelUp.to} 미어캣`} /></div> : null}
      <PxButton onClick={dismiss}>좋아요!</PxButton>
    </PxDialog>
  );
}
