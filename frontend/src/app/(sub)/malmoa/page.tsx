import type { Metadata } from "next";

import View from "./view";

export const metadata: Metadata = {
  title: { absolute: "말모아 — 회의는 말로, 기록은 글로" },
  alternates: { canonical: "/malmoa" },
};

// 화면은 브라우저 데이터로 그려지므로 즉시 이동 검사를 끈다.
export const instant = false;

export default function Page() {
  return <View />;
}
