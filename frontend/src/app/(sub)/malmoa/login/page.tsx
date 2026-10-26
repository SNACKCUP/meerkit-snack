import type { Metadata } from "next";

import View from "./view";

export const metadata: Metadata = { title: "로그인", description: "말모아에 로그인합니다.", robots: { index: false, follow: false } };

// 로그인 상태는 브라우저에서만 알 수 있어서 서버에서 미리 그릴 내용이 없다. 즉시 이동 검사를 끈다.
export const instant = false;

export default function Page() {
  return <View />;
}
