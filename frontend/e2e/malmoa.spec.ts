import { expect, test } from "@playwright/test";

import { ADMIN_ID, ADMIN_PASSWORD } from "./helpers";

// 말모아(/malmoa) 시나리오. 회의 데이터는 브라우저에 저장되는 목이므로 백엔드 없이도 돈다.
// 로그인 시나리오만 백엔드와 E2E_ADMIN_PASSWORD가 필요하다.
// 실제 마이크 대신 소리가 나는 가짜 스트림을 돌려준다 (headless 에서는 권한 창이 없어 getUserMedia 가 멈춘다)
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const dest = ctx.createMediaStreamDestination();
      osc.connect(dest);
      osc.start();
      return dest.stream;
    };
  });
});

test("랜딩: 제목, 시작 링크, 본문 건너뛰기", async ({ page }) => {
  await page.goto("/malmoa");
  await expect(page).toHaveTitle(/말모아/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "본문으로 건너뛰기" })).toHaveAttribute("href", "#malmoa-main");
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
});

test("없는 주소는 말모아 404", async ({ page }) => {
  await page.goto("/malmoa/없는-화면");
  await expect(page.getByRole("link", { name: /처음|퀘스트/ }).first()).toBeVisible();
});

test("사용 안내: 목차와 자주 묻는 질문", async ({ page }) => {
  await page.goto("/malmoa/guide");
  await expect(page.getByRole("heading", { level: 1, name: "사용 안내" })).toBeVisible();
  const q = page.getByRole("button", { name: /마이크 사용이 거부/ });
  await q.click();
  await expect(q).toHaveAttribute("aria-expanded", "true");
});

test("설정: 움직임 끄기와 데이터 초기화", async ({ page }) => {
  await page.goto("/malmoa/settings");
  const box = page.getByLabel("움직임 끄기");
  await box.check();
  await expect(page.locator("html")).toHaveAttribute("data-mk-motion", "off");
  await box.uncheck();
  await expect(page.locator("html")).not.toHaveAttribute("data-mk-motion", "off");
  await page.getByRole("button", { name: "데이터 초기화" }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: "초기화" }).click();
  await expect(page.getByRole("status")).toContainText("처음 상태");
});

test("업로드하면 회의 목록에 새 회의가 생긴다", async ({ page }) => {
  await page.goto("/malmoa/home");
  await page.getByLabel("파일 선택").setInputFiles({ name: "주간회의.mp3", mimeType: "audio/mpeg", buffer: Buffer.alloc(2048, 1) });
  await page.getByRole("button", { name: "업로드하고 텍스트로 변환" }).click();
  await page.goto("/malmoa/meetings");
  await expect(page.getByText("주간회의").first()).toBeVisible({ timeout: 15_000 });
});

test("녹음: 시작하고 종료하면 변환 버튼이 나온다", async ({ page }) => {
  await page.goto("/malmoa/home");
  await page.getByRole("button", { name: "녹음 시작" }).click();
  await expect(page.getByRole("button", { name: "녹음 종료" })).toBeVisible();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "녹음 종료" }).click();
  await expect(page.getByRole("button", { name: "텍스트로 변환" })).toBeVisible();
});

test("예시 회의 결과 화면", async ({ page }) => {
  await page.goto("/malmoa/meetings");
  await page.getByRole("link", { name: /./ }).filter({ hasText: /회의/ }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("내 캐릭터: 레벨과 업적", async ({ page }) => {
  await page.goto("/malmoa/profile");
  await expect(page.getByText(/Lv\.?\s?\d+/).first()).toBeVisible();
});

test.describe("로그인", () => {
  test.skip(!ADMIN_PASSWORD, "E2E_ADMIN_PASSWORD 가 없으면 건너뜁니다");
  test("관리자로 로그인하면 퀘스트 보드로 이동", async ({ page }) => {
    await page.goto("/malmoa/login");
    await page.locator("#login-user-id").fill(ADMIN_ID);
    await page.locator("#login-password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "로그인" }).last().click();
    await expect(page).toHaveURL(/\/malmoa\/home/, { timeout: 10_000 });
    await expect(page.getByRole("button", { name: "계정 메뉴" })).toBeVisible();
  });
});
