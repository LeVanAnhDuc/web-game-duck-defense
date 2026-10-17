import { test, expect } from "@/fixtures";
import { M01, TOWERS, VIEWPORTS } from "@/data/test-data";

// FR-30 · US-01 · invariants #12: real layouts at every width named in FR-30, both orientations, and a canvas that
// fits its frame from the first frame on.

const STOPS = [
  ["375-portrait", VIEWPORTS.phone],
  ["375-landscape", VIEWPORTS.phoneLandscape],
  ["768-portrait", VIEWPORTS.tablet],
  ["1024-landscape", VIEWPORTS.laptop],
  ["1440-desktop", VIEWPORTS.desktop],
] as const;

for (const [name, viewport] of STOPS) {
  test(`không màn nào cuộn ngang ở năm mốc bề rộng — ${name}`, { tag: ["@TC-RESPONSIVE-001"] }, async ({
    page,
    titlePage,
    mapSelectPage,
    workshopPage,
    settingsPage,
    battlePage,
  }) => {
    await page.setViewportSize(viewport);
    await titlePage.goto();
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
      ["settings", async () => {
        await workshopPage.backButton().click();
        await titlePage.openSettings();
        await settingsPage.heading().waitFor();
      }],
      ["battle", async () => {
        await settingsPage.backButton().click();
        await titlePage.play();
        await battlePage.waitReady();
      }],
    ];
    for (const [screen, go] of screens) {
      await go();
      expect(await titlePage.horizontalOverflow(), `${screen} scrolls sideways at ${name}`).toBeLessThanOrEqual(1);
    }
  });
}

test("canvas vừa khung bàn chơi ngay từ lúc vào trận", { tag: ["@TC-RESPONSIVE-002", "@smoke"] }, async ({
  page,
  enterBattle,
  battlePage,
}) => {
  // 1280×720 is where Phaser once measured the window instead of the frame: 720×720 in a 580-high frame (#12)
  for (const viewport of [{ width: 1280, height: 720 }, VIEWPORTS.phone]) {
    await page.setViewportSize(viewport);
    await enterBattle();
    await expect
      .poll(async () => {
        const fit = await battlePage.canvasFit();
        return fit !== null && fit.canvas.h <= fit.frame.h + 1 && fit.canvas.w <= fit.frame.w + 1 && fit.canvas.w > 0;
      })
      .toBe(true);
  }
});

test("ở cả ba bố cục trận HUD, tốc độ và nút gọi đợt nằm trọn trong màn hình", { tag: ["@TC-RESPONSIVE-003"] }, async ({
  page,
  enterBattle,
  battlePage,
}) => {
  for (const viewport of [VIEWPORTS.phone, VIEWPORTS.phoneLandscape, VIEWPORTS.desktop]) {
    await page.setViewportSize(viewport);
    await enterBattle();
    const label = `${viewport.width}×${viewport.height}`;
    for (const [name, target] of [
      ["gold", battlePage.goldChip()],
      ["lives", battlePage.livesChip()],
      ["speed", battlePage.speedGroup()],
      ["call wave", battlePage.callWaveButton()],
    ] as const) {
      expect(await battlePage.fullyInViewport(target), `${name} off screen at ${label}`).toBe(true);
    }
    await battlePage.callWave();
    await expect(battlePage.callWaveButton()).toHaveAttribute("aria-disabled", "true");
  }
});

test("xoay máy giữa trận không reset trận", { tag: ["@TC-RESPONSIVE-004", "@smoke"] }, async ({ page, enterBattle, battlePage }) => {
  await page.setViewportSize(VIEWPORTS.phone);
  await enterBattle();
  await battlePage.build(8, "arrow");
  const gold = M01.startGold - TOWERS.arrow.cost;
  await expect.poll(() => battlePage.gold()).toBe(gold);

  for (const viewport of [VIEWPORTS.phoneLandscape, VIEWPORTS.phone]) {
    await page.setViewportSize(viewport);
    await expect.poll(() => battlePage.gold()).toBe(gold);
    await expect(battlePage.anySlot(8)).not.toHaveAccessibleName(/^Ô số 8$/);
    await expect(battlePage.waveNumber(1, M01.waves)).toBeVisible();
    await expect
      .poll(async () => {
        const fit = await battlePage.canvasFit();
        return fit !== null && fit.canvas.h <= fit.frame.h + 1 && fit.canvas.w <= fit.frame.w + 1;
      })
      .toBe(true);
  }
});

test("ở bố cục ngang hẹp vẫn xây được đủ ba bước", { tag: ["@TC-RESPONSIVE-005"] }, async ({ page, enterBattle, battlePage }) => {
  await page.setViewportSize(VIEWPORTS.phoneLandscape);
  await enterBattle();
  await battlePage.slot(8).click();
  await battlePage.towerCard("arrow").click();
  expect(await battlePage.fullyInViewport(battlePage.confirmBuildButton())).toBe(true);
  await battlePage.confirmBuildButton().click();
  await expect.poll(() => battlePage.gold()).toBe(M01.startGold - TOWERS.arrow.cost);
});
