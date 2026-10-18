import { test, expect } from "@/fixtures";
import type { BattlePage } from "@/pages/battle.page";
import type { TitlePage } from "@/pages/title.page";
import { t } from "@/data/copy";
import { profile } from "@/data/profiles";
import { COMBAT_SCENARIOS, ENEMIES, FIRST_WAVES, M01, TOWERS, UPGRADES, VIEWPORTS } from "@/data/test-data";

// FR-04 · FR-20 · FR-21 · FR-33 · README "Five tower lines — fast single-target, splash cannon, area slow, wide-splash
// bolt and armour-piercing venom". Battles play Đồng Cỏ's first wave (5 Lính) on a frozen clock
// (BattlePage.useFrozenClock): one frame = exactly 200 ms of game time at x1, i.e. 12 simulation ticks.

test.use({ viewport: VIEWPORTS.desktop });

const FRAME_S = 0.2;
const TICKS_PER_FRAME = 12;
// arrowDamage 3 is the prerequisite of unlockBolt, unlockBolt the one of unlockVenom (../client/src/data/upgradeTree.ts)
const BOTH_UNLOCKED = { arrowDamage: UPGRADES.unlockBolt.needs.level, unlockBolt: 1, unlockVenom: 1 };

test("một Pháo diệt hai Lính bằng cùng một phát nổ lan", { tag: ["@TC-COMBAT-007"] }, async ({ titlePage, battlePage }) => {
  await battlePage.useFrozenClock();
  await titlePage.goto();
  await battlePage.press(titlePage.playButton());
  await battlePage.waitReady();
  await battlePage.warmUp();
  await battlePage.build(9, "cannon");
  await battlePage.callWave();
  const { goldSteps } = await battlePage.traceWave();

  // one cannon reloads every 110 ticks and a frame carries 12: two kills inside one frame come from one shell
  expect(TOWERS.cannon.cooldownTicks).toBeGreaterThan(TICKS_PER_FRAME);
  expect(goldSteps.map((step) => step.delta)).toContain(2 * ENEMIES.grunt.bounty);
});

test("Băng làm Lính tới cuối đường muộn hơn mà không diệt con nào", { tag: ["@TC-COMBAT-008"] }, async ({
  titlePage,
  battlePage,
}) => {
  await battlePage.useFrozenClock();
  await titlePage.goto();
  await battlePage.press(titlePage.playButton());
  await battlePage.waitReady();
  await battlePage.warmUp();
  await battlePage.build(10, "frost");
  const gold = await battlePage.gold();
  await battlePage.callWave();
  const { leakFrames } = await battlePage.traceWave();

  // unslowed, the first grunt needs road / speed seconds (TC-COMBAT-002 measures it); slowed, at least 10% longer
  const unslowed = FIRST_WAVES.m01.roadLength / ENEMIES.grunt.speed;
  expect(leakFrames[0] * FRAME_S).toBeGreaterThan(unslowed * 1.1);
  expect(await battlePage.lives()).toBe(M01.startLives - M01.firstWave.grunt);
  expect(await battlePage.gold()).toBe(gold);
});

test("chưa mở khoá thì bảng xây chỉ có Cung, Pháo, Băng", { tag: ["@TC-COMBAT-009"] }, async ({ enterBattle, battlePage }) => {
  await enterBattle();
  await battlePage.slot(8).click();
  await expect(battlePage.towerCardButtons()).toHaveCount(3);
  for (const tower of ["arrow", "cannon", "frost"] as const) await expect(battlePage.towerCard(tower)).toBeVisible();
  await expect(battlePage.towerCard("bolt")).toHaveCount(0);
  await expect(battlePage.towerCard("venom")).toHaveCount(0);
});

