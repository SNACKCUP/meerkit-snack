import { ArrowUpRight } from "lucide-react";

import { meerkitConfig } from "../config";

// 문서 사이트 전용 푸터. 킷 컴포넌트가 아니므로 설정(meerkit.config.ts)과 공개 API에는 노출하지 않는다.
export function DocsFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-6 py-6 text-[13px] text-muted-foreground">
        <span>© Meerkit. All rights reserved.</span>
        <a href={meerkitConfig.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 transition-colors hover:text-foreground">
          GitHub <ArrowUpRight className="size-3" />
        </a>
      </div>
    </footer>
  );
}
