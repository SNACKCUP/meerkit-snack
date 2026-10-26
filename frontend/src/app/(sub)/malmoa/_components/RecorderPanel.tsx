"use client";

import { useEffect, useState } from "react";

import { NativeSelect } from "@/components/ui/native-select";

import { formatClock, recordingFileName } from "../_lib/format";
import { useRecorderPrefs } from "../_lib/prefs";
import { REC_ERROR_TEXT, useRecorder } from "../_lib/recorder";
import { useMalmoa } from "../_lib/store";
import { PixelIcon, PxBar, PxButton, PxCard } from "./px";

export function RecorderPanel() {
  const r = useRecorder();
  const addMeeting = useMalmoa((s) => s.addMeeting);
  const deviceId = useRecorderPrefs((s) => s.deviceId);
  const meetingRoom = useRecorderPrefs((s) => s.meetingRoom);
  const busy = r.state === "recording" || r.state === "paused" || r.state === "requesting";

  // 다시 들어볼 수 있게 녹음 결과의 미리듣기 주소를 만든다
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!r.recording) return;
    const u = URL.createObjectURL(r.recording.blob);
    const frame = requestAnimationFrame(() => setUrl(u));
    return () => {
      cancelAnimationFrame(frame);
      URL.revokeObjectURL(u);
      setUrl(null);
    };
  }, [r.recording]);

  function fileOf(rec: NonNullable<typeof r.recording>) {
    return new File([rec.blob], recordingFileName(rec.ext), { type: rec.mime });
  }
  function convert() {
    if (!r.recording) return;
    const f = fileOf(r.recording);
    addMeeting({ fileName: f.name, source: "recording", sizeBytes: f.size, durationSec: Math.round(r.recording.durationSec) });
    r.discard();
  }
  function download() {
    if (!r.recording) return;
    const f = fileOf(r.recording);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(f);
    a.download = f.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  return (
    <PxCard title="직접 녹음">
      <div className="grid gap-4">
        <div className="grid justify-items-center gap-3 border-2 border-(--mk-px-edge) bg-(--mk-px-edge) px-4 py-6">
          <p className="font-pixel text-5xl tabular-nums" aria-live="off" aria-label={`녹음 시간 ${formatClock(r.elapsed)}`}>
            {r.state === "recording" ? <span className="mp-blink mr-2 text-(--mk-pink)">●</span> : null}
            {formatClock(r.elapsed)}
          </p>
          <PxBar value={Math.round(r.level * 100)} tone={r.state === "recording" ? "pink" : "sky"} segments={24} label="입력 레벨" className="w-full max-w-sm" />
          <p className="text-sm text-muted-foreground">
            {r.state === "recording" ? "10초마다 이 브라우저에 자동 저장됩니다" : r.state === "paused" ? "일시정지 중입니다" : r.state === "stopped" ? "녹음이 끝났습니다. 들어 보고 보관하세요" : "Mac 마이크로 지금 회의를 녹음합니다"}
          </p>
        </div>

        {r.quiet ? <p role="alert" className="border-2 border-(--mk-gold) bg-muted p-3 text-sm">소리가 거의 들어오지 않습니다. 마이크가 가까이 있는지, 음소거가 아닌지 확인해 주세요.</p> : null}
        {r.error ? <p role="alert" className="border-2 border-(--mk-pink) bg-muted p-3 text-sm">{REC_ERROR_TEXT[r.error]}</p> : null}

        {r.recoverable && r.state === "idle" ? (
          <div className="grid gap-2 border-2 border-(--mk-sky) bg-muted p-3">
            <p className="text-sm">이전 녹음이 중간에 종료되었습니다. 저장된 부분을 불러올 수 있어요.</p>
            <div className="flex gap-2">
              <PxButton size="sm" variant="sky" onClick={() => void r.recover()}>이전 녹음 불러오기</PxButton>
              <PxButton size="sm" variant="ghost" onClick={r.dropRecoverable}>버리기</PxButton>
            </div>
          </div>
        ) : null}

        {r.state === "idle" || r.state === "requesting" ? (
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="font-pixel">마이크</span>
                <NativeSelect aria-label="마이크 선택" value={deviceId} onChange={(e) => useRecorderPrefs.getState().setDeviceId(e.target.value)} disabled={busy} className="h-10 border-2">
                  <option value="">시스템 기본 마이크</option>
                  {r.devices.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || "마이크"}</option>)}
                </NativeSelect>
              </label>
              <label className="flex items-start gap-2 border-2 border-border p-2 text-sm">
                <input type="checkbox" className="mt-1 size-4 accent-(--mk-mint)" checked={meetingRoom} disabled={busy} onChange={(e) => useRecorderPrefs.getState().setMeetingRoom(e.target.checked)} />
                <span><span className="font-pixel block">회의실 모드</span><span className="text-muted-foreground">멀리 있는 화자의 목소리를 깎지 않도록 통화용 잡음 억제를 끕니다</span></span>
              </label>
            </div>
            <PxButton size="lg" disabled={r.state === "requesting"} onClick={() => void r.start()}><PixelIcon name="mic" size={20} />{r.state === "requesting" ? "마이크 연결 중…" : "녹음 시작"}</PxButton>
          </div>
        ) : null}

        {r.state === "recording" || r.state === "paused" ? (
          <div className="flex flex-wrap gap-3">
            {r.state === "recording" ? <PxButton variant="gold" onClick={r.pause}>일시정지</PxButton> : <PxButton variant="sky" onClick={r.resume}>재개</PxButton>}
            <PxButton variant="pink" onClick={r.stop}>녹음 종료</PxButton>
          </div>
        ) : null}

        {r.state === "stopped" && r.recording ? (
          <div className="grid gap-3">
            {url ? <audio controls src={url} className="w-full" aria-label="녹음 미리듣기" /> : null}
            <div className="flex flex-wrap gap-3">
              <PxButton onClick={convert}><PixelIcon name="doc" size={18} />텍스트로 변환</PxButton>
              <PxButton variant="ghost" onClick={download}>파일 저장</PxButton>
              <PxButton variant="ghost" onClick={r.discard}>다시 녹음</PxButton>
            </div>
          </div>
        ) : null}
      </div>
    </PxCard>
  );
}
