"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { clearChunks, loadChunks, saveChunk } from "./recordingStore";
import { useRecorderPrefs } from "./prefs";

export type RecState = "idle" | "requesting" | "recording" | "paused" | "stopped";
export type RecError = "unsupported" | "insecure" | "denied" | "notfound" | "busy" | "storage" | "unknown";

export const REC_ERROR_TEXT: Record<RecError, string> = {
  unsupported: "이 브라우저는 녹음을 지원하지 않습니다. 최신 Chrome이나 Safari를 사용해 주세요.",
  insecure: "마이크는 보안 연결(https 또는 localhost)에서만 사용할 수 있습니다.",
  denied: "마이크 사용이 거부되었습니다. 주소창의 자물쇠 아이콘에서 마이크를 허용한 뒤 다시 시도해 주세요.",
  notfound: "사용할 수 있는 마이크를 찾지 못했습니다. 마이크가 연결되어 있는지 확인해 주세요.",
  busy: "다른 앱이 마이크를 사용 중입니다. Zoom, FaceTime 등을 종료하고 다시 시도해 주세요.",
  storage: "녹음 조각을 브라우저에 저장하지 못했습니다. 저장 공간이 부족하거나 시크릿 모드일 수 있습니다. 녹음은 계속되지만 중간에 끊기면 복구되지 않습니다.",
  unknown: "녹음을 시작하지 못했습니다. 잠시 뒤 다시 시도해 주세요.",
};

const CHUNK_MS = 10_000;
const QUIET_LEVEL = 0.02;
const QUIET_SECONDS = 8;

export interface Recording {
  blob: Blob;
  mime: string;
  ext: string;
  durationSec: number;
}

interface RecorderApi {
  state: RecState;
  elapsed: number;
  level: number;
  quiet: boolean;
  error: RecError | null;
  devices: MediaDeviceInfo[];
  recording: Recording | null;
  recoverable: boolean;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  discard: () => void;
  recover: () => Promise<void>;
  dropRecoverable: () => void;
}

const Ctx = createContext<RecorderApi | null>(null);

export function useRecorder(): RecorderApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("RecorderProvider 안에서만 쓸 수 있습니다.");
  return v;
}

const pickMime = () => ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) ?? "";
const extOf = (mime: string) => (mime.includes("mp4") ? "m4a" : "webm");

function classify(e: unknown): RecError {
  const name = (e as { name?: string })?.name;
  if (name === "NotAllowedError" || name === "SecurityError") return "denied";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "notfound";
  if (name === "NotReadableError" || name === "AbortError") return "busy";
  return "unknown";
}

