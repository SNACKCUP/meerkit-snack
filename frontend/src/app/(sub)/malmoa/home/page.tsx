import type { Metadata } from "next";

import View from "./view";

export const metadata: Metadata = { title: "퀘스트 보드", description: "회의를 녹음하고 경험치를 모읍니다.", robots: { index: false, follow: false } };

// 회의 데이터는 브라우저에만 있어서 서버에서 미리 그릴 내용이 없다. 즉시 이동 검사를 끈다.
export const instant = false;

export default function Page() {
  return <View />;
}
