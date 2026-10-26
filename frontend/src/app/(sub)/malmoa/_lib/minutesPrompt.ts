import { formatClock } from "./format";
import type { Segment } from "./types";

const FORMAT = `다음 8개 항목으로 회의록을 작성해 주세요.
1. 회의 제목  2. 회의 개요  3. 주요 논의 내용  4. 핵심 요약  5. 결정 사항  6. 담당자별 실행 과제  7. 일정 및 마감일  8. 추가 확인이 필요한 사항

규칙
- 원문에 없는 담당자, 일정, 결정은 지어내지 말고 "확인 필요"라고 적습니다.
- 원문의 말투와 용어를 그대로 쓰고, 추측은 하지 않습니다.`;

export const segmentsToText = (segs: Segment[]) => segs.map((s) => s.text).join("\n");
export const segmentsToTimed = (segs: Segment[]) => segs.map((s) => `[${formatClock(s.start)}] ${s.text}`).join("\n");

// ChatGPT·Claude에 붙여 넣어 회의록을 만들 때 쓰는 요청문 + 원문
export function buildMinutesPrompt(segs: Segment[], image: boolean): string {
  if (image) return `아래는 화이트보드 사진에서 읽은 글자입니다. 인식이 틀렸을 수 있습니다.\n${FORMAT}\n\n[화이트보드에서 읽은 내용]\n${segmentsToText(segs)}`;
  return `아래는 회의 녹음을 글로 옮긴 원문입니다. 각 줄 앞의 [시:분:초]는 녹음 시간입니다.\n${FORMAT}\n\n[회의 원문]\n${segmentsToTimed(segs)}`;
}
