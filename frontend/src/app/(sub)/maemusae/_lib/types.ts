// 매무새 화면이 쓰는 데이터 모양.
// 프로젝트·멤버·초대·문서·올린 파일은 서버 API 모양(api.ts)을 쓴다.
// 아래 요구사항 후보·입력한 내용·확정 기록은 AI 분석(M3)·확정(M4) API가 생기기 전까지 브라우저 목 데이터(store.ts)로 흉내 낸다.

export type ProjectRole = "ADMIN" | "MEMBER";

/** 요구사항 구분 코드 (공통코드 MMS_REQ_KIND: FUNCTIONAL / NON_FUNCTIONAL / CONSTRAINT). 이름은 서버에서 받는다 */
export type CandidateKind = string;
export type Priority = "높음" | "중간" | "낮음";

export interface Candidate {
  id: string;
  code: string; // REQ-001
  name: string;
  kind: CandidateKind;
  priority: Priority;
  description: string;
  /** 문서에서 이 요구사항을 뽑은 근거 문장 */
  quote: string;
  /** AI가 모호하다고 본 부분에 단 확인 질문. 답이 반영되면 null */
  question: string | null;
  answer: string;
  /** 사용자가 직접 추가한 항목이면 true. AI가 만든 항목은 삭제할 수 없다 */
  manual?: boolean;
  /** 체크를 해제하면 확정 대상에서 빠진다 */
  included: boolean;
}

export type NoteField = "description" | "answer";

export interface Note {
  id: string;
  candidateId: string;
  /** 어느 입력 칸에서 온 내용인지. 후보 하나에 칸마다 하나씩만 남는다 */
  field: NoteField;
  text: string;
  author: string;
  at: string;
}

export type DocStatus = "empty" | "analyzing" | "ready" | "confirming" | "confirmed";

export interface RequirementDoc {
  status: DocStatus;
  prompt: string;
  /** 분석에 쓴 파일 이름 (올린 파일은 서버에 있음) */
  files: string[];
  candidates: Candidate[];
  notes: Note[];
  /** 마지막으로 보던 후보. 다시 들어오면 목록 중앙에 보여 준다 */
  lastViewedId: string | null;
  savedAt: string | null;
  confirmedAt: string | null;
  /** 확정을 시작한 사람 이름 (확정 문서 기록에 남는다) */
  confirmedBy: string | null;
  /** 오래 걸리는 작업을 시작한 시각 (새로고침 뒤 이어서 마무리하는 데 쓴다) */
  pendingSince: number | null;
}

/** 확정할 때마다 쌓이는 문서 기록. 그 시점의 요구사항을 그대로 담는다 */
export interface ConfirmedDoc {
  id: string;
  projectId: string;
  title: string;
  kind: "요구사항정의서";
  /** 1이면 첫 확정, 2부터는 확정 뒤 수정해서 다시 확정한 것 */
  revision: number;
  confirmedAt: string;
  confirmedBy: string;
  items: Candidate[];
}
