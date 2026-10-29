// 매무새 백엔드(/api/mms) 호출. 킷의 api 클라이언트를 써서 로그인 토큰·자동 갱신이 그대로 붙는다.
// 응답 모양은 백엔드 스키마(snake_case)를 그대로 쓴다. 화면 부품은 이 파일을 직접 부르지 않고 queries.ts의 훅을 쓴다.

import { api } from "@/meerkit";

import type { ProjectRole } from "./types";

export interface ApiProject {
  id: number;
  name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  member_count: number;
  /** 이 프로젝트에서 내 역할. 멤버가 아닌 서비스 관리자(MASTER)가 보기만 할 때는 null */
  my_role: ProjectRole | null;
  created_at: string;
}

export interface ApiProjectPage {
  items: ApiProject[];
  total: number;
  page: number;
  size: number;
}

export interface ApiMember {
  id: number;
  /** 로그인 아이디 */
  user_id: string;
  name: string;
  role: ProjectRole;
  joined_at: string;
}

export interface ApiInvitation {
  id: number;
  email: string;
  role: ProjectRole;
  invited_by_name: string;
  expires_at: string;
  created_at: string;
}

export interface ApiInvitationInfo {
  project_name: string;
  invited_by_name: string;
  role: ProjectRole;
  email: string;
  expires_at: string;
  /** 초대 이메일로 이미 가입했는지. false면 가입, true면 로그인으로 보낸다 */
  account_exists: boolean;
}

export type ApiDocStatus = "EMPTY" | "ANALYZING" | "READY" | "CONFIRMING" | "CONFIRMED" | "FAILED";

export interface ApiDocument {
  id: number;
  kind: string;
  kind_label: string;
  status: ApiDocStatus;
  current_revision: number;
  source_count: number;
  saved_at: string | null;
  confirmed_at: string | null;
  confirmed_by_name: string | null;
  updated_at: string;
}

export interface ApiSource {
  id: number;
  source_type: "FILE" | "TEXT";
  filename: string | null;
  content_type: string | null;
  size_bytes: number | null;
  page_count: number;
  uploaded_by_name: string;
  uploaded_by_me: boolean;
  created_at: string;
}

export interface ApiSourcePage {
  id: number;
  seq: number;
  page_no: number | null;
  location_label: string;
  text: string;
}

export interface ApiCode {
  code: string;
  label: string;
  sort_order: number;
}

export interface ApiCodeGroup {
  group_code: string;
  name: string;
  codes: ApiCode[];
}

const P = "/mms/projects";
const data = <T,>(r: { data: T }) => r.data;

export const mmsApi = {
  // 프로젝트·멤버
  listProjects: (q?: string) => api.get<ApiProjectPage>(P, { params: { q: q || undefined, size: 100 } }).then(data),
  getProject: (id: string) => api.get<ApiProject>(`${P}/${id}`).then(data),
  createProject: (body: { name: string; start_date: string; end_date: string }) => api.post<ApiProject>(P, body).then(data),
  listMembers: (id: string) => api.get<ApiMember[]>(`${P}/${id}/members`).then(data),
  changeRole: (id: string, memberId: number, role: ProjectRole) => api.patch<ApiMember>(`${P}/${id}/members/${memberId}`, { role }).then(data),
  removeMember: (id: string, memberId: number) => api.delete(`${P}/${id}/members/${memberId}`),

  // 초대 (관리자)
  listInvitations: (id: string) => api.get<ApiInvitation[]>(`${P}/${id}/invitations`).then(data),
  invite: (id: string, email: string, role: ProjectRole = "MEMBER") => api.post<ApiInvitation>(`${P}/${id}/invitations`, { email, role }).then(data),
  revokeInvitation: (id: string, invitationId: number) => api.delete(`${P}/${id}/invitations/${invitationId}`),

  // 초대 링크 (토큰은 로그에 남지 않게 주소가 아니라 본문으로 보낸다)
  lookupInvitation: (token: string) => api.post<ApiInvitationInfo>("/mms/invitations/lookup", { token }).then(data),
  invitationSignupProof: (token: string) => api.post<{ email: string; email_verification_token: string }>("/mms/invitations/signup-proof", { token }).then(data),
  acceptInvitation: (token: string) => api.post<{ project_id: number; role: ProjectRole }>("/mms/invitations/accept", { token }).then(data),

  // 문서·올린 파일
  listDocuments: (id: string) => api.get<ApiDocument[]>(`${P}/${id}/documents`).then(data),
  listSources: (id: string, docId: number) => api.get<ApiSource[]>(`${P}/${id}/documents/${docId}/sources`).then(data),
  uploadSource: (id: string, docId: number, input: { file: File } | { text: string }) => {
    const form = new FormData();
    if ("file" in input) form.append("file", input.file);
    else form.append("text", input.text);
    return api.post<ApiSource>(`${P}/${id}/documents/${docId}/sources`, form).then(data);
  },
  deleteSource: (id: string, docId: number, sourceId: number) => api.delete(`${P}/${id}/documents/${docId}/sources/${sourceId}`),
  listSourcePages: (id: string, docId: number, sourceId: number) => api.get<ApiSourcePage[]>(`${P}/${id}/documents/${docId}/sources/${sourceId}/pages`).then(data),
  // 원본은 공개 주소가 없어서 로그인 토큰을 붙여 받아야 한다 (a 태그로 바로 열면 401)
  downloadSource: (id: string, docId: number, sourceId: number) =>
    api.get<Blob>(`${P}/${id}/documents/${docId}/sources/${sourceId}/file`, { responseType: "blob" }).then(data),

  // 공통코드 (구분 드롭다운 등)
  codeGroup: (groupCode: string) => api.get<ApiCodeGroup>(`/codes/${groupCode}`).then(data),
};

/** 서버 오류 응답 {detail, code}에서 화면에 보여 줄 문구를 꺼낸다 */
export function apiError(error: unknown, fallback = "요청에 실패했어요. 잠시 후 다시 시도해 주세요."): string {
  const res = (error as { response?: { data?: { detail?: unknown } } })?.response;
  if (!res) return error ? "서버에 연결할 수 없어요." : fallback;
  return typeof res.data?.detail === "string" ? res.data.detail : fallback;
}

/** 서버 오류 코드 (예: INVITATION_INVALID). 없으면 null */
export function apiErrorCode(error: unknown): string | null {
  const code = (error as { response?: { data?: { code?: unknown } } })?.response?.data?.code;
  return typeof code === "string" ? code : null;
}

/** 오류 HTTP 상태 (예: 404). 응답이 없으면 null */
export function apiStatus(error: unknown): number | null {
  return (error as { response?: { status?: number } })?.response?.status ?? null;
}
