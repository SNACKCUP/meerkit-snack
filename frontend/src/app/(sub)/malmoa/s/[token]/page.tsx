import type { Metadata } from "next";

import View from "./view";

// 공유 링크는 검색에 잡히지 않게 한다.
export const metadata: Metadata = { title: "공유된 회의록", description: "공유받은 회의록을 읽습니다.", robots: { index: false, follow: false } };

// 회의 데이터는 브라우저에만 있어서 서버에서 미리 그릴 내용이 없다. 즉시 이동 검사를 끈다.
export const instant = false;

export default function Page() {
  return <View />;
}
