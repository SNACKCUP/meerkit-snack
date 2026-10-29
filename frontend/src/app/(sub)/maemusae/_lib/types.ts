// 매무새 화면이 쓰는 데이터 모양.
// 프로젝트·멤버·초대·문서·올린 파일·요구사항 후보·입력·버전은 서버 API 모양(api.ts)을 쓴다.
// 아래 확정 기록만 확정(M4) API가 생기기 전까지 브라우저 목 데이터(store.ts)로 흉내 낸다.

export type ProjectRole = "ADMIN" | "MEMBER";

/** 화면에 보이는 문서 상태. 서버 상태(ApiDocStatus)에 브라우저 목 확정을 얹어 고른다 (status.ts) */
export type DocStatus = "empty" | "analyzing" | "ready" | "confirming" | "confirmed";

/** 확정 문서에 담는 요구사항 하나 (그 순간 그대로) */
export interface ConfirmedItem {
  id: number;
  code: string; // REQ-001
  name: string;
  /** 공통코드 MMS_REQ_KIND */
  kind: string;
  /** 공통코드 MMS_PRIORITY */
  priority: string;
  description: string;
  /** 근거 문장 (여러 개면 줄을 나눠 이어 붙임) */
  quote: string;
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
  items: ConfirmedItem[];
}
