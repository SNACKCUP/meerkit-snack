"use client";

import Link from "next/link";

import { useMalmoa } from "../_lib/store";
import { MeetingRow } from "./MeetingRow";
import { PxCard } from "./px";

// 최근 회의 5개
export function RecentMeetings() {
  const meetings = useMalmoa((s) => s.meetings).slice(0, 5);
  return (
    <PxCard title="최근 회의" action={<Link href="/malmoa/meetings" className="font-pixel text-(--mk-gold) underline underline-offset-4">전체 보기</Link>}>
      {meetings.length === 0 ? (
        <p className="text-muted-foreground">아직 기록한 회의가 없어요. 첫 녹음으로 경험치를 모아 보세요!</p>
      ) : (
        <ul className="divide-y-2 divide-border">
          {meetings.map((m) => <MeetingRow key={m.id} meeting={m} />)}
        </ul>
      )}
    </PxCard>
  );
}
