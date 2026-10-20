export const meerkitConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  docsUrl: process.env.NEXT_PUBLIC_DOCS_URL ?? "https://github.com/sensibly00-glitch/meerkit#readme",
  showUiPage: process.env.NEXT_PUBLIC_SHOW_UI_PAGE !== "false",
  routes: {
    home: "/",
    me: "/me",
    adminMembers: "/admin/members",
    ui: "/ui",
  },
} as const;
