"use client";

import { RecentMeetings } from "../_components/RecentMeetings";
import { RecorderPanel } from "../_components/RecorderPanel";
import { UploadPanel } from "../_components/UploadPanel";
import { useMalmoa } from "../_lib/store";

export default function HomePage() {
  const hydrated = useMalmoa((s) => s.hydrated);
  if (!hydrated) return <div className="h-[60vh]" aria-busy />;
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8">
      <div data-rise>
        <h1 className="mp-title font-pixel text-3xl">녹음</h1>
        <p className="mp-title mt-1 text-sm">회의를 녹음하거나 파일을 올려 텍스트와 회의록으로 만듭니다.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2" data-rise>
        <RecorderPanel />
        <UploadPanel />
      </div>
      <div data-rise><RecentMeetings /></div>
    </div>
  );
}
