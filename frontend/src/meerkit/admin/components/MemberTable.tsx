"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { displayName } from "../../auth/components/UserAvatar";
import type { User } from "../../types";
import { RoleAssignDialog } from "./RoleAssignDialog";
import { RoleSelect } from "./RoleSelect";

interface MemberTableProps {
  members: User[];
  onRoleChange: (id: number, roleId: number) => void;
  onRemove: (id: number) => void;
  /**
   * "dialog": 역할 옆 [변경] 버튼 → 확인 창에서 역할 설명을 보고 선택 (기본)
   * "inline": 표 안의 선택 상자에서 바로 변경
   */
  roleEditor?: "dialog" | "inline";
  /** 지금 로그인한 관리자의 id. 자기 권한을 낮추는 변경을 경고한다 */
  currentUserId?: number;
}

function StatusBadge({ user }: { user: User }) {
  if (user.deleted_at) return <Badge variant="destructive">삭제됨</Badge>;
  return user.is_active ? <Badge variant="brand">활성</Badge> : <Badge variant="secondary">비활성</Badge>;
}

const date = (iso: string) => iso.slice(0, 10);

export function MemberTable({ members, onRoleChange, onRemove, roleEditor = "dialog", currentUserId }: MemberTableProps) {
  const [target, setTarget] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  if (members.length === 0) {
    return <p className="p-6 text-center text-sm text-muted-foreground">멤버가 없습니다.</p>;
  }
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>아이디</TableHead>
            <TableHead>이름</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead>역할</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>가입일</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="text-muted-foreground">{m.id}</TableCell>
              <TableCell className="font-medium">{m.user_id}</TableCell>
              <TableCell>{displayName(m)}</TableCell>
              <TableCell>{m.email}</TableCell>
              <TableCell>
                {roleEditor === "inline" ? (
                  <RoleSelect value={m.role.id} disabled={!!m.deleted_at} onChange={(roleId) => onRoleChange(m.id, roleId)} />
                ) : (
                  <span className="flex items-center gap-2">
                    <Badge variant="outline">{m.role.name}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      disabled={!!m.deleted_at}
                      onClick={() => {
                        setTarget(m);
                        setOpen(true);
                      }}
                    >
                      변경
                    </Button>
                  </span>
                )}
              </TableCell>
              <TableCell><StatusBadge user={m} /></TableCell>
              <TableCell className="text-muted-foreground">{date(m.created_at)}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" disabled={!!m.deleted_at} onClick={() => onRemove(m.id)}>
                  탈퇴 처리
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {roleEditor === "dialog" && (
        <RoleAssignDialog
          user={target}
          open={open}
          onOpenChange={setOpen}
          currentUserId={currentUserId}
          onSubmit={(roleId) => target && onRoleChange(target.id, roleId)}
        />
      )}
    </>
  );
}
