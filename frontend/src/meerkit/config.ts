// 킷 설정. 값은 frontend/.env 에서 바꿉니다.
export const meerkitConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  docsUrl: process.env.NEXT_PUBLIC_DOCS_URL ?? "https://github.com/sensibly00-glitch/meerkit#readme",
  routes: {
    home: "/",
    me: "/me",
    adminMembers: "/admin/members",
  },
} as const;
