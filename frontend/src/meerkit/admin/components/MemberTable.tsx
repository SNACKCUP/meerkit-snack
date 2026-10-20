"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { Role, User } from "../../types";
import { RoleSelect } from "./RoleSelect";

interface MemberTableProps {
  members: User[];
  onRoleChange: (id: number, role: Role) => void;
  onActiveChange: (id: number, active: boolean) => void;
}

export function MemberTable({ members, onRoleChange, onActiveChange }: MemberTableProps) {
  if (members.length === 0) {
    return <p className="p-6 text-center text-sm text-muted-foreground">멤버가 없습니다.</p>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>이메일</TableHead>
          <TableHead>이름</TableHead>
          <TableHead>역할</TableHead>
          <TableHead>상태</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((m) => (
          <TableRow key={m.id}>
            <TableCell>{m.email}</TableCell>
            <TableCell>{m.name ?? "-"}</TableCell>
            <TableCell>
              <RoleSelect value={m.roles.includes("admin") ? "admin" : "user"} onChange={(role) => onRoleChange(m.id, role)} />
            </TableCell>
            <TableCell>
              <Badge variant={m.is_active ? "default" : "secondary"}>{m.is_active ? "활성" : "비활성"}</Badge>
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm" onClick={() => onActiveChange(m.id, !m.is_active)}>
                {m.is_active ? "비활성화" : "활성화"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
