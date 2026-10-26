"use client";

// 클립보드 복사. navigator.clipboard가 막히면 예비 방법(execCommand)을 쓴다.
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      ta.remove();
    }
  }
}

export function downloadText(fileName: string, text: string, mime = "text/plain") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }));
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// 마크다운 기호를 걷어 낸 순수 텍스트
export const markdownToPlain = (md: string) => md.replace(/^#{1,6}\s+/gm, "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/^- /gm, "· ");
