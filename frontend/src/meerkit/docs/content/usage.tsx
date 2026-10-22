"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { MemberAiUsage } from "../../admin/components/MemberAiUsage";
import { MemberAiUsageHistory } from "../../admin/components/MemberAiUsageHistory";
import type { UsagePeriod } from "../../admin/usage-status";
import { Callout, CodeBlock, DocLinks, DocTable, H2, Ic, links, P, Preview, PreviewWide, PropsTable, UL } from "../ui";
import { mockUsage, mockUsageHistory, mockUsers } from "./mock";

function StatusNotice() {
  return (
    <Callout>
      <strong>현재 프론트 UI만 작업된 상태입니다.</strong> 사용량을 실제로 기록하고 집계하는 기능(서버)은 <strong>추후 적용 예정</strong>이며, 이 페이지의 미리보기는 목 데이터입니다.
      서버가 준비되면 같은 모양의 데이터를 <Ic>props</Ic>로 넘기기만 하면 화면은 그대로 쓸 수 있습니다.
    </Callout>
  );
}

/* ─────────────────────────── Member AI Usage (Radial) ─────────────────────────── */

export function MemberAiUsageDoc() {
  const [level, setLevel] = useState<keyof typeof mockUsage>("warn");
  const member = mockUsers[1];
  return (
    <>
      <DocLinks items={[links.component("chart", "Chart"), links.component("card", "Card")]} />
      <P>
        관리자가 한 멤버의 <strong>AI 사용량을 한눈에 확인</strong>하는 컴포넌트입니다. 이번 주기에 허용량 중 얼마나 썼는지를 <strong>원형(Radial) 차트</strong>로 보여 주고, 가운데에 사용 비율, 아래에 사용량·남은 양·상태·초기화까지 남은 날을 함께 나타냅니다.
      </P>
      <StatusNotice />

      <H2>Preview</H2>
      <P>아래 버튼으로 사용 상태를 바꿔 보세요. 차트는 값이 바뀔 때 부드럽게 채워집니다.</P>
      <div className="flex flex-wrap gap-2">
        {([
          ["ok", "여유 (32%)"],
          ["warn", "주의 (81%)"],
          ["danger", "한도 임박 (97%)"],
          ["unlimited", "제한 없음"],
        ] as const).map(([k, label]) => (
          <Button key={k} size="sm" variant={level === k ? "default" : "outline"} onClick={() => setLevel(k)}>{label}</Button>
        ))}
      </div>
      <Preview code={`<MemberAiUsage\n  member={member}\n  usage={{ used: 8100, limit: 10000, unit: "토큰", resetAt: "2026-11-01T00:00:00Z" }}\n/>`}>
        <div className="flex justify-center">
          <MemberAiUsage member={member} usage={mockUsage[level]} />
        </div>
      </Preview>

      <H2>What admins can see</H2>
      <DocTable
        head={["항목", "내용"]}
        rows={[
          ["원형 차트", "허용량 대비 사용 비율. 12시 방향에서 시계 방향으로 채워집니다."],
          ["가운데 숫자", "사용 비율(%). 허용량이 없으면(제한 없음) 사용한 양을 보여 줍니다."],
          ["사용량", "사용한 양 / 허용량 (단위 포함)"],
          ["남은 양", "허용량에서 쓴 양을 뺀 값. 제한이 없으면 표시하지 않습니다."],
          ["상태", "여유 / 주의 / 한도 임박 / 제한 없음 배지"],
          ["초기화", "사용량이 0으로 돌아오기까지 남은 날. 오늘이면 \"오늘\""],
          ["멤버 머리말", "멤버를 넘기면 아바타, 이름(닉네임 우선), 아이디, 역할이 위에 나옵니다."],
        ]}
      />

      <H2>Status colors</H2>
      <P>사용 비율에 따라 차트 색과 상태가 자동으로 바뀝니다.</P>
      <DocTable
        head={["사용 비율", "상태", "차트 색"]}
        rows={[
          ["70% 미만", "여유", "포인트 블루"],
          ["70% 이상 ~ 90% 미만", "주의", "미어캣 갈색"],
          ["90% 이상", "한도 임박", "빨강"],
        ]}
      />
      <UL>
        <li>색 기준은 <Ic>admin/usage-status.ts</Ic>의 <Ic>usageLevel</Ic> 한 곳에서 바꿉니다.</li>
        <li>사용량이 허용량을 넘어도 차트는 100%에서 멈추고, 숫자(사용량)는 실제 값을 그대로 보여 줍니다.</li>
      </UL>

      <H2>Other states</H2>
      <div className="grid justify-items-center gap-4 sm:grid-cols-2">
        <MemberAiUsage usage={undefined} />
        <MemberAiUsage usage={undefined} loading />
      </div>
      <UL>
        <li><strong>정보 없음:</strong> <Ic>usage</Ic>가 없으면 &quot;사용량 정보가 없습니다&quot;(아직 사용하지 않았거나 집계 전)를 보여 줍니다.</li>
        <li><strong>불러오는 중:</strong> <Ic>loading</Ic>이 true이면 &quot;불러오는 중…&quot;을 보여 줍니다.</li>
      </UL>

      <H2>Data shape</H2>
      <CodeBlock title="tsx" code={`interface AiUsage {\n  used: number;          // 사용한 양\n  limit: number | null;  // 허용량. null이면 제한 없음\n  unit?: string;         // "토큰", "회" 등. 기본 "회"\n  resetAt?: string;      // 초기화 시각(ISO). 있으면 "N일 뒤"를 보여 줌\n}`} />

      <H2>Props</H2>
      <PropsTable
        rows={[
          ["usage", "AiUsage | null | undefined", "표시할 사용량. 없으면 \"정보 없음\"을 보여 줍니다.", true],
          ["member", "User (일부)", "머리말에 보여 줄 멤버. 없으면 차트만 나옵니다."],
          ["loading", "boolean", "true이면 불러오는 중 표시."],
          ["className", "string", "추가 클래스. 기본 최대 너비는 24rem."],
        ]}
      />

      <H2>Accessibility</H2>
      <UL>
        <li>차트에 <Ic>role=&quot;img&quot;</Ic>와 &quot;AI 사용량 62%&quot; 같은 설명이 있고, 같은 내용이 글(사용량, 남은 양, 상태)로도 함께 나와 색에만 의존하지 않습니다.</li>
        <li>상태는 색뿐 아니라 &quot;여유 / 주의 / 한도 임박&quot; 글자 배지로도 알려 줍니다.</li>
      </UL>
    </>
  );
}

