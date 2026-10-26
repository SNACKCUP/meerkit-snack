import { expect, test } from "@playwright/test";

import { expectLoggedIn, login, logout, signup, uniqueUser } from "./helpers";

test.describe("회원가입 · 로그인", () => {
  test("가입하면 자동 로그인되고, 로그아웃 후 다시 로그인할 수 있다", async ({ page }) => {
    const u = uniqueUser();
    await signup(page, u);
    await expectLoggedIn(page);

    await page.goto("/me");
    await expect(page.getByRole("heading", { name: "내 정보" })).toBeVisible();
    await expect(page.getByText(u.email)).toBeVisible();

    await page.goto("/");
    await logout(page);
    await login(page, u.id, u.password);
    await expectLoggedIn(page);
  });

  test("필수 약관에 동의하지 않으면 가입되지 않는다", async ({ page }) => {
    const u = uniqueUser();
    await page.goto("/");
    await page.getByRole("button", { name: "회원가입" }).first().click();
    const dialog = page.getByRole("dialog");
    await dialog.locator("#signup-user-id").fill(u.id);
    await dialog.locator("#signup-name").fill(u.name);
    await dialog.locator("#signup-email").fill(u.email);
    await dialog.locator("#signup-password").fill(u.password);
    await dialog.getByRole("button", { name: "회원가입" }).click();
    await expect(dialog.getByRole("alert").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "계정 메뉴" })).toBeHidden();
  });

  test("이미 있는 아이디로는 가입할 수 없다", async ({ page, browser }) => {
    const u = uniqueUser();
    await signup(page, u);
    await expectLoggedIn(page);

    const other = await (await browser.newContext()).newPage();
    await signup(other, u);
    await expect(other.getByRole("dialog").getByRole("alert").first()).toBeVisible();
    await expect(other.getByRole("button", { name: "계정 메뉴" })).toBeHidden();
    await other.context().close();
  });

  test("비밀번호가 틀리면 오류가 보이고 로그인되지 않는다", async ({ page }) => {
    const u = uniqueUser();
    await signup(page, u);
    await expectLoggedIn(page);
    await page.goto("/");
    await logout(page);

    await login(page, u.id, "wrong-password-0");
    await expect(page.getByRole("dialog").getByRole("alert").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "계정 메뉴" })).toBeHidden();
  });
});
