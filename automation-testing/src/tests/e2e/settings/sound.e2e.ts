import type { Page } from "@playwright/test";
import { test, expect } from "@/fixtures";
import { t } from "@/data/copy";
import { VIEWPORTS } from "@/data/test-data";

// FR-18 (narrowed to one slider) · FR-28 · US-04 · NFR-A11Y-04: the settings screen and the one volume it has.

test.use({ viewport: VIEWPORTS.desktop });

test("cài đặt có nhóm ngôn ngữ và đúng một thanh âm thanh, không có nhạc nền", { tag: ["@TC-SETTINGS-001"] }, async ({
  page,
  titlePage,
  settingsPage,
}) => {
  await titlePage.goto();
  await titlePage.openSettings();
  await expect(settingsPage.heading()).toBeVisible();
  await expect(settingsPage.languageOption("vi")).toBeVisible();
  await expect(settingsPage.languageOption("en")).toBeVisible();
  await expect(settingsPage.soundSlider()).toBeVisible();
  await expect(settingsPage.musicControl()).toHaveCount(0);
  await expect(page.getByRole("slider")).toHaveCount(1);
});

test("âm thanh mặc định 80% và kéo về 0 thì hiện Tắt", { tag: ["@TC-SETTINGS-002"] }, async ({ titlePage, settingsPage }) => {
  await titlePage.goto();
  await titlePage.openSettings();
  await expect(settingsPage.soundSlider()).toHaveValue("80");
  await expect(settingsPage.soundValue("80%")).toBeVisible();

  await settingsPage.setSound(0);
  await expect(settingsPage.soundSlider()).toHaveValue("0");
  await expect(settingsPage.soundValue(t("settings.off"))).toBeVisible();
});

test("âm lượng đã chọn còn nguyên sau tải lại", { tag: ["@TC-SETTINGS-003", "@smoke"] }, async ({ titlePage, settingsPage }) => {
  await titlePage.goto();
  await titlePage.openSettings();
  await settingsPage.setSound(35);
  await expect(settingsPage.soundValue("35%")).toBeVisible();

  await titlePage.reload();
  await titlePage.openSettings();
  await expect(settingsPage.soundSlider()).toHaveValue("35");
  await expect(settingsPage.soundValue("35%")).toBeVisible();
  expect((await settingsPage.storedProfile())?.settings.sfx).toBeCloseTo(0.35);
});

test("thanh âm thanh tìm được bằng nhãn và chỉnh được bằng phím mũi tên", { tag: ["@TC-SETTINGS-004"] }, async ({
  page,
  titlePage,
  settingsPage,
}) => {
  await titlePage.goto();
  await titlePage.openSettings();
  await settingsPage.soundSlider().focus();
  await expect(settingsPage.soundSlider()).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(settingsPage.soundSlider()).toHaveValue("75");
  await expect(settingsPage.soundValue("75%")).toBeVisible();
});

test.describe("tiếng trong trận", () => {
  test.beforeEach(async ({ page }) => {
    // headless has no speakers: count the oscillators the game starts — every game sound is one (game/audio.ts)
    await page.addInitScript(() => {
      const w = window as unknown as { __oscStarts: number };
      w.__oscStarts = 0;
      const start = OscillatorNode.prototype.start;
      OscillatorNode.prototype.start = function (...args: Parameters<typeof start>) {
        w.__oscStarts++;
        return start.apply(this, args);
      };
    });
  });

  const oscStarts = (page: Page) =>
    page.evaluate(() => (window as unknown as { __oscStarts: number }).__oscStarts);

  test("âm lượng mặc định thì xây tháp phát tiếng", { tag: ["@TC-SETTINGS-005"] }, async ({ page, enterBattle, battlePage }) => {
    await enterBattle();
    await battlePage.build(8, "arrow");
    await expect.poll(() => oscStarts(page)).toBeGreaterThan(0);
  });

  test("âm lượng Tắt thì trận không phát một tiếng nào", { tag: ["@TC-SETTINGS-006"] }, async ({
    page,
    titlePage,
    settingsPage,
    battlePage,
  }) => {
    await titlePage.goto();
    await titlePage.openSettings();
    await settingsPage.setSound(0);
    await settingsPage.backButton().click();
    await titlePage.play();
    await battlePage.waitReady();
    await battlePage.build(8, "arrow");
    await battlePage.upgradeButton().click();
    await expect.poll(() => battlePage.gold()).toBe(140);
    expect(await oscStarts(page)).toBe(0);
  });
});
