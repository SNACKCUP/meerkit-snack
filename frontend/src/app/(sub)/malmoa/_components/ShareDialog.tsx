"use client";

import { useState } from "react";

import { SHARE_DAYS, useMalmoa } from "../_lib/store";
import { formatWhen } from "../_lib/format";
import { CopyButton } from "./CopyButton";
import { PxButton, PxDialog } from "./px";

// 회의록 공유: 링크가 있는 사람은 로그인 없이 읽을 수 있다(읽기 전용). 끄면 바로 막힌다.
export function ShareDialog({ meetingId, open, onOpenChange }: { meetingId: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const share = useMalmoa((s) => s.shares[meetingId]);
  const create = useMalmoa((s) => s.createShare);
  const revoke = useMalmoa((s) => s.revokeShare);
  const [now] = useState(() => Date.now()); // 화면을 연 시각 기준으로 기간을 판단한다
  const active = share && !share.revoked && new Date(share.expiresAt).getTime() > now;
  const url = share ? `${typeof window === "undefined" ? "" : window.location.origin}/malmoa/s/${share.token}` : "";

  return (
    <PxDialog open={open} onOpenChange={onOpenChange} title="회의록 공유" description={`링크를 받은 사람은 로그인 없이 읽을 수 있고, ${SHARE_DAYS}일 뒤에 자동으로 닫힙니다.`}>
      {active ? (
        <div className="grid gap-3">
          <input readOnly aria-label="공유 링크" value={url} onFocus={(e) => e.currentTarget.select()} className="h-10 w-full border-[3px] border-border bg-(--mk-px-edge) px-3 text-sm outline-none focus-visible:border-(--mk-sky)" />
          <p className="text-sm text-muted-foreground">{formatWhen(share.expiresAt)}까지 열려 있어요. 읽기만 할 수 있고, 회의록을 고칠 수는 없습니다.</p>
          <p className="text-xs text-muted-foreground">지금은 화면용 목 데이터라 이 브라우저에서만 열립니다.</p>
          <div className="flex flex-wrap gap-3">
            <CopyButton variant="mint" text={() => url}>링크 복사</CopyButton>
            <PxButton variant="pink" onClick={() => revoke(meetingId)}>공유 끄기</PxButton>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          <p>{share ? "공유가 꺼져 있거나 기간이 끝났어요." : "아직 공유하지 않은 회의록입니다."}</p>
          <PxButton onClick={() => create(meetingId)}>{share ? "공유 다시 켜기" : "공유 링크 만들기 (+10 EXP)"}</PxButton>
        </div>
      )}
    </PxDialog>
  );
}
