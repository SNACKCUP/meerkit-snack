"use client";

import Link from "next/link";

import { useMalmoa } from "../_lib/store";
import { MeetingRow } from "./MeetingRow";
import { PxPanel, pxButtonClass } from "./px";

// 최근 회의 5개 (탐색기 창 모양)
export function RecentMeetings({ bare }: { bare?: boolean } = {}) {
  const meetings = useMalmoa((s) => s.meetings).slice(0, 5);
  return (
    <PxPanel title="최근 회의" bare={bare} action={<Link href="/malmoa/meetings" className={pxButtonClass("ghost", "sm", "mr-1 h-5 min-w-0 px-2 text-xs")}>전체 보기</Link>}>
      <div className="w98-in bg-white p-3">
        {meetings.length === 0 ? (
          <p>아직 기록한 회의가 없어요. 첫 녹음을 시작해 보세요.</p>
        ) : (
          <ul className="divide-y divide-[#c0c0c0]">
            {meetings.map((m) => <MeetingRow key={m.id} meeting={m} />)}
          </ul>
        )}
      </div>
    </PxPanel>
  );
}
