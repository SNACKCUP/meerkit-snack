"use client";

import { useState } from "react";

import { Calendar, DatePicker, DateRangeLinked, DateRangePicker } from "../../date";
import { Callout, H2, Ic, P, Preview, PropsTable } from "../ui";

function Demo() {
  const [one, setOne] = useState("");
  const [cal, setCal] = useState("");
  const [linked, setLinked] = useState({ start: "", end: "" });
  const [range, setRange] = useState({ start: "", end: "" });
  return (
    <div className="grid gap-8">
      <div className="grid gap-2"><p className="text-xs text-muted-foreground">Calendar</p><Calendar value={cal} onSelect={setCal} /></div>
      <div className="grid max-w-xs gap-2"><p className="text-xs text-muted-foreground">DatePicker</p><DatePicker value={one} onChange={setOne} /></div>
      <div className="grid max-w-md gap-2"><p className="text-xs text-muted-foreground">DateRangeLinked</p><DateRangeLinked start={linked.start} end={linked.end} onChange={setLinked} /></div>
      <div className="grid max-w-sm gap-2"><p className="text-xs text-muted-foreground">DateRangePicker</p><DateRangePicker value={range} onChange={setRange} /></div>
    </div>
  );
}

export function DateDoc() {
  return (
    <>
      <P>
        날짜를 고르는 입력 부품 4종입니다. 날짜는 모두 <Ic>&quot;2026-10-26&quot;</Ic> 같은 글자로 주고받아서, 시간대 때문에 하루가 밀리지 않습니다.
      </P>
      <H2>미리보기</H2>
      <Preview code={`<Calendar value={v} onSelect={setV} />\n<DatePicker value={v} onChange={setV} />\n<DateRangeLinked start={s} end={e} onChange={({ start, end }) => ... } />\n<DateRangePicker value={{ start, end }} onChange={setRange} />`}>
        <Demo />
      </Preview>
      <H2>Calendar</H2>
      <P>가장 기본이 되는 달력입니다. 나머지 부품이 모두 이 달력을 씁니다.</P>
      <PropsTable
        rows={[
          ["value", "string", "선택된 날짜(YYYY-MM-DD)."],
          ["onSelect", "(date: string) => void", "날짜를 누르면 호출됩니다.", true],
          ["min / max", "string", "이 범위 밖의 날짜는 고를 수 없습니다."],
          ["range", "{ start?: string; end?: string }", "범위를 칠합니다."],
          ["months", "1 | 2", "달을 나란히 몇 개 보여 줄지. 기본 1."],
        ]}
      />
      <H2>DatePicker</H2>
      <P>입력 칸처럼 생긴 버튼을 누르면 달력이 열리고, 날짜를 고르면 닫힙니다. <Ic>min</Ic>, <Ic>max</Ic>, <Ic>disabled</Ic>, <Ic>placeholder</Ic>를 쓸 수 있습니다.</P>
      <H2>DateRangeLinked</H2>
      <P>시작일과 종료일을 따로 고르되 서로 묶여 있습니다. 종료일은 시작일 이후만 고를 수 있고, 시작일을 종료일보다 늦게 바꾸면 종료일이 비워집니다.</P>
      <H2>DateRangePicker</H2>
      <P>한 입력에서 기간을 고릅니다. 첫 번째 클릭이 시작일, 두 번째 클릭이 종료일이며 고르는 동안 범위가 미리 칠해집니다.</P>
      <Callout>폼 안에서 쓸 때는 <Ic>aria-label</Ic>이나 <Ic>id</Ic>를 주어 라벨과 연결하세요.</Callout>
    </>
  );
}
