import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { docContent } from "./content";
import { IndexingContext } from "./indexing";
import { docGroups } from "./nav";

export interface SearchEntry {
  slug: string;
  title: string;
  group: string;
  description: string;
  headings: { id: string; text: string }[];
  text: string;
}

let cache: Promise<SearchEntry[]> | null = null;

// 문서 본문은 컴포넌트라서, 화면 밖에서 한 번씩 렌더링해 텍스트와 제목을 뽑아 인덱스를 만든다.
// 한 페이지가 실패해도 나머지 검색은 되도록 페이지별로 오류를 가둔다.
function build(): SearchEntry[] {
  const client = new QueryClient();
  const entries: SearchEntry[] = [];
  for (const group of docGroups) {
    for (const doc of group.items) {
      const host = document.createElement("div");
      const root = createRoot(host);
      try {
        const Content = docContent[doc.slug];
        flushSync(() =>
          root.render(createElement(IndexingContext.Provider, { value: true }, createElement(QueryClientProvider, { client }, createElement(Content)))),
        );
        const headings = Array.from(host.querySelectorAll<HTMLElement>("h2[id]")).map((el) => ({ id: el.id, text: el.textContent ?? "" }));
        // 표 셀 등이 붙어 버리지 않도록 텍스트 노드 사이에 공백을 넣는다.
        const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
        const parts: string[] = [];
        for (let n = walker.nextNode(); n; n = walker.nextNode()) parts.push(n.textContent ?? "");
        const text = parts.join(" ").replace(/\s+/g, " ").trim();
        entries.push({ slug: doc.slug, title: doc.title, group: group.label, description: doc.description, headings, text });
      } catch (error) {
        console.error(`[docs search] "${doc.slug}" 페이지를 인덱싱하지 못했습니다.`, error);
        // 본문은 못 읽어도 제목과 설명으로는 찾을 수 있게 한다
        entries.push({ slug: doc.slug, title: doc.title, group: group.label, description: doc.description, headings: [], text: "" });
      } finally {
        root.unmount();
      }
    }
  }
  return entries;
}

export function loadSearchIndex(): Promise<SearchEntry[]> {
  // 렌더가 끝난 다음 프레임에서 만들어 화면이 멈추지 않게 한다.
  cache ??= new Promise((resolve, reject) =>
    setTimeout(() => {
      try {
        resolve(build());
      } catch (error) {
        reject(error);
      }
    }, 0),
  );
  return cache;
}

export interface SearchHit {
  entry: SearchEntry;
  score: number;
  heading?: { id: string; text: string };
  snippet: string;
}

const norm = (s: string) => s.toLowerCase();

export function search(entries: SearchEntry[], query: string): SearchHit[] {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const hits: SearchHit[] = [];
  for (const entry of entries) {
    const title = norm(entry.title);
    const desc = norm(entry.description);
    const body = norm(entry.text);
    const headTexts = entry.headings.map((h) => norm(h.text));

    // 모든 검색어가 어딘가에 있어야 결과에 나온다.
    if (!tokens.every((t) => title.includes(t) || desc.includes(t) || body.includes(t) || headTexts.some((h) => h.includes(t)))) continue;

    let score = 0;
    for (const t of tokens) {
      if (title.includes(t)) score += 20;
      if (headTexts.some((h) => h.includes(t))) score += 8;
      if (desc.includes(t)) score += 4;
      score += Math.min(body.split(t).length - 1, 10);
    }

    const heading = entry.headings.find((h) => tokens.some((t) => norm(h.text).includes(t)));
    const at = Math.max(0, body.indexOf(tokens.find((t) => body.includes(t)) ?? ""));
    const start = Math.max(0, at - 40);
    const snippet = (start > 0 ? "…" : "") + entry.text.slice(start, start + 150) + (start + 150 < entry.text.length ? "…" : "");
    hits.push({ entry, score, heading, snippet });
  }
  return hits.sort((a, b) => b.score - a.score);
}
