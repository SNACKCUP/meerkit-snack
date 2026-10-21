"use client";

import { ShieldAlert, TriangleAlert } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

import { UserAvatar, displayName } from "../../auth/components/UserAvatar";
import { ADMIN_ROLE, ROLES } from "../../roles";
import type { User } from "../../types";

interface RoleAssignDialogProps {
  /** 역할을 바꿀 사용자. null이면 열려 있어도 아무것도 그리지 않는다 */
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 새 역할의 id를 전달한다. 확인을 누르면 호출되고 모달은 닫힌다 */
  onSubmit: (roleId: number) => void;
  pending?: boolean;
  /** 지금 로그인한 관리자의 id. 자기 자신의 권한을 낮추는 것을 경고하는 데 쓴다 */
  currentUserId?: number;
}

const CRUD = [
  ["C", "Create(생성)"],
  ["R", "Read(조회)"],
  ["U", "Update(수정)"],
  ["D", "Delete(삭제)"],
] as const;

function CrudChips({ crud }: { crud: string }) {
  return (
    <span className="flex gap-1" aria-label={`권한 ${crud}`}>
      {CRUD.map(([letter, title]) => (
        <span
          key={letter}
          title={title}
          className={cn(
            "flex size-5 items-center justify-center rounded-md font-mono text-[10px] font-semibold transition-colors",
            crud.includes(letter) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground/60",
          )}
        >
          {letter}
        </span>
      ))}
    </span>
  );
}

// 관리자가 한 사용자에게 역할(권한)을 부여하거나 바꾸는 확인 창.
// 역할마다 무엇을 할 수 있는지 보여 주고, 위험한 변경은 확인 전에 경고한다.
function Body({ user, onOpenChange, onSubmit, pending, currentUserId }: Omit<RoleAssignDialogProps, "open" | "user"> & { user: User }) {
  const [roleId, setRoleId] = useState(user.role.id);
  const current = ROLES.find((r) => r.id === user.role.id);
  const next = ROLES.find((r) => r.id === roleId);
  const adminId = ROLES.find((r) => r.name === ADMIN_ROLE)!.id;
  const changed = roleId !== user.role.id;
  const demotesSelf = user.id === currentUserId && user.role.id === adminId && roleId !== adminId;
  const grantsAdmin = roleId === adminId && user.role.id !== adminId;

  return (
    <>
      <DialogHeader>
        <DialogTitle>역할 변경</DialogTitle>
        <DialogDescription>이 사용자에게 부여할 역할을 선택하세요. 역할에 따라 할 수 있는 일이 달라집니다.</DialogDescription>
      </DialogHeader>

      <div className="flex items-center gap-3 rounded-2xl border bg-card p-3">
        <UserAvatar user={user} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{displayName(user)}</p>
          <p className="truncate text-xs text-muted-foreground">{user.user_id} · {user.email}</p>
        </div>
        <Badge variant="outline">{user.role.name}</Badge>
      </div>

      <RadioGroup value={String(roleId)} onValueChange={(v) => setRoleId(Number(v))} className="gap-2">
        {ROLES.map((r) => (
          <label
            key={r.id}
            htmlFor={`role-${r.id}`}
            className="flex cursor-pointer items-center gap-3 rounded-2xl border bg-card p-3 transition-all duration-200 hover:bg-surface has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-surface has-[[data-state=checked]]:shadow-soft"
          >
            <RadioGroupItem id={`role-${r.id}`} value={String(r.id)} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-medium">
                {r.name}
                {r.id === user.role.id && <span className="text-[11px] font-normal text-muted-foreground">현재</span>}
              </p>
              <p className="text-xs text-muted-foreground">{r.description}</p>
            </div>
            <CrudChips crud={r.crud} />
          </label>
        ))}
      </RadioGroup>

      {changed && (
        <div className="mk-swap flex items-center justify-center gap-2 text-sm">
          <Badge variant="secondary">{current?.name}</Badge>
          <span className="text-muted-foreground">→</span>
          <Badge variant="brand">{next?.name}</Badge>
        </div>
      )}
      {demotesSelf && (
        <div role="alert" className="mk-swap flex gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-3 text-[13px] leading-5">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p>
            <strong className="text-destructive">본인의 관리자 권한을 내리려 하고 있습니다.</strong> 변경하면 이 화면에 더 이상 접근할 수 없고, 다시 올리려면 다른 관리자가 필요합니다.
          </p>
        </div>
      )}
      {grantsAdmin && !demotesSelf && (
        <div className="mk-swap flex gap-3 rounded-2xl border bg-surface p-3 text-[13px] leading-5 shadow-soft">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-brand" />
          <p><strong>{ADMIN_ROLE}</strong>는 모든 사용자와 데이터를 관리할 수 있습니다. 꼭 필요한 사람에게만 부여하세요.</p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>취소</Button>
        <Button
          type="button"
          variant={demotesSelf ? "destructive" : "default"}
          disabled={!changed || pending}
          onClick={() => {
            onSubmit(roleId);
            onOpenChange(false);
          }}
        >
          {pending ? "변경 중…" : "역할 변경"}
        </Button>
      </div>
    </>
  );
}

export function RoleAssignDialog({ user, open, onOpenChange, ...rest }: RoleAssignDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto">
        {/* 사용자가 바뀔 때마다 선택 상태를 새로 시작한다 */}
        {user && <Body key={user.id} user={user} onOpenChange={onOpenChange} {...rest} />}
      </DialogContent>
    </Dialog>
  );
}
