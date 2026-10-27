"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import spec from "../api-spec.json";
import { TAG_SLUG } from "../component-apis";
import { CodeBlock, DocTable, H2, Ic, P } from "../ui";

// docs/api-spec.json은 백엔드 Swagger(OpenAPI)에서 뽑은 것이다. 갱신: frontend에서 node scripts/gen-api-spec.mjs
// 이 페이지는 명세만 보여 준다 (요청을 보내 보는 기능은 없다).

interface Field { name: string; type: string; required: boolean; description: string; constraints: string; example: unknown }
interface Endpoint {
  method: string;
  path: string;
  summary: string;
  description: string;
  auth: boolean;
  params: (Field & { in: string })[];
  body: { contentType: string; schema: string; fields: Field[]; example: unknown; required: boolean } | null;
  responses: { status: string; description: string; schema: string | null; example: unknown }[];
  /** 서버에 아직 없는 API (킷이 먼저 정한 계약) */
  planned?: boolean;
}

// Swagger처럼 메서드마다 색을 달리한다: 행 배경·테두리(row), 메서드 배지(badge)
const METHOD_STYLE: Record<string, { row: string; badge: string }> = {
  GET: { row: "border-sky-500/40 bg-sky-500/8", badge: "bg-sky-600 text-white" },
  POST: { row: "border-emerald-500/40 bg-emerald-500/8", badge: "bg-emerald-600 text-white" },
  PUT: { row: "border-amber-500/45 bg-amber-500/10", badge: "bg-amber-500 text-white" },
  PATCH: { row: "border-teal-500/40 bg-teal-500/8", badge: "bg-teal-600 text-white" },
  DELETE: { row: "border-red-500/40 bg-red-500/8", badge: "bg-red-600 text-white" },
};

const STATUS_STYLE = (status: string) =>
  status.startsWith("2") ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" : "bg-red-500/12 text-red-700 dark:text-red-300";

// 서버에 아직 없지만 킷 화면이 호출하는 API. 서버 구현의 기준이 된다.
const PLANNED: Record<string, Endpoint[]> = {
  auth: [
    {
      method: "POST",
      path: "/api/auth/id/forgot",
      summary: "아이디 찾기 메일 요청 (가입 여부와 관계없이 항상 같은 응답)",
      description: "가입된 이메일이면 일부를 가린 아이디(예: ad***)를 메일로 보냅니다. 가입 여부가 드러나지 않도록 응답은 항상 같습니다.",
      auth: false,
      params: [],
      body: {
        contentType: "application/json",
        schema: "ForgotIdRequest",
        required: true,
        fields: [{ name: "email", type: "string (email)", required: true, description: "가입한 이메일", constraints: "", example: "writer01@example.com" }],
        example: { email: "writer01@example.com" },
      },
      responses: [{ status: "202", description: "성공 (가입 여부와 관계없이 동일)", schema: null, example: null }],
      planned: true,
    },
  ],
  "users (me)": [
    {
      method: "POST",
      path: "/api/users/me/avatar",
      summary: "프로필 이미지 올리기 (JPG·PNG·WEBP, 2MB 이하)",
      description: "multipart/form-data의 file 필드로 이미지를 보냅니다. 저장 후 avatar_url이 채워진 내 정보를 돌려줍니다.",
      auth: true,
      params: [],
      body: {
        contentType: "multipart/form-data",
        schema: "Body_upload_avatar",
        required: true,
        fields: [{ name: "file", type: "string (binary)", required: true, description: "이미지 파일", constraints: "JPG·PNG·WEBP, 최대 2MB", example: "(파일)" }],
        example: { file: "(파일)" },
      },
      responses: [{ status: "200", description: "성공", schema: "UserRead", example: null }],
      planned: true,
    },
    {
      method: "DELETE",
      path: "/api/users/me/avatar",
      summary: "프로필 이미지 삭제",
      description: "프로필 이미지를 지우고 avatar_url이 비워진 내 정보를 돌려줍니다.",
      auth: true,
      params: [],
      body: null,
      responses: [{ status: "200", description: "성공", schema: "UserRead", example: null }],
      planned: true,
    },
  ],
};

const json = (v: unknown) => JSON.stringify(v, null, 2);

