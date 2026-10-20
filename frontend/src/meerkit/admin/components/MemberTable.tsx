"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { errorMessage } from "../../api/client";
import { useAuth } from "../../auth/hooks";
import { useMembers, useUpdateActive } from "../queries";
import { RoleSelect } from "./RoleSelect";

/** 멤버 목록: 역할 부여, 활성/비활성. 자기 자신은 바꿀 수 없습니다. */
export function MemberTable() {
  const { user: me } = useAuth();
  const members = useMembers();
  const updateActive = useUpdateActive();

  if (members.isPending) return <p className="text-muted-foreground text-sm">불러오는 중...</p>;
  if (members.isError) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {errorMessage(members.error)}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>이름</TableHead>
          <TableHead>이메일</TableHead>
          <TableHead>역할</TableHead>
          <TableHead>상태</TableHead>
          <TableHead className="text-right">관리</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.data.map((member) => {
          const isMe = member.id === me?.id;
          return (
            <TableRow key={member.id}>
              <TableCell>
                {member.name}
                {isMe && <span className="text-muted-foreground ml-1 text-xs">(나)</span>}
              </TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                <RoleSelect member={member} disabled={isMe} />
              </TableCell>
              <TableCell>
                <Badge variant={member.is_active ? "secondary" : "destructive"}>
                  {member.is_active ? "활성" : "비활성"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isMe || updateActive.isPending}
                  onClick={() =>
                    updateActive.mutate({ userId: member.id, isActive: !member.is_active })
                  }
                >
                  {member.is_active ? "비활성화" : "활성화"}
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
