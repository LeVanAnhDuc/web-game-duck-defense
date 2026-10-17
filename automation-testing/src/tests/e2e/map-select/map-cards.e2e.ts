import { test, expect } from "@/fixtures";
import { t } from "@/data/copy";
import { cleared, profile } from "@/data/profiles";
import { MAPS, MAP_ORDER } from "@/data/test-data";

// FR-13 · FR-26 · FR-35 · invariants #13: what each map card says, which ones open, and that they read at 375px.

test("người mới thấy bản đồ 1 mở và bốn bản đồ sau khoá kèm lý do", { tag: ["@TC-MAPSELECT-001", "@smoke"] }, async ({
  titlePage,
  mapSelectPage,
}) => {
  await titlePage.goto();
  await titlePage.openMapSelect();

  await expect(mapSelectPage.card("m01")).toContainText("1.");
  await expect(mapSelectPage.card("m01")).toContainText(t("mapSelect.playing"));
  await expect(mapSelectPage.card("m01")).toContainText(t("mapSelect.notPlayed"));
  await expect(mapSelectPage.card("m01")).toBeEnabled();

  for (let i = 1; i < MAP_ORDER.length; i++) {
    const card = mapSelectPage.card(MAP_ORDER[i]);
    await expect(card).toContainText(`${i + 1}.`);
    await expect(card).toContainText(t("mapSelect.locked"));
    await expect(card).toContainText(t("mapSelect.needsPrevious", { map: t(`map.${MAP_ORDER[i - 1]}`) }));
    await expect(card).toBeDisabled();
  }
});

test("thẻ nói đã qua, kỷ lục, mở hay khoá theo tiến trình", { tag: ["@TC-MAPSELECT-002"] }, async ({
  titlePage,
  mapSelectPage,
}) => {
  await titlePage.seedProfile(profile({ maps: { m01: cleared(17), m02: { bestWave: 5 } } }));
  await titlePage.goto();
  await titlePage.openMapSelect();

  await expect(mapSelectPage.card("m01")).toContainText(t("mapSelect.cleared"));
  await expect(mapSelectPage.card("m01")).toContainText(t("mapSelect.clearedDetail", { total: 12, lives: 17 }));
  await expect(mapSelectPage.card("m02")).toContainText(t("mapSelect.playing"));
  await expect(mapSelectPage.card("m02")).toContainText(t("mapSelect.best", { wave: 5, total: 14 }));
  await expect(mapSelectPage.card("m02")).toBeEnabled();
  await expect(mapSelectPage.card("m03")).toContainText(t("mapSelect.locked"));
  await expect(mapSelectPage.card("m03")).toContainText(t("mapSelect.needsPrevious", { map: t("map.m02") }));
});

test("bấm thẻ đang mở vào trận đúng bản đồ đó", { tag: ["@TC-MAPSELECT-003", "@smoke"] }, async ({
  titlePage,
  mapSelectPage,
  battlePage,
}) => {
  await titlePage.seedProfile(profile({ maps: { m01: cleared() } }));
  await titlePage.goto();
  await titlePage.openMapSelect();
  await mapSelectPage.pick("m02");
  await battlePage.waitReady();
  await expect(battlePage.waveNumber(1, MAPS.m02.waves)).toBeVisible();
  expect(await battlePage.gold()).toBe(MAPS.m02.startGold);
  expect(await battlePage.lives()).toBe(MAPS.m02.startLives);
});

test("thẻ bản đồ còn khoá không bấm được và không vào trận", { tag: ["@TC-MAPSELECT-004"] }, async ({
  titlePage,
  mapSelectPage,
  battlePage,
}) => {
  await titlePage.goto();
  await titlePage.openMapSelect();
  await expect(mapSelectPage.card("m02")).toBeDisabled();
  await mapSelectPage.card("m02").click({ force: true });
  await expect(mapSelectPage.heading()).toBeVisible();
  await expect(battlePage.goldChip()).toHaveCount(0);
});

test("ở 375px mọi thẻ hiện trọn tên, trạng thái và lý do khoá", { tag: ["@TC-MAPSELECT-005"] }, async ({
  page,
  titlePage,
  mapSelectPage,
}) => {
  await page.setViewportSize({ width: 375, height: 720 });
  await titlePage.seedProfile(
    profile({ cores: 115, maps: { m01: cleared(20), m02: cleared(11, 14), m03: { bestWave: 6 } }, lastMap: "m03" }),
  );
  await titlePage.goto();
  await titlePage.openMapSelect();

  const clipped = await mapSelectPage.clippedCardText(MAP_ORDER);
  expect(clipped, clipped.join(" · ")).toEqual([]);
  await expect(mapSelectPage.card("m04").getByText(t("mapSelect.needsPrevious", { map: t("map.m03") }))).toBeVisible();
});

test("màn chọn bản đồ hiện số lõi và dẫn sang xưởng", { tag: ["@TC-MAPSELECT-006"] }, async ({
  titlePage,
  mapSelectPage,
  workshopPage,
}) => {
  await titlePage.seedProfile(profile({ cores: 115 }));
  await titlePage.goto();
  await titlePage.openMapSelect();
  await expect(mapSelectPage.coresChip()).toHaveAttribute("aria-label", `${t("common.cores")}: 115`);
  await mapSelectPage.workshopButton().click();
  await expect(workshopPage.heading()).toBeVisible();
});
