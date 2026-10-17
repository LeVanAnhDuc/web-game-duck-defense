import { test, expect } from "@/fixtures";
import { M01, VIEWPORTS } from "@/data/test-data";

// NFR-A11Y-03 · FR-19 / NFR-A11Y-05: hit areas a thumb can use on a 375px phone, and no interface motion for players
// who asked their system for less.

const MIN = 44;
const ROUNDING = 0.5;

test("ở 375px mọi ô, thẻ tháp và nút trận rộng ít nhất 44 x 44", { tag: ["@TC-ACCESSIBILITY-007"] }, async ({
  page,
  enterBattle,
  battlePage,
}) => {
  await page.setViewportSize(VIEWPORTS.phone);
  await enterBattle();
  await battlePage.slot(8).click();

  const targets = [
    ...Array.from({ length: M01.slots }, (_, i) => [`slot ${i + 1}`, battlePage.anySlot(i + 1)] as const),
    ["archer card", battlePage.towerCard("arrow")] as const,
    ["cannon card", battlePage.towerCard("cannon")] as const,
    ["frost card", battlePage.towerCard("frost")] as const,
    ["back", battlePage.backButton()] as const,
    ["pause", battlePage.pauseButton()] as const,
  ];
  for (const [name, target] of targets) {
    const box = await target.boundingBox();
    expect(box, `${name} is not on screen`).not.toBeNull();
    expect(box!.width, `${name} width`).toBeGreaterThanOrEqual(MIN - ROUNDING);
    expect(box!.height, `${name} height`).toBeGreaterThanOrEqual(MIN - ROUNDING);
  }

  await battlePage.cancelButton().click();
  const callWave = await battlePage.callWaveButton().boundingBox();
  expect(callWave!.width).toBeGreaterThanOrEqual(MIN - ROUNDING);
  expect(callWave!.height).toBeGreaterThanOrEqual(MIN - ROUNDING);
});

test("bật giảm chuyển động thì nút không còn hiệu ứng chuyển tiếp", { tag: ["@TC-ACCESSIBILITY-009"] }, async ({ page, titlePage }) => {
  const transitionSeconds = async () =>
    titlePage.playButton().evaluate((el) => {
      const d = getComputedStyle(el).transitionDuration.split(",")[0].trim();
      return d.endsWith("ms") ? Number.parseFloat(d) / 1000 : Number.parseFloat(d);
    });

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await titlePage.goto();
  expect(await transitionSeconds()).toBeGreaterThan(0.01);

  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await transitionSeconds()).toBeLessThanOrEqual(0.001);
});
