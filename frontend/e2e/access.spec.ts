import { expect, test } from "@playwright/test";

import { ADMIN_ID, ADMIN_PASSWORD, expectLoggedIn, login, signup, uniqueUser } from "./helpers";

test.describe("접근 제어", () => {
  test("로그인하지 않으면 /me 에서 로그인 안내가 나온다", async ({ page }) => {
    await page.goto("/me");
    await expect(page.getByText("로그인이 필요합니다.")).toBeVisible();
  });

  test("일반 회원은 /admin/members 에 들어갈 수 없다", async ({ page }) => {
    await signup(page, uniqueUser());
    await expectLoggedIn(page);
    await page.goto("/admin/members");
    await expect(page.getByText("접근 권한이 없습니다.")).toBeVisible();
  });

  test("관리자는 방금 가입한 회원을 멤버 관리에서 볼 수 있다", async ({ page, browser }) => {
    test.skip(!ADMIN_PASSWORD, "E2E_ADMIN_PASSWORD 가 없으면 건너뜁니다.");
    const u = uniqueUser();
    const ctx = await browser.newContext();
    const member = await ctx.newPage();
    await signup(member, u);
    await expectLoggedIn(member);
    await ctx.close();

    await login(page, ADMIN_ID, ADMIN_PASSWORD);
    await expectLoggedIn(page);
    await page.goto("/admin/members");
    await expect(page.getByRole("heading", { name: /멤버/ })).toBeVisible();
    await page.getByRole("searchbox").or(page.getByPlaceholder(/검색/)).first().fill(u.id);
    await expect(page.getByText(u.email)).toBeVisible();
  });
});
