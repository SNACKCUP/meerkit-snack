import { expect, test } from "@playwright/test";

// 말모아(/malmoa) 시나리오. 회의 데이터는 브라우저에 저장되는 목이므로 백엔드 없이도 돈다.
// 말모아에는 로그인·회원 기능이 없다.
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
  await expect(page.getByRole("link", { name: /처음/ }).first()).toBeVisible();
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
  await expect(page.getByRole("button", { name: "텍스트로 변환", exact: true })).toBeVisible();
});

test("예시 회의 결과 화면", async ({ page }) => {
  await page.goto("/malmoa/meetings");
  await page.getByRole("link", { name: /./ }).filter({ hasText: /회의/ }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("게임 요소(레벨·경험치·캐릭터)는 없다", async ({ page }) => {
  await page.goto("/malmoa/home");
  await expect(page.getByRole("heading", { level: 1, name: "녹음" })).toBeVisible();
  await expect(page.getByText(/Lv\.?\s?\d+|경험치|퀘스트|업적|EXP/)).toHaveCount(0);
});

test("로그인·가입 화면과 계정 메뉴는 없다", async ({ page }) => {
  await page.goto("/malmoa");
  await expect(page.getByRole("link", { name: /로그인|가입/ })).toHaveCount(0);
  await page.goto("/malmoa/login");
  await expect(page.getByRole("heading", { level: 1, name: /찾을 수 없/ })).toBeVisible();
});

test("녹음 화면: 창을 끌어 옮기고, 닫았다가 아이콘으로 다시 연다", async ({ page }) => {
  await page.goto("/malmoa/home");
  await page.getByRole("list", { name: "바탕화면 아이콘" }).waitFor();
  const win = page.getByRole("region", { name: "메모장" });
  await expect(win).toBeVisible();
  const before = await win.boundingBox();
  const bar = win.locator("header");
  const b = (await bar.boundingBox())!;
  await page.mouse.move(b.x + 60, b.y + 10);
  await page.mouse.down();
  await page.mouse.move(b.x + 20, b.y - 60, { steps: 5 });
  await page.mouse.up();
  const after = await win.boundingBox();
  expect(after!.y).toBeLessThan(before!.y - 30);

  await page.getByRole("button", { name: "메모장 닫기" }).click();
  await expect(win).toBeHidden();
  await page.getByRole("list", { name: "바탕화면 아이콘" }).getByRole("button", { name: "메모장" }).click();
  await expect(win).toBeVisible();
});

test("메모장: 녹음 중이면 녹음 시각이 찍힌다", async ({ page }) => {
  await page.goto("/malmoa/home");
  await page.getByRole("button", { name: "녹음 시작" }).click();
  await expect(page.getByRole("button", { name: "녹음 종료" })).toBeVisible();
  await page.getByRole("button", { name: "녹음 시각 넣기" }).click();
  await expect(page.getByRole("textbox", { name: "메모" })).toHaveValue(/\[녹음 \d\d:\d\d:\d\d\]/);
});

test("녹음 화면: 창은 바탕화면 밖으로 나가지 않고, 작업 표시줄은 화면 아래에 붙는다", async ({ page }) => {
  await page.goto("/malmoa/home");
  await page.getByRole("list", { name: "바탕화면 아이콘" }).waitFor();
  const win = page.getByRole("region", { name: "녹음기" });
  const desk = page.getByRole("list", { name: "바탕화면 아이콘" }).locator("..");
  const b = (await win.locator("header").boundingBox())!;
  await page.mouse.move(b.x + 80, b.y + 10);
  await page.mouse.down();
  await page.mouse.move(2000, 2000, { steps: 8 });
  await page.mouse.up();
  const w = (await win.boundingBox())!;
  const d = (await desk.boundingBox())!;
  expect(w.x + w.width).toBeLessThanOrEqual(d.x + d.width + 1);
  expect(w.y + w.height).toBeLessThanOrEqual(d.y + d.height + 1);
  const bar = page.getByRole("navigation", { name: "작업 표시줄" });
  expect(await bar.evaluate((el) => getComputedStyle(el).position)).toBe("sticky");
});

test("녹음 후 미리듣기 플레이어(기본 audio 컨트롤 아님)가 나온다", async ({ page }) => {
  await page.goto("/malmoa/home");
  await page.getByRole("button", { name: "녹음 시작" }).click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "녹음 종료" }).click();
  const player = page.getByRole("group", { name: "녹음 미리듣기" });
  await expect(player.getByRole("button", { name: "재생" })).toBeVisible();
  await expect(player.getByRole("slider", { name: /재생 위치/ })).toBeVisible();
});