/* ─────────────────────────── Member AI Usage History (Bar) ─────────────────────────── */

export function MemberAiUsageHistoryDoc() {
  const [last, setLast] = useState<UsagePeriod>("day");
  return (
    <>
      <DocLinks items={[links.component("chart", "Chart"), links.component("tabs", "Tabs")]} />
      <P>
        관리자가 한 멤버의 AI 사용량을 <strong>기간별로 비교</strong>하는 컴포넌트입니다. <strong>일별 / 주별 / 월별</strong> 탭으로 바꿔 가며 <strong>막대(Bar) 차트</strong>로 보고, 위에 합계·평균·최대 요약이 함께 나옵니다.
      </P>
      <StatusNotice />

      <H2>Preview</H2>
      <P>탭을 눌러 기간을 바꾸고, 막대에 마우스를 올려 값을 확인해 보세요.</P>
      <PreviewWide code={`<MemberAiUsageHistory\n  data={{ day: dayPoints, week: weekPoints, month: monthPoints }}\n  description="김관리 · 최근 사용량"\n  unit="토큰"\n  onPeriodChange={(period) => load(period)}\n/>`}>
        <div className="p-2">
          <MemberAiUsageHistory data={mockUsageHistory} description="이작성 · 최근 사용량" unit="토큰" onPeriodChange={setLast} />
        </div>
      </PreviewWide>
      <p className="text-xs text-muted-foreground">마지막으로 고른 기간: <code className="font-mono">{last}</code></p>

      <H2>What admins can see</H2>
      <DocTable
        head={["항목", "내용"]}
        rows={[
          ["기간 탭", "일별 / 주별 / 월별. 데이터가 있는 기간만 탭으로 나타납니다."],
          ["합계", "선택한 기간 전체의 사용량 합"],
          ["평균", "막대 하나(하루/한 주/한 달)의 평균"],
          ["최대", "가장 많이 쓴 시점과 그 값"],
          ["막대 차트", "시점별 사용량. 위쪽 모서리가 둥글고, 마우스를 올리면 값이 말풍선으로 나옵니다."],
        ]}
      />
      <UL>
        <li>막대는 처음 나타날 때와 기간을 바꿀 때 부드럽게 자랍니다.</li>
        <li>단위(<Ic>unit</Ic>)는 합계, 평균, 말풍선에 함께 붙습니다.</li>
      </UL>

      <H2>Data shape</H2>
      <P>기간 단위별로 <Ic>{"{ label, value }"}</Ic> 배열을 넘깁니다. 가로축 이름(<Ic>label</Ic>)은 서버가 정한 그대로 보여 줍니다.</P>
      <CodeBlock title="tsx" code={`const data = {\n  day:   [{ label: "10/07", value: 120 }, { label: "10/08", value: 340 }, ...],\n  week:  [{ label: "1주", value: 1800 }, { label: "2주", value: 2400 }, ...],\n  month: [{ label: "5월", value: 6200 }, { label: "6월", value: 7800 }, ...],\n};\n\n<MemberAiUsageHistory data={data} unit="토큰" />`} />
      <UL>
        <li>세 기간을 모두 줄 필요는 없습니다. 예를 들어 <Ic>{"{ month: [...] }"}</Ic>만 주면 탭 없이 월별 차트만 보입니다.</li>
        <li>탭을 누를 때 서버에서 해당 기간 데이터를 가져오려면 <Ic>onPeriodChange</Ic>에서 요청하고, 그동안 <Ic>loading</Ic>을 켜세요.</li>
      </UL>

      <H2>Other states</H2>
      <div className="grid justify-items-center gap-4">
        <MemberAiUsageHistory data={{ day: [] }} description="데이터가 없는 경우" />
      </div>

      <H2>Props</H2>
      <PropsTable
        rows={[
          ["data", "{ day?, week?, month? }: UsagePoint[]", "기간 단위별 사용량. 있는 기간만 탭으로 나옵니다.", true],
          ["description", "string", "제목 아래 설명. 보통 멤버 이름을 적습니다."],
          ["unit", "string", "단위. 기본 \"회\"."],
          ["defaultPeriod", '"day" | "week" | "month"', "처음 보여 줄 기간. 기본 day."],
          ["onPeriodChange", "(period) => void", "기간 탭이 바뀔 때 호출합니다."],
          ["loading", "boolean", "true이면 차트 자리에 불러오는 중 표시."],
          ["className", "string", "추가 클래스."],
        ]}
      />

      <H2>Accessibility</H2>
      <UL>
        <li>차트에 <Ic>role=&quot;img&quot;</Ic>와 기간·합계를 알려 주는 설명이 있고, 같은 수치가 합계·평균·최대 글자로도 나옵니다.</li>
        <li>기간 탭은 Radix Tabs라 키보드(방향키)로 이동할 수 있습니다.</li>
      </UL>
    </>
  );
}
