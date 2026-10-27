import type { Meeting } from "../_lib/types";
import { PxBadge } from "./px";

// 작업 상태 배지. 사진은 "글자 읽기", 음성은 "텍스트 변환"이라고 부른다.
export function StatusBadge({ meeting }: { meeting: Pick<Meeting, "status" | "source" | "progress" | "minutesReady"> }) {
  const image = meeting.source === "image";
  switch (meeting.status) {
    case "QUEUED":
      return <PxBadge>{image ? "글자 읽기 대기" : "변환 대기"}</PxBadge>;
    case "TRANSCRIBING":
      return <PxBadge tone="sky">{image ? "글자 읽는 중" : "변환 중"} {meeting.progress ?? 0}%</PxBadge>;
    case "SUMMARIZING":
      return <PxBadge tone="sky">회의록 작성 중</PxBadge>;
    case "FAILED":
      return <PxBadge tone="pink">실패</PxBadge>;
    default:
      return <PxBadge tone="mint">{meeting.minutesReady ? "회의록 완료" : image ? "글자 읽기 완료" : "텍스트 변환 완료"}</PxBadge>;
  }
}
