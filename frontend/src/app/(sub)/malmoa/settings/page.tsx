import type { Metadata } from "next";

import View from "./view";

export const metadata: Metadata = { title: "설정", description: "녹음 마이크와 회의실 모드, 움직임, 저장된 데이터를 설정합니다.", robots: { index: false, follow: false } };

// 설정은 이 브라우저에 저장된 값이라 서버에서 미리 그릴 내용이 없다. 즉시 이동 검사를 끈다.
export const instant = false;

export default function Page() {
  return <View />;
}