function MethodBadge({ method }: { method: string }) {
  return <span className={cn("inline-flex min-w-16 justify-center rounded-md px-2 py-1 font-mono text-xs font-bold", METHOD_STYLE[method]?.badge ?? "bg-muted")}>{method}</span>;
}

function FieldTable({ fields, withIn }: { fields: (Field & { in?: string })[]; withIn?: boolean }) {
  return (
    <DocTable
      head={withIn ? ["이름", "위치", "타입", "설명"] : ["이름", "타입", "설명"]}
      rows={fields.map((f) => [
        <span key="n" className="inline-flex w-max items-center gap-2">
          <Ic>{f.name}</Ic>
          {f.required && <Badge variant="brand">필수</Badge>}
        </span>,
        ...(withIn ? [<code key="i" className="font-mono text-xs text-muted-foreground">{f.in}</code>] : []),
        <code key="t" className="font-mono text-xs text-muted-foreground">{f.type}</code>,
        <span key="d" className="grid gap-1">
          <span>{f.description || <span className="text-muted-foreground">-</span>}</span>
          {f.constraints && <span className="text-xs text-muted-foreground">{f.constraints}</span>}
          {f.example !== undefined && f.example !== null && <span className="text-xs text-muted-foreground">예시 <Ic>{typeof f.example === "string" ? f.example : JSON.stringify(f.example)}</Ic></span>}
        </span>,
      ])}
    />
  );
}

