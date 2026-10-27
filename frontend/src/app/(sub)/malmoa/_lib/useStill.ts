import { useSyncExternalStore } from "react";

import { useRecorderPrefs } from "./prefs";

const query = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(query);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

// 움직임을 만들지 말아야 하는지: OS의 "동작 줄이기" 또는 설정의 "움직임 끄기"
export function useStill() {
  const os = useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
  const pref = useRecorderPrefs((s) => s.reduceMotion);
  return os || pref;
}
