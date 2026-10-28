import type { ComponentType } from "react";

import { AuthDialogDoc, LoginFormDoc, MemberTableDoc, RoleSelectDoc, RouteGuardsDoc, SignupFormDoc, UserAvatarDoc, UserMenuDoc } from "./components";
import { GuideAddRole, GuideCallApi, GuideProtectPage, Security } from "./guides";
import { Authentication, DataModel, Roles } from "./core";
import { Deployment, Installation, Introduction, ProjectStructure, Theming } from "./getting-started";
import { GoogleLoginDoc } from "./google-login";
import { LoginLockoutDoc, MemberDirectoryDoc, PasswordResetDoc, ProfileDoc, TermsAgreementDoc } from "./flows";
import { VoiceDoc } from "./voice";
import { LoadingDoc } from "./loading";
import { ApiOverviewDoc, ApiSpecPage } from "./api-spec";
import { ComponentsListDoc } from "./components-list";
import { DateDoc } from "./date";
import { ProfileImageDoc } from "./profile-image";
import { AddressFieldDoc, EmailVerificationDoc, FileDropzoneDoc, NicknameDoc, RoleManagerDoc } from "./extras";
import { AiPromptInputDoc, ApiKeyInputDoc, ThinkingIndicatorDoc } from "./ai";
import { Faq, Hooks } from "./reference";
import { MemberAiUsageDoc, MemberAiUsageHistoryDoc } from "./usage";

// nav.ts의 slug와 같은 키로 본문을 연결한다.
export const docContent: Record<string, ComponentType> = {
  introduction: Introduction,
  installation: Installation,
  "project-structure": ProjectStructure,
  theming: Theming,
  deployment: Deployment,
  authentication: Authentication,
  roles: Roles,
  "data-model": DataModel,
  "api-overview": ApiOverviewDoc,
  "api-health": () => <ApiSpecPage tag="health" />,
  "api-auth": () => <ApiSpecPage tag="auth" />,
  "api-users-me": () => <ApiSpecPage tag="users (me)" />,
  "api-users-admin": () => <ApiSpecPage tag="users (admin)" />,
  "login-lockout": LoginLockoutDoc,
  security: Security,
  "guide-protect-page": GuideProtectPage,
  "guide-add-role": GuideAddRole,
  "guide-call-api": GuideCallApi,
  "login-form": LoginFormDoc,
  "signup-form": SignupFormDoc,
  "email-verification": EmailVerificationDoc,
  "address-field": AddressFieldDoc,
  "file-dropzone": FileDropzoneDoc,
  loading: LoadingDoc,
  components: ComponentsListDoc,
  date: DateDoc,
  "profile-image": ProfileImageDoc,
  voice: VoiceDoc,
  "terms-agreement": TermsAgreementDoc,
  "password-reset": PasswordResetDoc,
  "google-login": GoogleLoginDoc,
  profile: ProfileDoc,
  nickname: NicknameDoc,
  "auth-dialog": AuthDialogDoc,
  "user-avatar": UserAvatarDoc,
  "user-menu": UserMenuDoc,
  "member-table": MemberTableDoc,
  "member-directory": MemberDirectoryDoc,
  "member-ai-usage": MemberAiUsageDoc,
  "member-ai-usage-history": MemberAiUsageHistoryDoc,
  "role-manager": RoleManagerDoc,
  "role-select": RoleSelectDoc,
  "route-guards": RouteGuardsDoc,
  "ai-prompt-input": AiPromptInputDoc,
  "thinking-indicator": ThinkingIndicatorDoc,
  "api-key-input": ApiKeyInputDoc,
  "api-llm": () => <ApiSpecPage tag="llm" />,
  hooks: Hooks,
  faq: Faq,
};
