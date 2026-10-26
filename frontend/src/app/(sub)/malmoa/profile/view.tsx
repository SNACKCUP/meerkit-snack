"use client";

import { useAuth } from "@/meerkit";
import { cn } from "@/lib/utils";

import { PixelIcon, PixelMeerkat, PxBadge, PxBar, PxCard } from "../_components/px";
import { ACHIEVEMENTS } from "../_lib/achievements";
import { formatDuration, formatWhen } from "../_lib/format";
import { LEVEL_TITLES, levelProgress, titleOf } from "../_lib/levels";
import { useMalmoa } from "../_lib/store";

export default function ProfilePage() {
  const s = useMalmoa();
  const { user } = useAuth();
  if (!s.hydrated) return <div className="h-[60vh]" aria-busy />;

  const p = levelProgress(s.xp);
  const done = s.meetings.filter((m) => m.status === "COMPLETED");
  const stats: [string, string][] = [
    ["기록한 회의", `${done.length}건`],
    ["녹음 시간", formatDuration(done.reduce((a, m) => a + (m.durationSec ?? 0), 0)) || "0분"],
    ["AI 회의록", `${s.meetings.filter((m) => m.minutesReady).length}건`],
    ["공유한 회의록", `${Object.keys(s.shares).length}건`],
  ];
  const earned = ACHIEVEMENTS.filter((a) => a.done(s)).length;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10">
      <div data-rise>
        <h1 className="font-pixel text-4xl text-(--mk-gold)">내 캐릭터</h1>
        <p className="mt-1 text-muted-foreground">{user ? `${user.nickname || user.name}님의` : "게스트의"} 기록과 업적이에요.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="grid content-start gap-6" data-rise>
          <PxCard title={titleOf(p.level)} action={<PxBadge tone="gold">Lv.{p.level}</PxBadge>}>
            <div className="grid justify-items-center gap-3">
              <PixelMeerkat level={p.level} size={160} bob label={`레벨 ${p.level} 미어캣`} />
              <div className="grid w-full gap-1">
                <PxBar value={p.into} max={p.need} label="경험치" />
                <p className="font-pixel text-right text-sm text-muted-foreground">{p.maxed ? "MAX LEVEL" : `EXP ${p.into} / ${p.need}`}</p>
              </div>
              <p className="font-pixel text-(--mk-gold)">연속 {s.streak}일째 · 총 {s.xp} EXP</p>
            </div>
          </PxCard>
          <PxCard title="칭호 목록">
            <ol className="grid gap-1 text-sm">
              {LEVEL_TITLES.map((t, i) => (
                <li key={t} className={cn("flex justify-between", i + 1 > p.level ? "text-muted-foreground" : i + 1 === p.level ? "font-bold text-(--mk-gold)" : "")}>
                  <span className="font-pixel">Lv.{i + 1}</span><span>{t}</span>
                </li>
              ))}
            </ol>
          </PxCard>
        </div>

        <div className="grid content-start gap-6">
          <div data-rise>
            <PxCard title="기록 통계">
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {stats.map(([k, v]) => (
                  <div key={k}><dt className="text-sm text-muted-foreground">{k}</dt><dd className="font-pixel text-2xl">{v}</dd></div>
                ))}
              </dl>
            </PxCard>
          </div>
          <div data-rise>
            <PxCard title="업적" action={<PxBadge tone="mint">{earned} / {ACHIEVEMENTS.length}</PxBadge>}>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ACHIEVEMENTS.map((a) => {
                  const ok = a.done(s);
                  return (
                    <li key={a.id} className={cn("flex items-start gap-3 border-2 p-3", ok ? "border-(--mk-gold) bg-muted" : "border-border opacity-60")}>
                      <span className={ok ? "text-(--mk-gold)" : "text-muted-foreground"}><PixelIcon name={ok ? a.icon : "lock"} size={28} label={ok ? "달성" : "잠김"} /></span>
                      <div><p className="font-pixel text-lg">{a.title}</p><p className="text-sm text-muted-foreground">{a.desc}</p></div>
                    </li>
                  );
                })}
              </ul>
            </PxCard>
          </div>
          <div data-rise>
            <PxCard title="경험치 기록">
              {s.xpLog.length === 0 ? <p className="text-muted-foreground">아직 얻은 경험치가 없어요.</p> : (
                <ul className="divide-y-2 divide-border">
                  {s.xpLog.slice(0, 10).map((x) => (
                    <li key={x.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                      <span>{x.reason}</span><span className="text-sm text-muted-foreground">{formatWhen(x.at)}</span>
                      <PxBadge tone="mint" className="ml-auto">+{x.amount}</PxBadge>
                    </li>
                  ))}
                </ul>
              )}
            </PxCard>
          </div>
        </div>
      </div>
    </div>
  );
}
