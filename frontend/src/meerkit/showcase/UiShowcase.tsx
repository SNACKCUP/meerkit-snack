"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { MemberTable } from "../admin/components/MemberTable";
import { LoginForm } from "../auth/components/LoginForm";
import { SignupForm } from "../auth/components/SignupForm";
import { UserMenu } from "../auth/components/UserMenu";
import { useAuthDialog } from "../auth/dialog-store";
import type { User } from "../types";

const mockUsers: User[] = [
  { id: 1, email: "admin@example.com", name: "관리자", roles: ["admin"], is_active: true },
  { id: 2, email: "user@example.com", name: null, roles: ["user"], is_active: true },
  { id: 3, email: "off@example.com", name: "비활성", roles: ["user"], is_active: false },
];

// Tailwind가 클래스를 찾을 수 있도록 전체 이름을 적는다.
const swatches = [
  ["primary", "bg-primary"], ["meerkat", "bg-meerkat"], ["paw", "bg-paw"], ["cream", "bg-cream"],
  ["navy", "bg-navy"], ["background", "bg-background"], ["muted", "bg-muted"], ["accent", "bg-accent"],
  ["border", "bg-border"], ["destructive", "bg-destructive"],
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 py-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <Card>
        <CardContent className="grid gap-4">{children}</CardContent>
      </Card>
    </section>
  );
}

// 목 데이터만 사용하므로 백엔드 없이 열린다.
export function UiShowcase() {
  const openDialog = useAuthDialog((s) => s.openDialog);
  const noop = () => {};

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">UI 모음</h1>
      <p className="mt-1 text-sm text-muted-foreground">MeerKit이 제공하는 shadcn 기반 컴포넌트 모음입니다.</p>
      <Section title="디자인 토큰">
        <div className="flex flex-wrap gap-3">
          {swatches.map(([name, cls]) => (
            <div key={name} className="grid gap-1 text-xs">
              <div className={`size-14 rounded-lg border ${cls}`} />
              {name}
            </div>
          ))}
        </div>
      </Section>
      <Section title="기본 부품">
        <div className="flex flex-wrap items-center gap-2">
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button disabled>Disabled</Button>
          <Button variant="secondary">Secondary</Button>
          <Badge>Default</Badge>
          <Badge variant="brand">Brand</Badge>
          <Badge variant="warm">Warm</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
        <div className="grid max-w-xs gap-2">
          <Label htmlFor="demo">Label</Label>
          <Input id="demo" placeholder="Input" />
        </div>
      </Section>
      <Section title="모달">
        <div className="flex gap-2">
          <Button onClick={() => openDialog("login")}>로그인 모달</Button>
          <Button onClick={() => openDialog("signup")}>가입 모달</Button>
        </div>
      </Section>
      <Section title="로그인 / 가입 폼">
        <div className="grid gap-8 sm:grid-cols-2">
          <LoginForm onSubmit={noop} />
          <SignupForm onSubmit={noop} />
          <LoginForm onSubmit={noop} pending />
          <LoginForm onSubmit={noop} error="이메일 또는 비밀번호가 올바르지 않습니다." />
        </div>
      </Section>
      <Section title="UserMenu">
        <UserMenu user={mockUsers[0]} onLogout={noop} />
        <UserMenu user={mockUsers[1]} onLogout={noop} />
      </Section>
      <Section title="MemberTable">
        <MemberTable members={mockUsers} onRoleChange={noop} onActiveChange={noop} />
        <MemberTable members={[]} onRoleChange={noop} onActiveChange={noop} />
      </Section>
    </main>
  );
}
