"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { errorMessage } from "../api/error";
import { meerkitConfig } from "../config";
import { ChangePasswordForm } from "./components/ChangePasswordForm";
import { ProfileForm } from "./components/ProfileForm";
import { UserAvatar, displayName } from "./components/UserAvatar";
import { RequireAuth } from "./guards/RequireAuth";
import { useAuth } from "./hooks";
import { useChangePassword, useUpdateProfile } from "./mutations";

const date = (iso: string) => iso.slice(0, 10);

function MeContent() {
  const { user } = useAuth();
  const update = useUpdateProfile();
  const change = useChangePassword();
  if (!user) return null;

  return (
    <main className="mk-rise mx-auto max-w-xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">내 정보</h1>
      <Card className="mb-4">
        <CardContent className="flex items-center gap-4">
          <UserAvatar user={user} size="xl" />
          <div className="min-w-0">
            <p className="truncate text-xl font-semibold">{displayName(user)}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline">{user.role.name}</Badge>
              <span className="text-xs text-muted-foreground">가입일 {date(user.created_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">프로필 수정</TabsTrigger>
          <TabsTrigger value="password">비밀번호 변경</TabsTrigger>
        </TabsList>
        <Card className="mt-3">
          <CardContent>
            <TabsContent value="profile" className="mk-swap">
              <ProfileForm
                key={user.updated_at}
                user={user}
                onSubmit={update.mutate}
                pending={update.isPending}
                error={errorMessage(update.error)}
                optionalFields={[...meerkitConfig.signup.optionalFields]}
                addressType={meerkitConfig.signup.addressType}
              />
            </TabsContent>
            <TabsContent value="password" className="mk-swap">
              <ChangePasswordForm onSubmit={change.mutate} pending={change.isPending} error={errorMessage(change.error)} />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </main>
  );
}

export function MePage() {
  return (
    <RequireAuth>
      <MeContent />
    </RequireAuth>
  );
}
