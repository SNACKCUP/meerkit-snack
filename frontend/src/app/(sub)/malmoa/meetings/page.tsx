import type { Metadata } from "next";

import View from "./view";

export const metadata: Metadata = { title: "회의 목록", description: "기록한 회의를 찾아보고 결과를 확인합니다.", robots: { index: false, follow: false } };

// 회의 데이터는 브라우저에만 있어서 서버에서 미리 그릴 내용이 없다. 즉시 이동 검사를 끈다.
export const instant = false;

export default function Page() {
  return <View />;
}
