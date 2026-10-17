import { test, expect } from "@/fixtures";
import { t } from "@/data/copy";
import { TOWERS, VIEWPORTS } from "@/data/test-data";

// FR-08 · FR-33 · ADR-0009: building takes three actions — pick the slot, pick the type, confirm — and only the third
// spends gold. A stray tap never builds, and the tower's numbers are on screen before the money goes.

test.use({ viewport: VIEWPORTS.desktop });

test("chạm ô trống chỉ chọn ô, không trừ vàng", { tag: ["@TC-BUILD-001", "@smoke"] }, async ({ enterBattle, battlePage }) => {
  await enterBattle();
  await battlePage.slot(8).click();
  await expect(battlePage.slot(8)).toHaveAttribute("aria-pressed", "true");
  expect(await battlePage.gold()).toBe(260);
  await expect(battlePage.towerCard("arrow")).toContainText(String(TOWERS.arrow.cost));
  await expect(battlePage.towerCard("cannon")).toContainText(String(TOWERS.cannon.cost));
  await expect(battlePage.towerCard("frost")).toContainText(String(TOWERS.frost.cost));
  await expect(battlePage.pickTowerFirstButton()).toBeDisabled();
});

test("chạm thẻ tháp chỉ chọn loại và hiện số liệu trước khi trả tiền", { tag: ["@TC-BUILD-002", "@smoke"] }, async ({
  enterBattle,
  battlePage,
}) => {
  await enterBattle();
  await battlePage.slot(8).click();
  await battlePage.towerCard("arrow").click();
  await expect(battlePage.towerCard("arrow")).toHaveAttribute("aria-pressed", "true");
  expect(await battlePage.gold()).toBe(260);
  await expect(battlePage.stat("battle.statDamage")).toHaveText(String(TOWERS.arrow.damage[0]));
  await expect(battlePage.stat("battle.statRange")).toHaveText(String(TOWERS.arrow.range));
  // 50 ticks / 60 = 0.83 s, shown with one decimal and the vi decimal comma
  await expect(battlePage.stat("battle.statRate")).toHaveText(t("battle.seconds", { n: 0.8 }));
  await expect(battlePage.confirmBuildButton()).toHaveText(t("battle.confirmBuild", { cost: TOWERS.arrow.cost }));
});

test("chỉ nút XÂY mới trừ tiền và ô thành ô đã xây", { tag: ["@TC-BUILD-003", "@smoke"] }, async ({ enterBattle, battlePage }) => {
  await enterBattle();
  await battlePage.build(8, "arrow");
  await expect.poll(() => battlePage.gold()).toBe(260 - TOWERS.arrow.cost);
  await battlePage.slot(3).click();
  await expect(battlePage.builtSlot(8)).toHaveCount(1);
  await expect(battlePage.slot(3)).toHaveCount(1);
});

test("không đủ vàng thì thẻ tháp bị vô hiệu và đổi icon xu thành icon khoá", { tag: ["@TC-BUILD-004"] }, async ({
  enterBattle,
  battlePage,
}) => {
  await enterBattle();
  const affordableIcon = await battlePage.towerCardPriceIcon("arrow").innerHTML();

  await battlePage.build(8, "cannon");
  await battlePage.build(9, "cannon");
  await expect.poll(() => battlePage.gold()).toBe(260 - 2 * TOWERS.cannon.cost);

  for (const tower of ["arrow", "cannon", "frost"] as const) {
    await expect(battlePage.towerCard(tower)).toBeDisabled();
  }
  expect(await battlePage.towerCardPriceIcon("arrow").innerHTML()).not.toBe(affordableIcon);
});

test("vàng vừa đúng bằng giá thì thẻ vẫn chọn và xây được", { tag: ["@TC-BUILD-005"] }, async ({ enterBattle, battlePage }) => {
  await enterBattle();
  await battlePage.build(8, "cannon");
  await battlePage.build(9, "frost");
  await expect.poll(() => battlePage.gold()).toBe(TOWERS.arrow.cost);

  await battlePage.slot(3).click();
  await expect(battlePage.towerCard("arrow")).toBeEnabled();
  await expect(battlePage.towerCard("cannon")).toBeDisabled();
  await expect(battlePage.towerCard("frost")).toBeDisabled();
  await battlePage.towerCard("arrow").click();
  await battlePage.confirmBuildButton().click();
  await expect.poll(() => battlePage.gold()).toBe(0);
});

test("Huỷ và Esc bỏ chọn mà không trừ vàng", { tag: ["@TC-BUILD-006"] }, async ({ page, enterBattle, battlePage }) => {
  await enterBattle();

  await battlePage.slot(8).click();
  await battlePage.towerCard("arrow").click();
  await battlePage.cancelButton().click();
  await expect(battlePage.slot(8)).toHaveAttribute("aria-pressed", "false");
  await expect(battlePage.confirmBuildButton()).toHaveCount(0);
  expect(await battlePage.gold()).toBe(260);

  await battlePage.slot(9).click();
  await battlePage.towerCard("frost").click();
  await page.keyboard.press("Escape");
  await expect(battlePage.slot(9)).toHaveAttribute("aria-pressed", "false");
  await expect(battlePage.confirmBuildButton()).toHaveCount(0);
  expect(await battlePage.gold()).toBe(260);
});

test("chọn loại tháp trước rồi chạm ô vẫn phải bấm xác nhận", { tag: ["@TC-BUILD-007"] }, async ({ page, enterBattle, battlePage }) => {
  await enterBattle();
  await page.keyboard.press("1");
  await expect(battlePage.towerCard("arrow")).toHaveAttribute("aria-pressed", "true");

  await battlePage.slot(8).click();
  await expect(battlePage.confirmBuildButton()).toHaveText(t("battle.confirmBuild", { cost: TOWERS.arrow.cost }));
  expect(await battlePage.gold()).toBe(260);

  await battlePage.confirmBuildButton().click();
  await expect.poll(() => battlePage.gold()).toBe(260 - TOWERS.arrow.cost);
});

test("chạm lại thẻ đang chọn thì bỏ chọn loại tháp", { tag: ["@TC-BUILD-008"] }, async ({ enterBattle, battlePage }) => {
  await enterBattle();
  await battlePage.slot(8).click();
  await battlePage.towerCard("cannon").click();
  await expect(battlePage.towerCard("cannon")).toHaveAttribute("aria-pressed", "true");
  await battlePage.towerCard("cannon").click();
  await expect(battlePage.towerCard("cannon")).toHaveAttribute("aria-pressed", "false");
  await expect(battlePage.pickTowerFirstButton()).toBeDisabled();
  expect(await battlePage.gold()).toBe(260);
});

test("chọn lại ô đã xây không mở bảng xây chồng lên tháp", { tag: ["@TC-BUILD-009"] }, async ({ enterBattle, battlePage }) => {
  await enterBattle();
  await battlePage.build(8, "arrow");
  await expect.poll(() => battlePage.gold()).toBe(200);
  await battlePage.slot(3).click();
  await battlePage.builtSlot(8).click();
  await expect(battlePage.towerTitle("arrow", 1)).toBeVisible();
  await expect(battlePage.confirmBuildButton()).toHaveCount(0);
  await expect(battlePage.pickTowerFirstButton()).toHaveCount(0);
  expect(await battlePage.gold()).toBe(200);
});