test("mở khoá Sét và Độc thì có năm dòng tháp, mỗi thẻ báo mô tả và số liệu trước khi trả tiền", {
  tag: ["@TC-COMBAT-010"],
}, async ({ titlePage, enterBattle, battlePage }) => {
  // +50 start gold (Tiền khởi đầu bậc 1): 310 gold, so Độc (300) is affordable and its card can be picked (REQ-BUILD-04)
  await titlePage.seedProfile(profile({ upgrades: { ...BOTH_UNLOCKED, startGold: 1 } }));
  await enterBattle();
  const gold = await battlePage.gold();
  await battlePage.slot(8).click();
  await expect(battlePage.towerCardButtons()).toHaveCount(5);

  await battlePage.towerCard("bolt").click();
  await expect(battlePage.towerCard("bolt")).toContainText(String(TOWERS.bolt.cost));
  await expect(battlePage.towerDescription("bolt")).toBeVisible();
  await expect(battlePage.stat("battle.statDamage")).toHaveText(String(TOWERS.bolt.damage[0]));
  await expect(battlePage.stat("battle.statRange")).toHaveText(String(TOWERS.bolt.range));
  await expect(battlePage.stat("battle.statRate")).toHaveText(t("battle.seconds", { n: 1 })); // 60 ticks

  await battlePage.towerCard("venom").click();
  await expect(battlePage.towerCard("venom")).toContainText(String(TOWERS.venom.cost));
  await expect(battlePage.towerDescription("venom")).toBeVisible(); // "Xuyên giáp, …": the pierce is said before paying
  await expect(battlePage.stat("battle.statDamage")).toHaveText(String(TOWERS.venom.damage[0]));
  await expect(battlePage.stat("battle.statRange")).toHaveText(String(TOWERS.venom.range));
  await expect(battlePage.stat("battle.statRate")).toHaveText(t("battle.seconds", { n: 0.7 })); // 40 ticks
  expect(await battlePage.gold()).toBe(gold);
});

test("xây Độc trừ đúng giá và ô thành tháp Độc bậc 1", { tag: ["@TC-COMBAT-011"] }, async ({
  titlePage,
  enterBattle,
  battlePage,
}) => {
  // +50 start gold (Tiền khởi đầu bậc 1): 310 gold, enough for one venom
  await titlePage.seedProfile(profile({ upgrades: { ...BOTH_UNLOCKED, startGold: 1 } }));
  await enterBattle();
  const gold = await battlePage.gold();
  await battlePage.build(8, "venom");
  await expect.poll(() => battlePage.gold()).toBe(gold - TOWERS.venom.cost);
  await battlePage.anySlot(8).click();
  await expect(battlePage.towerTitle("venom", 1)).toBeVisible();
});

// Sét on Đồng Cỏ's first wave. One bolt reloads every 60 ticks and a frame carries 12, so a frame whose gold rises by two
// bounties holds one strike that killed two grunts. decisions/combat.md Q9.
const BOLT = COMBAT_SCENARIOS.boltSplash;

async function traceOneTower(titlePage: TitlePage, battlePage: BattlePage, tower: "bolt" | "cannon") {
  await titlePage.seedProfile(profile({ upgrades: { arrowDamage: UPGRADES.unlockBolt.needs.level, unlockBolt: 1 } }));
  await battlePage.useFrozenClock();
  await titlePage.goto();
  await battlePage.press(titlePage.playButton());
  await battlePage.waitReady();
  await battlePage.warmUp();
  await battlePage.build(BOLT.slot, tower);
  const gold = await battlePage.gold();
  await battlePage.callWave();
  const trace = await battlePage.traceWave();
  return { ...trace, gained: (await battlePage.gold()) - gold };
}

test("Sét nổ lan: hai phát, mỗi phát diệt hai Lính", { tag: ["@TC-COMBAT-012"] }, async ({ titlePage, battlePage }) => {
  const bolt = await traceOneTower(titlePage, battlePage, "bolt");

  expect(TOWERS.bolt.cooldownTicks).toBeGreaterThan(TICKS_PER_FRAME);
  expect(bolt.goldSteps.filter((step) => step.delta === 2 * ENEMIES.grunt.bounty)).toHaveLength(BOLT.doubleKillStrikes);
  for (const step of bolt.goldSteps) expect(step.delta % ENEMIES.grunt.bounty).toBe(0);
  expect(bolt.gained / ENEMIES.grunt.bounty).toBeGreaterThanOrEqual(2 * BOLT.doubleKillStrikes);
});

test("một Pháo ở cùng ô với Sét chỉ diệt được một Lính cả đợt", { tag: ["@TC-COMBAT-015"] }, async ({
  titlePage,
  battlePage,
}) => {
  // the control for TC-COMBAT-012: same slot, same wave, a cannon (radius 30) instead of a bolt (radius 44)
  const cannon = await traceOneTower(titlePage, battlePage, "cannon");
  expect(TOWERS.bolt.splashRadius).toBeGreaterThan(TOWERS.cannon.splashRadius);
  expect(cannon.gained / ENEMIES.grunt.bounty).toBe(BOLT.cannonKills);
  expect(cannon.goldSteps.every((step) => step.delta === ENEMIES.grunt.bounty)).toBe(true);
  expect(cannon.gained / ENEMIES.grunt.bounty).toBeLessThan(2 * BOLT.doubleKillStrikes);
});