export const endpointId = (method: string, path: string) => `ep-${method}-${path}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "");

function EndpointView({ ep }: { ep: Endpoint }) {
  const id = endpointId(ep.method, ep.path);
  const [open, setOpen] = useState(false);

  // 목차나 링크의 #앵커로 오면 이 행을 펼친다 (DocsView가 앵커로 이동하며 이벤트를 보낸다)
  useEffect(() => {
    const onOpen = (e: Event) => { if ((e as CustomEvent<string>).detail === id) setOpen(true); };
    window.addEventListener("mk-open-anchor", onOpen);
    return () => window.removeEventListener("mk-open-anchor", onOpen);
  }, [id]);

  const style = METHOD_STYLE[ep.method];
  return (
    <section className={cn("relative overflow-hidden rounded-2xl border", style?.row)}>
      {/* 우측 목차가 가리키는 제목 (화면에는 보이지 않는다) */}
      <h2 id={id} className="sr-only scroll-mt-24">{`${ep.method} ${ep.path}`}</h2>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
      >
        <MethodBadge method={ep.method} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <code className="break-all font-mono text-sm font-semibold">{ep.path}</code>
          <span className="text-[13px] text-foreground/70">{ep.summary}</span>
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="grid gap-4 border-t border-inherit bg-background/70 p-4">
          {ep.description && ep.description !== ep.summary && <P className="text-muted-foreground">{ep.description}</P>}
          <p className="text-xs text-muted-foreground">{ep.auth ? <>인증: <Ic>Authorization: Bearer &lt;access_token&gt;</Ic></> : "인증 없이 호출할 수 있습니다."}</p>

          {ep.params.length > 0 && (
            <>
              <h3 className="text-sm font-semibold">Parameters</h3>
              <FieldTable fields={ep.params} withIn />
            </>
          )}

          {ep.body && (
            <>
              <h3 className="text-sm font-semibold">Request Body</h3>
              <p className="text-xs text-muted-foreground">
                <Ic>{ep.body.contentType}</Ic> · <Ic>{ep.body.schema}</Ic>{ep.body.required ? " · 필수" : ""}
              </p>
              {ep.body.fields.length > 0 && <FieldTable fields={ep.body.fields} />}
              <CodeBlock title="Example Value" code={json(ep.body.example)} />
            </>
          )}

          <h3 className="text-sm font-semibold">Responses</h3>
          <div className="grid gap-3">
            {ep.responses.map((r) => (
              <div key={r.status} className="grid gap-2 rounded-2xl border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-md px-2 py-0.5 font-mono text-xs font-bold", STATUS_STYLE(r.status))}>{r.status}</span>
                  <span className="text-sm">{r.description}</span>
                  {r.schema && <code className="ml-auto font-mono text-xs text-muted-foreground">{r.schema}</code>}
                </div>
                {r.example !== null && r.example !== undefined && <CodeBlock title="Example Value" code={json(r.example)} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/** 백엔드 Swagger 명세를 묶음(tag)별로 보여 주는 페이지 본문 */
export function ApiSpecPage({ tag }: { tag: string }) {
  const group = spec.groups.find((g) => g.tag === tag);
  if (!group) return <P>명세를 찾을 수 없습니다.</P>;
  const endpoints = [...(group.endpoints as Endpoint[]), ...(PLANNED[tag] ?? [])];
  return (
    <>
      <P>{DESCRIPTIONS[tag]}. 줄을 누르면 요청과 응답이 펼쳐집니다.</P>
      <div className="grid gap-3">
        {endpoints.map((ep) => <EndpointView key={`${ep.method} ${ep.path}`} ep={ep} />)}
      </div>
    </>
  );
}

export function ApiOverviewDoc() {
  const total = spec.groups.reduce((n, g) => n + g.endpoints.length, 0);
  return (
    <>
      <P>
        어떤 API가 있고, 요청에 무엇을 담아 보내면 어떤 응답이 오는지 정리한 문서입니다. 현재 <strong>{total}개</strong>의 API가 있습니다.
      </P>
      <H2>Conventions</H2>
      <DocTable
        head={["항목", "규칙"]}
        rows={[
          ["Base URL", <Ic key="1">/api</Ic>],
          ["인증", <Ic key="2">Authorization: Bearer &lt;access_token&gt;</Ic>],
          ["본문 형식", "JSON (Content-Type: application/json)"],
          ["리프레시 토큰", "httpOnly 쿠키. 요청에 자동 포함 (withCredentials)"],
          ["오류 응답", <Ic key="3">{`{ "detail": "메시지" }`}</Ic>],
          ["요청 형식 오류", <span key="4">422 <Ic>{`{ "detail": [{ "loc": [...], "msg": "...", "type": "..." }] }`}</Ic></span>],
          ["시간 형식", "ISO 8601 (UTC), 예: 2026-10-05T09:00:00Z"],
        ]}
      />
      <H2>묶음</H2>
      <DocTable
        head={["묶음", "개수", "설명"]}
        rows={spec.groups.map((g) => [<Ic key={g.tag}>{g.title}</Ic>, `${g.endpoints.length + (PLANNED[g.tag]?.length ?? 0)}개`, DESCRIPTIONS[g.tag] ?? ""])}
      />
    </>
  );
}

const DESCRIPTIONS: Record<string, string> = {
  health: "서버가 살아 있는지, DB까지 준비됐는지 확인",
  auth: "회원가입, 로그인, 토큰 재발급, 이메일 인증, 비밀번호 찾기·재설정",
  "users (me)": "내 정보 조회·수정, 비밀번호 변경, 탈퇴",
  "users (admin)": "멤버 검색, 역할 변경, 활성/비활성, 삭제 (MASTER 전용)",
};

/** 컴포넌트 문서 맨 아래: 이 컴포넌트가 호출하는 API */
export function LinkedApis({ apis }: { apis: string[] }) {
  const all = spec.groups.flatMap((g) => [...(g.endpoints as Endpoint[]), ...(PLANNED[g.tag] ?? [])].map((ep) => ({ tag: g.tag, ep })));
  const rows = apis.map((key) => all.find(({ ep }) => `${ep.method} ${ep.path}` === key)).filter((r) => !!r);
  if (rows.length === 0) return null;
  return (
    <section className="mt-12 grid gap-3">
      <H2>Related API</H2>
      <p className="text-sm text-muted-foreground">이 컴포넌트가 호출하는 API입니다. 누르면 요청·응답 명세로 이동합니다.</p>
      <div className="grid gap-2">
        {rows.map(({ tag, ep }) => (
          <Link
            key={`${ep.method} ${ep.path}`}
            href={`/docs/${TAG_SLUG[tag]}#${endpointId(ep.method, ep.path)}`}
            className={cn("flex items-center gap-3 rounded-xl border px-3 py-2 transition-opacity hover:opacity-80", METHOD_STYLE[ep.method]?.row)}
          >
            <MethodBadge method={ep.method} />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <code className="break-all font-mono text-[13px] font-semibold">{ep.path}</code>
              <span className="text-[13px] text-foreground/70">{ep.summary}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
