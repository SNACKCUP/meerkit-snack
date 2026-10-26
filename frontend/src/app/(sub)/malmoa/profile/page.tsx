import type { Metadata } from "next";

import View from "./view";

export const metadata: Metadata = { title: "내 캐릭터", description: "레벨, 경험치, 업적을 확인합니다.", robots: { index: false, follow: false } };

// 캐릭터 데이터는 브라우저에만 있어서 서버에서 미리 그릴 내용이 없다. 즉시 이동 검사를 끈다.
export const instant = false;

export default function Page() {
  return <View />;
}
