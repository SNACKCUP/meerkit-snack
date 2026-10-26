"use client";

import { localDay } from "../_lib/format";
import { useMalmoa } from "../_lib/store";
import { PixelIcon, PxBadge, PxCard } from "./px";

// 오늘의 퀘스트: 오늘 만든 회의에서 계산한다.
export function Quests() {
  const meetings = useMalmoa((s) => s.meetings);
  const today = localDay(new Date());
  const todays = meetings.filter((m) => localDay(new Date(m.createdAt)) === today && m.status === "COMPLETED");
  const quests = [
    { label: "오늘 회의 1건 기록하기", reward: 50, done: todays.length >= 1 },
    { label: "10분 넘는 회의 기록하기", reward: 10, done: todays.some((m) => (m.durationSec ?? 0) >= 600) },
    { label: "화이트보드 사진 읽기", reward: 20, done: todays.some((m) => m.source === "image") },
  ];
  return (
    <PxCard title="오늘의 퀘스트">
      <ul className="grid gap-2">
        {quests.map((q) => (
          <li key={q.label} className="flex items-center gap-2">
            <span className={q.done ? "text-(--mk-mint)" : "text-muted-foreground"}>
              <PixelIcon name={q.done ? "check" : "star"} size={18} label={q.done ? "완료" : "미완료"} />
            </span>
            <span className={q.done ? "text-muted-foreground line-through" : ""}>{q.label}</span>
            <PxBadge tone={q.done ? "mint" : "gold"} className="ml-auto">+{q.reward}</PxBadge>
          </li>
        ))}
      </ul>
    </PxCard>
  );
}
