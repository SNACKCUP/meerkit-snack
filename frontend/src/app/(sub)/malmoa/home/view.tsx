"use client";

import { Desk, type DeskItem } from "../_components/Desk";
import { MemoPanel } from "../_components/MemoPanel";
import { RecentMeetings } from "../_components/RecentMeetings";
import { RecorderPanel } from "../_components/RecorderPanel";
import { UploadPanel } from "../_components/UploadPanel";
import { useMalmoa } from "../_lib/store";

// 창 처음 위치: 왼쪽 아이콘 줄(약 104px)을 비우고 놓는다
const ITEMS: DeskItem[] = [
  { id: "rec", title: "녹음기", icon: "mic", x: 112, y: 12, w: 460, node: <RecorderPanel bare /> },
  { id: "upload", title: "파일 업로드", icon: "upload", x: 588, y: 12, w: 440, node: <UploadPanel bare /> },
  { id: "memo", title: "메모장", icon: "doc", x: 588, y: 452, w: 440, h: 320, minW: 280, minH: 200, node: <MemoPanel /> },
  { id: "recent", title: "최근 회의", icon: "star", x: 112, y: 470, w: 460, node: <RecentMeetings bare /> },
];

export default function HomePage() {
  const hydrated = useMalmoa((s) => s.hydrated);
  if (!hydrated) return <div className="h-[60vh]" aria-busy />;
  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8">
      <div data-rise>
        <h1 className="mp-title font-pixel text-3xl">녹음</h1>
        <p className="mp-title mt-1 text-sm">창을 끌어 옮기고, 크기를 바꾸고, 닫았다가 왼쪽 아이콘으로 다시 열 수 있습니다.</p>
      </div>
      <Desk items={ITEMS} areaClassName="md:h-[790px]" />
    </div>
  );
}
