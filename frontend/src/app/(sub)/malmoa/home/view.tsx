"use client";

import { CharacterCard } from "../_components/CharacterCard";
import { Quests } from "../_components/Quests";
import { RecentMeetings } from "../_components/RecentMeetings";
import { RecorderPanel } from "../_components/RecorderPanel";
import { UploadPanel } from "../_components/UploadPanel";
import { useMalmoa } from "../_lib/store";

export default function HomePage() {
  const hydrated = useMalmoa((s) => s.hydrated);
  if (!hydrated) return <div className="h-[60vh]" aria-busy />;
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10">
      <div data-rise>
        <h1 className="font-pixel text-4xl text-(--mk-gold)">퀘스트 보드</h1>
        <p className="mt-1 text-muted-foreground">회의를 녹음하거나 파일을 올려 경험치를 모아 보세요.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="grid content-start gap-6" data-rise>
          <CharacterCard />
          <Quests />
        </div>
        <div className="grid content-start gap-6">
          <div className="grid gap-6 xl:grid-cols-2" data-rise>
            <RecorderPanel />
            <UploadPanel />
          </div>
          <div data-rise><RecentMeetings /></div>
        </div>
      </div>
    </div>
  );
}
