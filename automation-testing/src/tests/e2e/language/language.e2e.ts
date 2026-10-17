import { test, expect } from "@/fixtures";
import { t } from "@/data/copy";
import { M01, VIEWPORTS } from "@/data/test-data";

// FR-17 · US-04 · NFR-I18N-03 · NFR-I18N-04: two languages, switched live, remembered, and neither one overflows.

test("đổi sang English ở màn tiêu đề đổi chữ ngay mà không tải lại trang", { tag: ["@TC-LANGUAGE-001", "@smoke"] }, async ({
  page,
  titlePage,
}) => {
  await titlePage.goto();
  await page.evaluate(() => ((window as unknown as { __sameDocument: boolean }).__sameDocument = true));
  await titlePage.switchLanguage("en");

  await expect(titlePage.playButton()).toHaveText(t("title.play", {}, "en"));
  await expect(titlePage.mapSelectButton()).toBeVisible();
  await expect(titlePage.workshopButton()).toBeVisible();
  await expect(titlePage.tagline()).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __sameDocument?: boolean }).__sameDocument)).toBe(true);
});

test("đổi ngôn ngữ trong cài đặt cũng đổi chữ ngay", { tag: ["@TC-LANGUAGE-002"] }, async ({ titlePage, settingsPage }) => {
  await titlePage.goto();
  await titlePage.openSettings();
  await settingsPage.languageOption("en").click();
  settingsPage.locale = "en";
  titlePage.locale = "en";
  await expect(settingsPage.heading()).toBeVisible();
  await expect(settingsPage.soundSlider()).toBeVisible();
  await settingsPage.backButton().click();
  await expect(titlePage.playButton()).toBeVisible();
});

test("ngôn ngữ đã chọn còn nguyên sau tải lại", { tag: ["@TC-LANGUAGE-003", "@smoke"] }, async ({ titlePage }) => {
  await titlePage.goto();
  await titlePage.switchLanguage("en");
  await titlePage.reload();
  await expect(titlePage.playButton()).toBeVisible();
  await expect(titlePage.languageOption("en")).toHaveAttribute("aria-checked", "true");
  expect((await titlePage.storedProfile())?.locale).toBe("en");
});

test("tiếng Anh phủ màn chọn bản đồ, xưởng và trận", { tag: ["@TC-LANGUAGE-004"] }, async ({
  page,
  titlePage,
  mapSelectPage,
  workshopPage,
  battlePage,
}) => {
  await page.setViewportSize(VIEWPORTS.desktop);
  await titlePage.goto();
  await titlePage.switchLanguage("en");
  for (const p of [mapSelectPage, workshopPage, battlePage]) p.locale = "en";

  await titlePage.openMapSelect();
  await expect(mapSelectPage.card("m01")).toContainText(t("mapSelect.playing", {}, "en"));
  await expect(mapSelectPage.card("m01")).toContainText(t("mapSelect.notPlayed", {}, "en"));
  await expect(mapSelectPage.card("m02")).toContainText(t("mapSelect.needsPrevious", { map: t("map.m01", {}, "en") }, "en"));
  await expect(page.getByText(t("map.m01"), { exact: true })).toHaveCount(0);
  await mapSelectPage.backButton().click();

  await titlePage.openWorkshop();
  await expect(workshopPage.node("startGold")).toBeVisible();
  await workshopPage.backButton().click();

  await titlePage.play();
  await battlePage.waitReady();
  await expect(battlePage.waveNumber(1, M01.waves)).toBeVisible();
  await expect(battlePage.goldChip()).toHaveAttribute("aria-label", `${t("common.gold", {}, "en")}: ${M01.startGold}`);
  await expect(battlePage.callWaveButton()).toContainText(t("battle.callWave", {}, "en"));
  await battlePage.slot(8).click();
  await expect(battlePage.towerCard("arrow")).toBeVisible();
  await expect(page.getByText(t("battle.callWave"))).toHaveCount(0);
  await expect(page.getByRole("group", { name: new RegExp(`^${t("common.gold")}:`) })).toHaveCount(0);
});

for (const locale of ["vi", "en"] as const) {
  test(
    `ở 375px tiếng ${locale === "vi" ? "Việt" : "Anh"} không tràn ngang và không cắt chữ`,
    { tag: [locale === "vi" ? "@TC-LANGUAGE-005" : "@TC-LANGUAGE-006"] },
    async ({ page, titlePage, mapSelectPage, workshopPage, battlePage }) => {
      await page.setViewportSize(VIEWPORTS.phone);
      await titlePage.goto();
      if (locale === "en") await titlePage.switchLanguage("en");
      for (const p of [mapSelectPage, workshopPage, battlePage]) p.locale = locale;

      const screens: [string, () => Promise<void>][] = [
        ["title", async () => {}],
        ["map select", async () => {
          await titlePage.openMapSelect();
          await mapSelectPage.heading().waitFor();
        }],
        ["workshop", async () => {
          await mapSelectPage.backButton().click();
          await titlePage.openWorkshop();
          await workshopPage.heading().waitFor();
        }],
        ["battle", async () => {
          await workshopPage.backButton().click();
          await titlePage.play();
          await battlePage.waitReady();
        }],
      ];
      for (const [name, go] of screens) {
        await go();
        expect(await titlePage.horizontalOverflow(), `${name}: sideways scroll`).toBeLessThanOrEqual(1);
        expect(await titlePage.clippedLabels(), `${name}: clipped labels`).toEqual([]);
      }
    },
  );
}

test("nhịp bắn hiện dấu thập phân theo ngôn ngữ", { tag: ["@TC-LANGUAGE-007"] }, async ({
  page,
  titlePage,
  battlePage,
  mapSelectPage,
}) => {
  await page.setViewportSize(VIEWPORTS.desktop);
  await titlePage.goto();
  await titlePage.play();
  await battlePage.waitReady();
  await battlePage.slot(8).click();
  await expect(battlePage.stat("battle.statRate")).toHaveText(t("battle.seconds", { n: 0.8 }, "vi"));
  expect(t("battle.seconds", { n: 0.8 }, "vi")).toBe("0,8 s");

  await battlePage.backButton().click();
  await mapSelectPage.backButton().click();
  await titlePage.switchLanguage("en");
  battlePage.locale = "en";
  await titlePage.play();
  await battlePage.waitReady();
  await battlePage.slot(8).click();
  await expect(battlePage.stat("battle.statRate")).toHaveText("0.8s");
});
