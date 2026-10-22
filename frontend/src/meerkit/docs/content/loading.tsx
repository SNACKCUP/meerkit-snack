"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LOADER_SIZES, LOADER_VARIANTS, Loader, LoadingOverlay, LoadingState, useDelayedLoading, type LoaderSize, type LoaderVariant } from "../../loading";
import { cn } from "@/lib/utils";
import { CodeBlock, DocTable, H2, H3, Ic, P, Preview, PropsTable, UL } from "../ui";

function OverlayDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <div className="grid gap-3">
      <LoadingOverlay loading={loading}>
        <div className="grid gap-2 rounded-xl border p-4 text-sm">
          {["김미어 · MASTER", "이캣 · OWNER", "박서 · VIEWER"].map((row) => (
            <div key={row} className="rounded-lg bg-muted/60 px-3 py-2">{row}</div>
          ))}
        </div>
      </LoadingOverlay>
      <Button size="sm" variant="outline" disabled={loading} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1800); }}>
        다시 불러오기
      </Button>
    </div>
  );
}

function DelayedDemo() {
  const [loading, setLoading] = useState(false);
  const [ms, setMs] = useState(100);
  const show = useDelayedLoading(loading);
  return (
    <div className="grid gap-3">
      <div className="grid min-h-16 place-items-center rounded-xl border text-sm text-muted-foreground">
        {show ? <LoadingState layout="inline" size="sm" /> : loading ? "(250ms 안에 끝나면 로더를 보여 주지 않아요)" : "대기 중"}
      </div>
      <div className="flex flex-wrap gap-2">
        {[100, 1500].map((v) => (
          <Button key={v} size="sm" variant="outline" disabled={loading} onClick={() => { setMs(v); setLoading(true); setTimeout(() => setLoading(false), v); }}>
            {v}ms 걸리는 요청{ms === v && loading ? "…" : ""}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function LoadingDoc() {
  const [size, setSize] = useState<LoaderSize>("lg");
  const [picked, setPicked] = useState<LoaderVariant>("ring");
  return (
    <>
      <P>
        <strong>&quot;불러오는 중&quot;을 보여 주는 공통 모듈</strong>입니다. 서로 다른 스타일의 로더 9종(<Ic>Loader</Ic>)과, 화면 곳곳에 같은 방식으로 끼워 넣는
        <Ic>LoadingState</Ic>·<Ic>LoadingOverlay</Ic>·<Ic>Skeleton</Ic>·<Ic>useDelayedLoading</Ic>으로 이루어져 있습니다.
        킷 안의 모든 로딩 화면이 이 모듈을 쓰기 때문에, <Ic>meerkit.config.ts</Ic>에서 한 줄만 바꾸면 서비스 전체의 로딩 모양이 바뀝니다.
      </P>

      <H2>Variants</H2>
      <P>9가지 스타일입니다. 색은 주변 글자색을 따라가고, 모두 부드럽게 반복됩니다. 눌러서 고르면 아래 미리보기에 적용됩니다.</P>
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(LOADER_SIZES) as LoaderSize[]).map((s) => (
          <Button key={s} size="sm" variant={size === s ? "default" : "outline"} onClick={() => setSize(s)}>{s}</Button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {LOADER_VARIANTS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setPicked(v.id)}
            aria-pressed={picked === v.id}
            className={cn("grid justify-items-center gap-3 rounded-2xl border bg-card p-5 transition-colors hover:bg-muted/60", picked === v.id && "border-foreground/40 bg-muted/60")}
          >
            <span className="grid h-16 place-items-center text-foreground"><Loader variant={v.id} size={size} /></span>
            <span className="text-center">
              <span className="block text-sm font-medium">{v.label}</span>
              <span className="block font-mono text-[11px] text-muted-foreground">{v.id}</span>
            </span>
          </button>
        ))}
      </div>
      <P>{LOADER_VARIANTS.find((v) => v.id === picked)?.hint}.</P>
      <CodeBlock title="tsx" code={`<Loader variant="${picked}" size="${size}" />`} />

      <H2>Loader</H2>
      <P>가장 작은 단위입니다. 글자 옆, 버튼 안, 카드 한가운데 어디든 놓을 수 있습니다. 화면에는 보이지 않는 문구가 필요하면 <Ic>label</Ic>을 주세요.</P>
      <Preview code={`<Loader />                                  // config의 기본 모양\n<Loader variant="dots" size="sm" />\n<Loader variant="spokes" size="xl" label="저장하는 중" />`}>
        <div className="flex items-center justify-center gap-6 text-foreground">
          <Loader />
          <Loader variant="dots" size="sm" />
          <Loader variant="spokes" size="xl" label="저장하는 중" />
        </div>
      </Preview>
      <PropsTable
        rows={[
          ["variant", '"ring" | "dash" | "dots" | "bars" | "pulse" | "spokes" | "grid" | "progress" | "morph"', "모양. 생략하면 config의 loading.variant."],
          ["size", '"sm" | "md" | "lg" | "xl"', "16 / 24 / 40 / 56px. 기본 md."],
          ["label", "string", "스크린리더용 문구. 있으면 role=status로 읽힙니다. 글자가 따로 있으면 생략하세요."],
          ["className", "string", "색은 text-* 클래스로 바꿉니다. 예: text-primary"],
        ]}
      />

      <H2>LoadingState</H2>
      <P>
        &quot;불러오는 중…&quot; 문구를 쓰던 자리에 그대로 넣는 블록입니다. 로더와 문구를 함께 보여 주고, 접근성 속성도 갖고 있습니다.
        <Ic>minHeight</Ic>를 주면 로딩이 끝나고 내용이 들어올 때 화면이 덜 흔들립니다.
      </P>
      <Preview code={`<LoadingState />\n<LoadingState label="멤버를 불러오는 중…" minHeight={160} />\n<LoadingState layout="inline" size="sm" />`}>
        <div className="grid gap-6">
          <LoadingState minHeight={96} />
          <LoadingState layout="inline" size="sm" label="저장하는 중…" />
        </div>
      </Preview>
      <PropsTable
        rows={[
          ["label", "string | false", '문구. 기본 "불러오는 중…". false면 로더만 보이고 스크린리더에는 읽힙니다.'],
          ["layout", '"stack" | "inline"', "문구 위치. 기본 stack(아래), inline이면 옆."],
          ["fullPage", "boolean", "화면 한가운데 큰 영역을 차지합니다. 페이지 전체를 기다릴 때."],
          ["minHeight", "number | string", "영역의 최소 높이."],
          ["variant / size", "Loader와 동일", "생략하면 config와 md."],
        ]}
      />

      <H2>LoadingOverlay</H2>
      <P>이미 보이는 내용 위에 로더를 덮습니다. 목록을 다시 불러올 때 화면이 비지 않고, 내용이 살짝 흐려지며 로더가 나타납니다. 관리자 멤버 목록이 이 방식을 씁니다.</P>
      <Preview code={`<LoadingOverlay loading={isFetching}>\n  <MemberTable ... />\n</LoadingOverlay>`}>
        <OverlayDemo />
      </Preview>

      <H2>Skeleton</H2>
      <P>내용이 들어올 자리를 미리 잡아 두는 회색 블록입니다. 레이아웃이 정해진 카드나 목록에 어울립니다.</P>
      <Preview code={`<div className="flex items-center gap-3">\n  <Skeleton className="size-10 rounded-full" />\n  <div className="grid flex-1 gap-2">\n    <Skeleton className="h-3 w-1/2" />\n    <Skeleton className="h-3 w-3/4" />\n  </div>\n</div>`}>
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </Preview>

      <H2>useDelayedLoading</H2>
      <P>
        응답이 빨라도 로더가 번쩍 나타났다 사라지면 오히려 어수선합니다. 이 훅은 <strong>250ms 안에 끝나면 아예 보여 주지 않고</strong>, 한 번 보였다면 <strong>최소 450ms는 유지</strong>합니다.
      </P>
      <Preview code={`const show = useDelayedLoading(isLoading); // { delay: 250, minDuration: 450 }\nreturn show ? <LoadingState /> : <List />;`}>
        <DelayedDemo />
      </Preview>

      <H2>Use it in your pages</H2>
      <H3>데이터를 불러오는 화면</H3>
      <CodeBlock title="tsx" code={`const { data, isLoading } = useQuery({ ... });\n\nif (isLoading) return <LoadingState minHeight={240} />;\nreturn <List items={data} />;`} />
      <H3>Next.js loading.tsx · Suspense</H3>
      <CodeBlock title="tsx" code={`// app/dashboard/loading.tsx\nimport { LoadingState } from "@/meerkit";\n\nexport default function Loading() {\n  return <LoadingState fullPage />;\n}\n\n// 또는 일부분만\n<Suspense fallback={<LoadingState minHeight={160} />}>\n  <Chart />\n</Suspense>`} />
      <H3>버튼 안에서</H3>
      <CodeBlock title="tsx" code={`<Button disabled={pending}>\n  {pending && <Loader variant="ring" size="sm" />}\n  {pending ? "저장 중…" : "저장"}\n</Button>`} />

      <H2>Config</H2>
      <P>서비스 전체의 기본 모양을 한 곳에서 정합니다. 킷 안의 로딩 화면(로그인 확인, 멤버 목록, 사용량, 주소 검색 등)이 모두 따라갑니다.</P>
      <CodeBlock title="meerkit.config.ts" code={`export default defineMeerkitConfig({\n  loading: { variant: "dots" }, // 기본 "ring"\n});`} />

      <H2>Where the kit uses it</H2>
      <DocTable
        head={["위치", "사용"]}
        rows={[
          ["RequireAuth · RequireRole", "로그인·권한 확인 중 (fullPage)"],
          ["MemberDirectory", "처음 불러올 때 LoadingState, 다시 불러올 때 LoadingOverlay"],
          ["Member AI Usage · Usage History", "차트 자리에 LoadingState"],
          ["Address Search Dialog", "검색 중 · 더 보기 불러오는 중"],
        ]}
      />

      <H2>Accessibility &amp; motion</H2>
      <UL>
        <li>로더 자체는 장식이라 스크린리더에서 숨겨지고, <Ic>LoadingState</Ic>와 <Ic>LoadingOverlay</Ic>가 <Ic>role=&quot;status&quot;</Ic>로 &quot;불러오는 중&quot;을 알립니다.</li>
        <li>순수 CSS 애니메이션이라 가볍고, 설정의 움직임 끄기와 OS의 &quot;동작 줄이기&quot;를 지키면 멈춘 모양으로 보입니다.</li>
        <li>색은 글자색을 따르므로 라이트·다크 모드에서 따로 손볼 필요가 없습니다.</li>
      </UL>
    </>
  );
}
