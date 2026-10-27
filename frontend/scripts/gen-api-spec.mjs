// 백엔드 Swagger(OpenAPI)를 문서용 JSON으로 바꾼다.
// 사용: node scripts/gen-api-spec.mjs [openapi 주소 또는 json 파일 경로. 기본 http://localhost:8000/openapi.json]
// 실행 중인 서버가 옛 코드일 수 있으니, 파일로 뽑아 쓰려면 backend에서: uv run python -c "import json; from app.main import app; print(json.dumps(app.openapi(), ensure_ascii=False))" > openapi.json
// 결과: src/meerkit/docs/api-spec.json (docs의 API Spec 페이지가 읽는다). 백엔드가 바뀌면 다시 실행한다.
import { readFileSync, writeFileSync } from "node:fs";

const url = process.argv[2] ?? "http://localhost:8000/openapi.json";
// 킷 문서에 넣지 않는 묶음 (서비스 쪽 API)
const EXCLUDE_TAGS = new Set(["requirements"]);

const spec = /^https?:/.test(url) ? await (await fetch(url)).json() : JSON.parse(readFileSync(url, "utf8"));
const schemas = spec.components?.schemas ?? {};

const resolve = (s) => (s?.$ref ? schemas[s.$ref.split("/").pop()] : s);
const refName = (s) => s?.$ref?.split("/").pop();

// anyOf [X, null] 같은 선택 값에서 실제 스키마를 꺼낸다
function unwrap(s) {
  s = resolve(s) ?? {};
  if (s.anyOf) {
    const real = s.anyOf.find((x) => x.type !== "null");
    return { ...unwrap(real), nullable: true, title: s.title, description: s.description ?? unwrap(real).description, default: s.default, examples: s.examples ?? unwrap(real).examples };
  }
  if (s.allOf?.length === 1) return { ...unwrap(s.allOf[0]), ...s, allOf: undefined };
  return s;
}

function typeOf(s) {
  s = unwrap(s);
  if (s.enum) return s.enum.map((v) => JSON.stringify(v)).join(" | ");
  if (s.type === "array") return `${typeOf(s.items)}[]`;
  if (s.type === "string" && s.format) return `string (${s.format})`;
  if (s.type === "object" && s.title) return s.title;
  return s.type ?? "object";
}

function constraints(s) {
  s = unwrap(s);
  const out = [];
  if (s.minLength != null) out.push(`최소 ${s.minLength}자`);
  if (s.maxLength != null) out.push(`최대 ${s.maxLength}자`);
  if (s.minimum != null) out.push(`최소 ${s.minimum}`);
  if (s.maximum != null) out.push(`최대 ${s.maximum}`);
  if (s.pattern) out.push(`패턴 ${s.pattern}`);
  if (s.default !== undefined && s.default !== null) out.push(`기본 ${JSON.stringify(s.default)}`);
  return out.join(", ");
}

// 필드마다 적힌 예시 값으로 JSON 예시를 만든다
function example(s, depth = 0) {
  s = unwrap(s);
  if (s.examples?.length) return s.examples[0];
  if (s.example !== undefined) return s.example;
  if (s.default !== undefined && s.default !== null) return s.default;
  if (s.enum) return s.enum[0];
  if (s.type === "object" || s.properties) {
    if (depth > 3) return {};
    const o = {};
    for (const [k, v] of Object.entries(s.properties ?? {})) o[k] = example(v, depth + 1);
    return o;
  }
  if (s.type === "array") return [example(s.items, depth + 1)];
  if (s.type === "integer" || s.type === "number") return 0;
  if (s.type === "boolean") return true;
  if (s.type === "string") return s.format === "date-time" ? "2026-10-27T09:00:00Z" : s.format === "date" ? "2026-10-27" : "string";
  return null;
}

function fields(s) {
  s = unwrap(s);
  const required = new Set(s.required ?? []);
  return Object.entries(s.properties ?? {}).map(([name, p]) => {
    const u = unwrap(p);
    return {
      name,
      type: typeOf(p) + (u.nullable ? " | null" : ""),
      required: required.has(name),
      description: u.description ?? "",
      constraints: constraints(p),
      example: example(p),
    };
  });
}

const GROUP_TITLE = { health: "Health", auth: "Auth", "users (me)": "Users · 내 정보", "users (admin)": "Users · 관리자" };
const groups = {};

for (const [path, methods] of Object.entries(spec.paths)) {
  for (const [method, op] of Object.entries(methods)) {
    const tag = op.tags?.[0] ?? "health";
    if (EXCLUDE_TAGS.has(tag)) continue;
    const params = (op.parameters ?? []).map((p) => {
      const u = unwrap(p.schema);
      return { name: p.name, in: p.in, type: typeOf(p.schema), required: !!p.required, description: p.description ?? u.description ?? "", constraints: constraints(p.schema), example: p.example ?? (p.schema ? example(p.schema) : undefined) };
    });
    const bodyContent = op.requestBody?.content;
    const bodyType = bodyContent && Object.keys(bodyContent)[0];
    const bodySchema = bodyType && bodyContent[bodyType].schema;
    const responses = Object.entries(op.responses ?? {})
      .map(([status, r]) => {
        const content = r.content && Object.values(r.content)[0];
        const sch = content?.schema;
        return {
          status,
          description: r.description === "Successful Response" ? "성공" : r.description === "Validation Error" ? "요청 형식 오류" : r.description,
          schema: sch ? (refName(sch) ?? typeOf(sch)) : null,
          example: sch ? example(sch) : null,
        };
      });
    (groups[tag] ??= []).push({
      method: method.toUpperCase(),
      path,
      summary: op.summary ?? "",
      description: op.description ?? "",
      auth: !!op.security,
      params,
      body: bodySchema
        ? { contentType: bodyType, schema: refName(bodySchema) ?? "object", fields: fields(bodySchema), example: example(bodySchema), required: !!op.requestBody.required }
        : null,
      responses,
    });
  }
}

const out = {
  title: spec.info.title,
  version: spec.info.version,
  generatedFrom: url,
  groups: Object.entries(groups).map(([tag, endpoints]) => ({ tag, title: GROUP_TITLE[tag] ?? tag, endpoints })),
};
writeFileSync(new URL("../src/meerkit/docs/api-spec.json", import.meta.url), JSON.stringify(out, null, 2) + "\n");
console.log(`${out.groups.reduce((n, g) => n + g.endpoints.length, 0)}개 엔드포인트, ${out.groups.length}개 묶음`);
