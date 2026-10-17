import { test, expect } from "@/fixtures";
import { t } from "@/data/copy";
import { VIEWPORTS } from "@/data/test-data";

// NFR-REL-03: a failed asset load shows an error with a retry, never an endless loading state. The first version
// returned early into a separate error screen, which unmounted the div Phaser lives in — so "retry" destroyed the old
// game and never started a new one, and the error stayed for good.

test.use({ viewport: VIEWPORTS.desktop });

const SHEET = "**/towerDefense_tilesheet.png"; // ../client/src/game/sprites.ts → SHEET_URL

test("sprite sheet không tải được thì hiện lỗi kèm tên file, Thử lại và Quay lại", { tag: ["@TC-LOADING-001", "@smoke"] }, async ({
  page,
  titlePage,
  battlePage,
}) => {
  await page.route(SHEET, (route) => route.abort("failed"));
  await titlePage.goto();
  await titlePage.play();
  await expect(battlePage.loadError()).toBeVisible();
  await expect(battlePage.loadError()).toContainText(t("error.assetFailed"));
  await expect(battlePage.loadError()).toContainText("towerDefense_tilesheet.png");
  await expect(battlePage.retryButton()).toBeVisible();
  await expect(battlePage.loadError().getByRole("button", { name: t("common.back"), exact: true })).toBeVisible();
});

test("Thử lại khi mạng đã ổn thì vào được trận thật sự", { tag: ["@TC-LOADING-002", "@smoke"] }, async ({
  page,
  titlePage,
  battlePage,
}) => {
  let blocked = true;
  await page.route(SHEET, (route) => (blocked ? route.abort("failed") : route.continue()));
  await titlePage.goto();
  await titlePage.play();
  await expect(battlePage.loadError()).toBeVisible();

  blocked = false;
  await battlePage.retryButton().click();
  await expect(battlePage.loadError()).toHaveCount(0);
  await expect(battlePage.goldChip()).toBeVisible();
  await expect(battlePage.slot(8)).toBeVisible();
});

test("Quay lại từ lớp lỗi về màn chọn bản đồ", { tag: ["@TC-LOADING-003"] }, async ({
  page,
  titlePage,
  battlePage,
  mapSelectPage,
}) => {
  await page.route(SHEET, (route) => route.abort("failed"));
  await titlePage.goto();
  await titlePage.play();
  await expect(battlePage.loadError()).toBeVisible();
  await battlePage.loadError().getByRole("button", { name: t("common.back"), exact: true }).click();
  await expect(mapSelectPage.heading()).toBeVisible();
});
