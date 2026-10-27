// 컴포넌트가 호출하는 API. 문서 하단의 "연결된 API"에 쓰인다. 형식: "메서드 경로" (api-spec.json의 경로와 같다)
export const COMPONENT_APIS: Record<string, string[]> = {
  "login-form": ["POST /api/auth/login"],
  "signup-form": [
    "GET /api/auth/terms",
    "GET /api/auth/check-user-id",
    "POST /api/auth/email/send-code",
    "POST /api/auth/email/verify-code",
    "POST /api/auth/signup",
  ],
  "email-verification": ["POST /api/auth/email/send-code", "POST /api/auth/email/verify-code"],
  "terms-agreement": ["GET /api/auth/terms"],
  "password-reset": ["POST /api/auth/password/forgot", "POST /api/auth/password/reset"],
  profile: ["GET /api/users/me", "PATCH /api/users/me", "PATCH /api/users/me/password", "DELETE /api/users/me"],
  nickname: ["PATCH /api/users/me"],
  "auth-dialog": ["POST /api/auth/login", "POST /api/auth/signup", "POST /api/auth/password/forgot", "POST /api/auth/id/forgot"],
  "profile-image": ["POST /api/users/me/avatar", "DELETE /api/users/me/avatar"],
  "user-menu": ["GET /api/users/me", "POST /api/auth/logout"],
  "member-table": ["GET /api/users", "PUT /api/users/{user_id}/roles", "PATCH /api/users/{user_id}/active", "DELETE /api/users/{user_id}"],
  "member-directory": ["GET /api/users", "GET /api/users/roles", "PUT /api/users/{user_id}/roles", "PATCH /api/users/{user_id}/active", "DELETE /api/users/{user_id}"],
  "role-manager": ["GET /api/users/roles", "PUT /api/users/{user_id}/roles"],
  "role-select": ["GET /api/users/roles", "PUT /api/users/{user_id}/roles"],
  "route-guards": ["GET /api/users/me", "POST /api/auth/refresh"],
};

/** 묶음(tag) → 문서 페이지 slug */
export const TAG_SLUG: Record<string, string> = {
  health: "api-health",
  auth: "api-auth",
  "users (me)": "api-users-me",
  "users (admin)": "api-users-admin",
};
