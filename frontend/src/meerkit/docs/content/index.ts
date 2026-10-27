import type { ComponentType } from "react";

import { AuthDialogDoc, LoginFormDoc, MemberTableDoc, RoleSelectDoc, RouteGuardsDoc, SignupFormDoc, UserAvatarDoc, UserMenuDoc } from "./components";
import { GuideAddRole, GuideCallApi, GuideProtectPage, Security } from "./guides";
import { ApiReference, Authentication, DataModel, Roles } from "./core";
import { Deployment, Installation, Introduction, ProjectStructure, Theming } from "./getting-started";
import { LoginLockoutDoc, MemberDirectoryDoc, PasswordResetDoc, ProfileDoc, TermsAgreementDoc } from "./flows";
import { VoiceDoc } from "./voice";
import { LoadingDoc } from "./loading";
import { DateDoc } from "./date";
import { ProfileImageDoc } from "./profile-image";
import { AddressFieldDoc, EmailVerificationDoc, FileDropzoneDoc, NicknameDoc, RoleManagerDoc } from "./extras";
import { AiPromptInputDoc, ThinkingIndicatorDoc } from "./ai";
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
  "api-reference": ApiReference,
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
  date: DateDoc,
  "profile-image": ProfileImageDoc,
  voice: VoiceDoc,
  "terms-agreement": TermsAgreementDoc,
  "password-reset": PasswordResetDoc,
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
  hooks: Hooks,
  faq: Faq,
};
