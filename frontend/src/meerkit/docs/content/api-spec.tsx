"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import spec from "../api-spec.json";
import { Callout, CodeBlock, DocTable, H2, H3, Ic, P, UL } from "../ui";

// docs/api-spec.json은 백엔드 Swagger(OpenAPI)에서 뽑은 것이다. 갱신: frontend에서 node scripts/gen-api-spec.mjs
// 이 페이지는 명세만 보여 준다 (요청을 보내 보는 기능은 없다. 직접 해 보려면 백엔드의 /docs를 쓴다).

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

const METHOD_STYLE: Record<string, string> = {
  GET: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  POST: "bg-blue-500/12 text-blue-700 dark:text-blue-300",
  PUT: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  PATCH: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  DELETE: "bg-red-500/12 text-red-700 dark:text-red-300",
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
  return <span className={cn("inline-flex min-w-14 justify-center rounded-md px-2 py-0.5 font-mono text-[11px] font-bold", METHOD_STYLE[method] ?? "bg-muted")}>{method}</span>;
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

function EndpointView({ ep }: { ep: Endpoint }) {
  return (
    <section className="grid gap-4">
      <H2>{`${ep.method} ${ep.path}`}</H2>
      <div className="flex flex-wrap items-center gap-2">
        <MethodBadge method={ep.method} />
        <code className="font-mono text-sm">{ep.path}</code>
        {ep.auth ? <Badge variant="secondary">로그인 필요 (Bearer)</Badge> : <Badge variant="outline">인증 없음</Badge>}
        {ep.planned && <Badge variant="brand">서버 구현 예정</Badge>}
      </div>
      <P>{ep.summary}</P>
      {ep.description && ep.description !== ep.summary && <P className="text-muted-foreground">{ep.description}</P>}

      {ep.params.length > 0 && (
        <>
          <H3>Parameters</H3>
          <FieldTable fields={ep.params} withIn />
        </>
      )}

      {ep.body && (
        <>
          <H3>Request Body</H3>
          <p className="text-xs text-muted-foreground">
            <Ic>{ep.body.contentType}</Ic> · <Ic>{ep.body.schema}</Ic>{ep.body.required ? " · 필수" : ""}
          </p>
          {ep.body.fields.length > 0 && <FieldTable fields={ep.body.fields} />}
          <CodeBlock title="Example Value" code={json(ep.body.example)} />
        </>
      )}

      <H3>Responses</H3>
      <div className="grid gap-3">
        {ep.responses.map((r) => (
          <div key={r.status} className="grid gap-2 rounded-2xl border bg-card p-4 shadow-soft">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("rounded-md px-2 py-0.5 font-mono text-xs font-bold", STATUS_STYLE(r.status))}>{r.status}</span>
              <span className="text-sm">{r.description}</span>
              {r.schema && <code className="ml-auto font-mono text-xs text-muted-foreground">{r.schema}</code>}
            </div>
            {r.example !== null && r.example !== undefined && <CodeBlock title="Example Value" code={json(r.example)} />}
          </div>
        ))}
      </div>
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
      <P>
        <strong>{group.title}</strong> 묶음의 API {endpoints.length}개입니다. 경로는 프론트에서 <Ic>/api</Ic> 프록시로 호출하는 주소 그대로입니다.
      </P>
      {endpoints.map((ep) => <EndpointView key={`${ep.method} ${ep.path}`} ep={ep} />)}
    </>
  );
}

export function ApiOverviewDoc() {
  const total = spec.groups.reduce((n, g) => n + g.endpoints.length, 0);
  return (
    <>
      <P>
        백엔드(FastAPI) Swagger 명세를 그대로 옮긴 API 문서입니다. 현재 <strong>{total}개</strong>의 엔드포인트가 있고, 묶음별로 나뉘어 있습니다.
        이 문서는 명세만 보여 주며 요청을 보내 보는 기능은 없습니다. 직접 호출해 보려면 백엔드의 <Ic>/docs</Ic>(Swagger UI)를 쓰세요.
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
      <Callout>
        <Ic>서버 구현 예정</Ic> 표시가 붙은 API는 킷 화면이 이미 호출하지만 백엔드에는 아직 없는 것입니다. 서버를 만들 때 이 명세를 기준으로 하세요.
      </Callout>
      <H2>명세 갱신</H2>
      <UL>
        <li>백엔드가 바뀌면 <Ic>frontend</Ic>에서 <Ic>node scripts/gen-api-spec.mjs</Ic>를 실행해 <Ic>src/meerkit/docs/api-spec.json</Ic>을 다시 만듭니다.</li>
        <li>서버가 켜져 있지 않으면 <Ic>app.openapi()</Ic> 결과를 파일로 저장해 경로를 넘길 수 있습니다 (스크립트 맨 위 주석 참고).</li>
        <li>서비스 쪽 API(예: 요구사항 문서)는 킷 문서에 넣지 않도록 스크립트에서 제외합니다.</li>
      </UL>
    </>
  );
}

const DESCRIPTIONS: Record<string, string> = {
  health: "서버가 살아 있는지, DB까지 준비됐는지 확인",
  auth: "회원가입, 로그인, 토큰 재발급, 이메일 인증, 비밀번호 찾기·재설정",
  "users (me)": "내 정보 조회·수정, 비밀번호 변경, 탈퇴",
  "users (admin)": "멤버 검색, 역할 변경, 활성/비활성, 삭제 (MASTER 전용)",
};
