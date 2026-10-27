import { expect, type Page } from "@playwright/test";

export const ADMIN_ID = process.env.E2E_ADMIN_ID ?? "admin";
// 관리자 비밀번호는 코드에 두지 않는다. backend/.env 의 SEED_ADMIN_PASSWORD 값을 환경변수로 넘긴다.
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "";

export const TEST_PASSWORD = "e2e-pass-1234";

export function uniqueUser() {
  const id = `e2e${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  return { id, name: `테스터${id.slice(-4)}`, email: `${id}@example.com`, password: TEST_PASSWORD };
}

export async function signup(page: Page, u: ReturnType<typeof uniqueUser>) {
  await page.goto("/");
  await page.getByRole("button", { name: "회원가입" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.locator("#signup-user-id").fill(u.id);
  await dialog.locator("#signup-name").fill(u.name);
  await dialog.locator("#signup-email").fill(u.email);
  await dialog.locator("#signup-password").fill(u.password);
  await dialog.getByLabel("[필수]", { exact: false }).first().waitFor();
  await dialog.locator("#terms-terms").click();
  await dialog.locator("#terms-privacy").click();
  await dialog.getByRole("button", { name: "회원가입" }).click();
}

export async function login(page: Page, userId: string, password: string) {
  await page.goto("/");
  await page.getByRole("button", { name: "로그인" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.locator("#login-user-id").fill(userId);
  await dialog.locator("#login-password").fill(password);
  await dialog.getByRole("button", { name: "로그인" }).click();
}

export async function expectLoggedIn(page: Page) {
  await expect(page.getByRole("button", { name: "계정 메뉴" })).toBeVisible({ timeout: 10_000 });
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: "계정 메뉴" }).click();
  await page.getByRole("menuitem", { name: "로그아웃" }).click();
  await expect(page.getByRole("button", { name: "계정 메뉴" })).toBeHidden();
}
