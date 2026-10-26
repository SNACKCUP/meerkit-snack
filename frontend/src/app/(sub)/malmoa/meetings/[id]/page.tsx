import type { Metadata } from "next";

import View from "./view";

export const metadata: Metadata = { title: "회의 결과", description: "회의 원문과 AI 회의록을 확인하고 복사·다운로드합니다.", robots: { index: false, follow: false } };

// 회의 데이터는 브라우저에만 있어서 서버에서 미리 그릴 내용이 없다. 즉시 이동 검사를 끈다.
export const instant = false;

export default function Page() {
  return <View />;
}
