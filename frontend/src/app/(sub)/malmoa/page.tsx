import type { Metadata } from "next";

import View from "./view";

export const metadata: Metadata = {
  title: { absolute: "말모아 — 회의는 말로, 기록은 글로" },
  alternates: { canonical: "/malmoa" },
  keywords: ["회의록", "음성 녹음", "AI 회의록", "회의 요약", "음성 텍스트 변환", "말모아"],
};

// 화면은 브라우저 데이터로 그려지므로 즉시 이동 검사를 끈다.
export const instant = false;

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "말모아",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "ko",
  description: "회의 내용을 말로 모으면 AI가 문서로 만들어 주고, 회의할수록 경험치가 쌓이는 픽셀 회의록 서비스",
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }} />
      <View />
    </>
  );
}
