"use client";

import { useState } from "react";

import { NativeSelect } from "@/components/ui/native-select";

import { PxButton, PxCard, PxDialog } from "../_components/px";
import { useRecorderPrefs } from "../_lib/prefs";
import { useRecorder } from "../_lib/recorder";
import { useMalmoa } from "../_lib/store";

function Toggle({ id, label, desc, checked, onChange }: { id: string; label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 border-2 border-border p-3">
      <input id={id} type="checkbox" className="mt-1 size-5 accent-(--mk-mint)" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span><span className="font-pixel block text-lg">{label}</span><span className="text-sm text-muted-foreground">{desc}</span></span>
    </label>
  );
}

export default function SettingsPage() {
  const prefs = useRecorderPrefs();
  const rec = useRecorder();
  const reset = useMalmoa((s) => s.reset);
  const hydrated = useMalmoa((s) => s.hydrated);
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);
  if (!hydrated) return <div className="h-[60vh]" aria-busy />;
  const recording = rec.state === "recording" || rec.state === "paused";

  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-5 py-10">
      <div data-rise>
        <h1 className="font-pixel text-4xl text-(--mk-gold)">설정</h1>
        <p className="mt-1 text-muted-foreground">이 브라우저에만 저장되는 설정입니다.</p>
      </div>

      <div data-rise>
        <PxCard title="녹음">
          <div className="grid gap-4">
            <label className="grid gap-1">
              <span className="font-pixel text-lg">기본 마이크</span>
              <NativeSelect aria-label="기본 마이크" value={prefs.deviceId} onChange={(e) => prefs.setDeviceId(e.target.value)} disabled={recording} className="h-10 border-2">
                <option value="">시스템 기본 마이크</option>
                {rec.devices.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || "마이크"}</option>)}
              </NativeSelect>
              <span className="text-sm text-muted-foreground">녹음을 한 번 시작하면 사용할 수 있는 마이크 목록이 채워집니다.</span>
            </label>
            <Toggle id="meeting-room" label="회의실 모드" desc="멀리 있는 화자의 목소리를 깎지 않도록 통화용 에코 제거·잡음 억제를 끕니다." checked={prefs.meetingRoom} onChange={prefs.setMeetingRoom} />
          </div>
        </PxCard>
      </div>

      <div data-rise>
        <PxCard title="화면">
          <Toggle id="reduce-motion" label="움직임 끄기" desc="깜빡임, 둥실거림, 나타나는 효과를 모두 멈춥니다." checked={prefs.reduceMotion} onChange={prefs.setReduceMotion} />
        </PxCard>
      </div>

      <div data-rise>
        <PxCard title="저장된 데이터">
          <div className="grid justify-items-start gap-3">
            <p>회의 목록, 회의록, 경험치, 공유 링크를 처음 상태(예시 데이터)로 되돌립니다. 되돌린 뒤에는 복구할 수 없습니다.</p>
            <PxButton variant="pink" disabled={recording} onClick={() => { setDone(false); setConfirm(true); }}>데이터 초기화</PxButton>
            {recording ? <p className="text-sm text-muted-foreground">녹음 중에는 초기화할 수 없습니다.</p> : null}
            {done ? <p role="status" className="text-(--mk-mint)">처음 상태로 되돌렸어요.</p> : null}
          </div>
        </PxCard>
      </div>

      <PxDialog open={confirm} onOpenChange={setConfirm} title="정말 초기화할까요?" description="기록한 회의와 경험치가 모두 사라지고 예시 데이터로 바뀝니다.">
        <div className="flex gap-3">
          <PxButton variant="pink" onClick={() => { reset(); setConfirm(false); setDone(true); }}>초기화</PxButton>
          <PxButton variant="ghost" onClick={() => setConfirm(false)}>취소</PxButton>
        </div>
      </PxDialog>
    </div>
  );
}
