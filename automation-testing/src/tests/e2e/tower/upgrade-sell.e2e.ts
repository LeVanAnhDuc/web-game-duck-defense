import { test, expect } from "@/fixtures";
import { t } from "@/data/copy";
import { TOWERS, VIEWPORTS } from "@/data/test-data";

// FR-09 · FR-05: a built tower's panel, upgrading it to the last level, and selling it back.
// The panel holds a RESOLVED copy of the tower (level, prices); the first version only re-resolved it after a
// build, not after an upgrade — so it kept the old level and price while the real price had moved.

test.use({ viewport: VIEWPORTS.desktop });

const arrow = TOWERS.arrow;

test("chọn tháp đã xây hiện bậc, sát thương, giá nâng và giá bán", { tag: ["@TC-TOWER-001", "@smoke"] }, async ({
  enterBattle,
  battlePage,
}) => {
  await enterBattle();
  await battlePage.build(8, "arrow");
  await expect(battlePage.towerTitle("arrow", 1)).toBeVisible();
  await expect(battlePage.levelOf(1)).toBeVisible();
  await expect(battlePage.selectedDamage()).toHaveText(`${arrow.damage[0]} → ${arrow.damage[1]}`);
  await expect(battlePage.upgradeButton(arrow.upgrade[0])).toBeEnabled();
  await expect(battlePage.sellButton()).toHaveText(`${t("tower.sell")}+${arrow.cost / 2}`);
  await expect(battlePage.towerSlot("arrow", 1, 8)).toHaveCount(1);
});

test("nâng cấp trừ tiền và làm mới panel sang bậc và giá mới", { tag: ["@TC-TOWER-002", "@smoke"] }, async ({
  enterBattle,
  battlePage,
}) => {
  await enterBattle();
  await battlePage.build(8, "arrow");
  await battlePage.upgradeButton(arrow.upgrade[0]).click();

  await expect.poll(() => battlePage.gold()).toBe(260 - arrow.cost - arrow.upgrade[0]);
  await expect(battlePage.towerTitle("arrow", 2)).toBeVisible();
  await expect(battlePage.selectedDamage()).toHaveText(`${arrow.damage[1]} → ${arrow.damage[2]}`);
  await expect(battlePage.upgradeButton(arrow.upgrade[1])).toBeVisible();
  await expect(battlePage.upgradeButton(arrow.upgrade[0])).toHaveCount(0);
});

test("nâng tới bậc cuối thì panel nói Đã tối đa", { tag: ["@TC-TOWER-003"] }, async ({ enterBattle, battlePage }) => {
  await enterBattle();
  await battlePage.build(8, "arrow");
  await battlePage.upgradeButton(arrow.upgrade[0]).click();
  await battlePage.upgradeButton(arrow.upgrade[1]).click();

  await expect(battlePage.towerTitle("arrow", 3)).toBeVisible();
  await expect(battlePage.maxLevel()).toBeVisible();
  await expect(battlePage.upgradeButton()).toHaveCount(0);
  await expect.poll(() => battlePage.gold()).toBe(260 - arrow.cost - arrow.upgrade[0] - arrow.upgrade[1]);
});

test("không đủ vàng thì nút Nâng bị vô hiệu", { tag: ["@TC-TOWER-004"] }, async ({ enterBattle, battlePage }) => {
  await enterBattle();
  await battlePage.build(8, "cannon");
  await battlePage.build(9, "cannon");
  await expect.poll(() => battlePage.gold()).toBe(260 - 2 * TOWERS.cannon.cost);

  const upgrade = battlePage.upgradeButton(TOWERS.cannon.upgrade[0]);
  await expect(upgrade).toBeDisabled();
  await upgrade.click({ force: true });
  await expect(battlePage.towerTitle("cannon", 1)).toBeVisible();
  expect(await battlePage.gold()).toBe(40);
});

test("bán trả lại nửa giá và ô đó xây lại được", { tag: ["@TC-TOWER-005", "@smoke"] }, async ({ enterBattle, battlePage }) => {
  await enterBattle();
  await battlePage.build(8, "arrow");
  await expect.poll(() => battlePage.gold()).toBe(200);

  await battlePage.sellButton().click();
  await expect.poll(() => battlePage.gold()).toBe(230); // half of 60, rounded down
  await expect(battlePage.slot(8)).toHaveCount(1);

  await battlePage.build(8, "arrow");
  await expect.poll(() => battlePage.gold()).toBe(170);
});

test("bán tháp đã nâng trả nửa tổng giá xây cộng giá nâng", { tag: ["@TC-TOWER-006"] }, async ({ enterBattle, battlePage }) => {
  await enterBattle();
  await battlePage.build(8, "arrow");
  await battlePage.upgradeButton(arrow.upgrade[0]).click();
  await expect.poll(() => battlePage.gold()).toBe(140);

  const refund = Math.floor((arrow.cost + arrow.upgrade[0]) * 0.5);
  await expect(battlePage.sellButton()).toHaveText(`${t("tower.sell")}+${refund}`);
  await battlePage.sellButton().click();
  await expect.poll(() => battlePage.gold()).toBe(140 + refund);
});

test("ô đã xây đọc là đã xây, ô trống đọc như ô trống", { tag: ["@TC-TOWER-007"] }, async ({ enterBattle, battlePage }) => {
  await enterBattle();
  await battlePage.build(8, "arrow");
  // select another slot so slot 8 is no longer the selected one
  await battlePage.slot(3).click();
  await expect(battlePage.builtSlot(8)).toHaveCount(1);
  await expect(battlePage.slot(3)).toHaveCount(1);
});
