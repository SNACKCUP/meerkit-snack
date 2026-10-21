import type { ComponentType } from "react";

import { AuthDialogDoc, LoginFormDoc, MemberTableDoc, RoleSelectDoc, RouteGuardsDoc, SignupFormDoc, UserAvatarDoc, UserMenuDoc } from "./components";
import { GuideAddRole, GuideCallApi, GuideProtectPage, Security } from "./guides";
import { ApiReference, Authentication, DataModel, Roles } from "./core";
import { Deployment, Installation, Introduction, ProjectStructure, Theming } from "./getting-started";
import { LoginLockoutDoc, MemberDirectoryDoc, PasswordResetDoc, ProfileDoc, TermsAgreementDoc } from "./flows";
import { AddressFieldDoc, EmailVerificationDoc, FileDropzoneDoc, RoleManagerDoc } from "./extras";
import { Faq, Hooks } from "./reference";

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
  "terms-agreement": TermsAgreementDoc,
  "password-reset": PasswordResetDoc,
  profile: ProfileDoc,
  "auth-dialog": AuthDialogDoc,
  "user-avatar": UserAvatarDoc,
  "user-menu": UserMenuDoc,
  "member-table": MemberTableDoc,
  "member-directory": MemberDirectoryDoc,
  "role-manager": RoleManagerDoc,
  "role-select": RoleSelectDoc,
  "route-guards": RouteGuardsDoc,
  hooks: Hooks,
  faq: Faq,
};
