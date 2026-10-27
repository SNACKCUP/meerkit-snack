import type { Metadata } from "next";

import View from "./view";

export const metadata: Metadata = {
  title: "사용 안내",
  description: "말모아로 회의를 녹음하고 회의록을 만들고 공유하는 방법, 자주 묻는 질문을 안내합니다.",
  alternates: { canonical: "/malmoa/guide" },
};

export default function Page() {
  return <View />;
}
