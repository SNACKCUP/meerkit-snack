import type { ReactNode } from "react";

// 회의록 전용 아주 작은 마크다운 표시기: 제목, 목록, 굵게, '확인 필요' 강조만 지원한다.
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|확인 필요)/g).map((part, i) => {
    if (part === "확인 필요") return <mark key={i} className="bg-(--mk-pink) px-1 font-bold text-(--mk-ink)">확인 필요</mark>;
    if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2) === "확인 필요" ? <mark className="bg-(--mk-pink) px-1 text-(--mk-ink)">확인 필요</mark> : part.slice(2, -2)}</strong>;
    return part;
  });
}

export function MarkdownView({ markdown }: { markdown: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) blocks.push(<ul key={`l${blocks.length}`} className="list-disc space-y-1 pl-6">{list.map((t, i) => <li key={i}>{inline(t)}</li>)}</ul>);
    list = [];
  };
  for (const line of markdown.split("\n")) {
    if (line.startsWith("- ")) { list.push(line.slice(2)); continue; }
    flush();
    if (line.startsWith("# ")) blocks.push(<h2 key={blocks.length} className="font-pixel text-3xl">{inline(line.slice(2))}</h2>);
    else if (line.startsWith("## ")) blocks.push(<h3 key={blocks.length} className="font-pixel mt-4 border-b-2 border-(--mk-px-edge) pb-1 text-xl">{inline(line.slice(3))}</h3>);
    else if (line.trim()) blocks.push(<p key={blocks.length}>{inline(line)}</p>);
  }
  flush();
  return <div className="grid gap-2 leading-relaxed">{blocks}</div>;
}
