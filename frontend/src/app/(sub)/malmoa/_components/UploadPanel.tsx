"use client";

import { useRef, useState, type DragEvent } from "react";

import { cn } from "@/lib/utils";

import { formatBytes } from "../_lib/format";
import { useMalmoa } from "../_lib/store";
import type { MeetingSource } from "../_lib/types";
import { PixelIcon, PxButton, PxCard } from "./px";

const AUDIO_EXT = [".mp3", ".wav", ".m4a", ".webm", ".mp4", ".ogg"];
const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp"];
const MAX_MB = 500;

const extOf = (name: string) => name.slice(name.lastIndexOf(".")).toLowerCase();

// 파일 길이를 브라우저가 읽을 수 있으면 읽는다 (못 읽으면 null)
function readDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const a = new Audio();
    const url = URL.createObjectURL(file);
    const done = (v: number | null) => {
      URL.revokeObjectURL(url);
      resolve(v);
    };
    a.preload = "metadata";
    a.onloadedmetadata = () => done(Number.isFinite(a.duration) ? Math.round(a.duration) : null);
    a.onerror = () => done(null);
    a.src = url;
  });
}

export function UploadPanel() {
  const addMeeting = useMalmoa((s) => s.addMeeting);
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [sending, setSending] = useState(false);

  const isImage = file ? IMAGE_EXT.includes(extOf(file.name)) : false;

  function pick(f: File | undefined) {
    if (!f) return;
    setError(null);
    const ext = extOf(f.name);
    if (![...AUDIO_EXT, ...IMAGE_EXT].includes(ext)) return setError("지원하지 않는 형식입니다. 음성은 MP3·WAV·M4A·WEBM, 사진은 JPG·PNG·HEIC로 올려 주세요.");
    if (f.size === 0) return setError("빈 파일입니다. 다른 파일을 선택해 주세요.");
    if (f.size > MAX_MB * 1024 * 1024) return setError(`파일이 ${MAX_MB}MB를 넘습니다. 더 작은 파일로 나누어 올려 주세요.`);
    setFile(f);
  }

  async function submit() {
    if (!file) return;
    setSending(true);
    const source: MeetingSource = isImage ? "image" : "upload";
    const durationSec = source === "upload" ? await readDuration(file) : null;
    addMeeting({ fileName: file.name, source, sizeBytes: file.size, durationSec });
    setFile(null);
    setSending(false);
    if (fileRef.current) fileRef.current.value = "";
    if (photoRef.current) photoRef.current.value = "";
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDrag(false);
    pick(e.dataTransfer.files[0]);
  }

  return (
    <PxCard title="파일 업로드">
      <div className="grid gap-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={cn("w98-in grid justify-items-center gap-3 border-2 border-dashed px-4 py-8 text-center", drag ? "border-[#000080] bg-[#e0e0ff]" : "border-transparent bg-white")}
        >
          <PixelIcon name="upload" size={40} className="text-[#000080]" />
          {file ? (
            <p className="font-pixel text-lg break-all">{file.name} <span className="text-[#404040]">· {formatBytes(file.size)}</span></p>
          ) : (
            <>
              <p className="font-pixel text-lg">파일을 여기로 끌어다 놓으세요</p>
              <p className="text-sm text-[#404040]">음성 MP3 · WAV · M4A · WEBM / 사진 JPG · PNG · HEIC · 최대 {MAX_MB}MB</p>
            </>
          )}
          <input ref={fileRef} type="file" className="sr-only" aria-label="파일 선택" accept={[...AUDIO_EXT, ...IMAGE_EXT].join(",")} onChange={(e) => pick(e.target.files?.[0])} />
          <PxButton size="sm" variant="ghost" onClick={() => fileRef.current?.click()}>파일 선택</PxButton>
        </div>
        {error ? <p role="alert" className="w98-flat bg-[#ffffe1] text-[#b00000] p-3 text-sm">{error}</p> : null}
        <input ref={photoRef} type="file" accept="image/*" capture="environment" className="sr-only" aria-label="화이트보드 사진 찍기" onChange={(e) => pick(e.target.files?.[0])} />
        <PxButton variant="ghost" onClick={() => photoRef.current?.click()}><PixelIcon name="camera" size={18} />화이트보드 사진 찍기 · 올리기</PxButton>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#404040]">2시간 분량의 회의 녹음도 처리할 수 있습니다.</p>
          <PxButton variant="gold" disabled={!file || sending} onClick={() => void submit()}>{isImage ? "올리고 글자 읽기" : "업로드하고 텍스트로 변환"}</PxButton>
        </div>
      </div>
    </PxCard>
  );
}