// 녹음기는 말모아 전체의 틀(Shell)에 있다. 다른 화면으로 이동해도 녹음이 이어지게 하기 위해서다.
export function RecorderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RecState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [level, setLevel] = useState(0);
  const [quiet, setQuiet] = useState(false);
  const [error, setError] = useState<RecError | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [recoverable, setRecoverable] = useState(false);

  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeRef = useRef("");
  const seqRef = useRef(0);
  const doneRef = useRef(0); // 일시정지 전까지 쌓인 초
  const segStartRef = useRef(0);
  const quietRef = useRef(0);
  const wakeRef = useRef<{ release: () => Promise<void> } | null>(null);
  const stateRef = useRef<RecState>("idle");
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const refreshDevices = useCallback(async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      setDevices(all.filter((d) => d.kind === "audioinput" && d.deviceId));
    } catch {
      /* 목록을 못 읽어도 녹음은 된다 */
    }
  }, []);

  const release = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    analyserRef.current = null;
    void wakeRef.current?.release().catch(() => {});
    wakeRef.current = null;
    setLevel(0);
  }, []);

  // 이전 녹음 조각이 남아 있으면 복구할 수 있다고 알린다
  useEffect(() => {
    let cancelled = false;
    loadChunks()
      .then((c) => {
        if (!cancelled && c) setRecoverable(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // 시간과 입력 레벨(0.25초마다)
  useEffect(() => {
    if (state !== "recording" && state !== "paused") return;
    const id = setInterval(() => {
      const live = stateRef.current === "recording";
      setElapsed(doneRef.current + (live ? (Date.now() - segStartRef.current) / 1000 : 0));
      const an = analyserRef.current;
      if (an && live) {
        const buf = new Uint8Array(an.fftSize);
        an.getByteTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += ((v - 128) / 128) ** 2;
        const lv = Math.min(1, Math.sqrt(sum / buf.length) * 4);
        setLevel(lv);
        quietRef.current = lv < QUIET_LEVEL ? quietRef.current + 0.25 : 0;
        setQuiet(quietRef.current >= QUIET_SECONDS);
      } else if (!live) {
        setLevel(0);
      }
    }, 250);
    return () => clearInterval(id);
  }, [state]);

  // 녹음 중 탭을 닫거나 새로고침하려 하면 경고한다
  useEffect(() => {
    if (state !== "recording" && state !== "paused") return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [state]);

  // 틀이 사라지면 마이크를 놓는다
  useEffect(() => () => {
    if (recRef.current && recRef.current.state !== "inactive") recRef.current.onstop = null;
    release();
  }, [release]);

  const start = useCallback(async () => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") return setError("unsupported");
    if (!window.isSecureContext) return setError("insecure");
    setState("requesting");
    try {
      const { deviceId, meetingRoom } = useRecorderPrefs.getState();
      // 회의실 모드: 멀리 있는 화자 소리를 깎지 않도록 에코 제거·잡음 억제를 끄고 자동 음량만 켠다
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: deviceId ? { exact: deviceId } : undefined, channelCount: 1, echoCancellation: !meetingRoom, noiseSuppression: !meetingRoom, autoGainControl: true },
      });
      streamRef.current = stream;
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ac = new AC();
      const an = ac.createAnalyser();
      an.fftSize = 1024;
      ac.createMediaStreamSource(stream).connect(an);
      audioCtxRef.current = ac;
      analyserRef.current = an;

      const mime = pickMime();
      mimeRef.current = mime || "audio/webm";
      const rec = new MediaRecorder(stream, { ...(mime ? { mimeType: mime } : {}), audioBitsPerSecond: 64_000 });
      chunksRef.current = [];
      seqRef.current = 0;
      await clearChunks().catch(() => {});
      rec.ondataavailable = (e) => {
        if (!e.data.size) return;
        chunksRef.current.push(e.data);
        saveChunk(seqRef.current++, e.data, mimeRef.current).catch(() => setError("storage"));
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeRef.current });
        const durationSec = doneRef.current + (stateRef.current === "recording" ? (Date.now() - segStartRef.current) / 1000 : 0);
        setRecording({ blob, mime: mimeRef.current, ext: extOf(mimeRef.current), durationSec });
        setElapsed(durationSec);
        setState("stopped");
        release();
      };
      rec.start(CHUNK_MS);
      recRef.current = rec;
      doneRef.current = 0;
      segStartRef.current = Date.now();
      quietRef.current = 0;
      setQuiet(false);
      setElapsed(0);
      setRecording(null);
      setRecoverable(false);
      setState("recording");
      (navigator as unknown as { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } }).wakeLock
        ?.request("screen")
        .then((l) => (wakeRef.current = l))
        .catch(() => {});
      void refreshDevices();
    } catch (e) {
      release();
      setError(classify(e));
      setState("idle");
    }
  }, [refreshDevices, release]);

  const pause = useCallback(() => {
    if (recRef.current?.state !== "recording") return;
    doneRef.current += (Date.now() - segStartRef.current) / 1000;
    recRef.current.pause();
    setState("paused");
  }, []);

  const resume = useCallback(() => {
    if (recRef.current?.state !== "paused") return;
    segStartRef.current = Date.now();
    recRef.current.resume();
    setState("recording");
  }, []);

  const stop = useCallback(() => {
    const r = recRef.current;
    if (r && r.state !== "inactive") {
      // 일시정지 중이면 이미 쌓인 시간만, 녹음 중이면 지금까지를 더한다 (onstop에서 stateRef로 판단)
      r.stop();
    }
  }, []);

  const discard = useCallback(() => {
    setRecording(null);
    setElapsed(0);
    setState("idle");
    clearChunks().catch(() => {});
  }, []);

  const recover = useCallback(async () => {
    try {
      const c = await loadChunks();
      if (!c) return setRecoverable(false);
      const blob = new Blob(c.blobs, { type: c.mime });
      const durationSec = c.blobs.length * (CHUNK_MS / 1000);
      setRecording({ blob, mime: c.mime, ext: extOf(c.mime), durationSec });
      setElapsed(durationSec);
      setRecoverable(false);
      setState("stopped");
    } catch {
      setError("storage");
    }
  }, []);

  const dropRecoverable = useCallback(() => {
    setRecoverable(false);
    clearChunks().catch(() => {});
  }, []);

  const value = useMemo<RecorderApi>(
    () => ({ state, elapsed, level, quiet, error, devices, recording, recoverable, start, pause, resume, stop, discard, recover, dropRecoverable }),
    [state, elapsed, level, quiet, error, devices, recording, recoverable, start, pause, resume, stop, discard, recover, dropRecoverable],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
