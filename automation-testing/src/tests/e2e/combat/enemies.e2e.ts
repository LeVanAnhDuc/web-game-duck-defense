import { test, expect } from "@/fixtures";
import { cleared, profile, type MapRecord } from "@/data/profiles";
import { ENEMIES, FIRST_WAVES, MAP_ORDER, MAPS, VIEWPORTS, type MapId } from "@/data/test-data";
import type { BattlePage } from "@/pages/battle.page";
import type { TitlePage } from "@/pages/title.page";

// FR-01 · FR-05 · FR-06 · FR-24 · README "Three enemy types with their own speed, armour and bounty".
// Every case plays the FIRST wave of a map whose first wave is one enemy type: Đồng Cỏ (Lính), Đèo Gió (Chạy nhanh),
// Lò Rèn Cũ (Giáp). The clock is frozen (BattlePage.useFrozenClock): one frame = exactly 200 ms of game time at x1.

test.use({ viewport: VIEWPORTS.desktop });

const FRAME_S = 0.2;
// The first leak shows up ~0.8 s after the enemy really arrives (HUD published at 10 Hz, 200 ms steps), so a measured
// speed reads a few percent LOW, never high. decisions/combat.md Q2.
const SPEED_TOLERANCE = { below: 0.08, above: 0.03 };

/** A returning player whose last map is `map` (every map before it cleared), so PLAY opens that map's battle. */
async function enterMap(titlePage: TitlePage, battlePage: BattlePage, map: MapId, upgrades: Record<string, number> = {}) {
  const maps: Partial<Record<MapId, MapRecord>> = {};
  for (const id of MAP_ORDER.slice(0, MAP_ORDER.indexOf(map))) maps[id] = cleared(MAPS[id].startLives, MAPS[id].waves);
  await titlePage.seedProfile(profile({ maps, lastMap: map, upgrades }));
  await battlePage.useFrozenClock();
  await titlePage.goto();
  await battlePage.press(titlePage.playButton());
  await battlePage.waitReady();
  await battlePage.warmUp();
}

/** Map units per second of the first enemy of the first wave: road length / time until the first life is lost. */
async function measuredSpeed(battlePage: BattlePage, map: keyof typeof FIRST_WAVES): Promise<number> {
  await battlePage.callWave();
  const { leakFrames } = await battlePage.traceWave();
  return FIRST_WAVES[map].roadLength / (leakFrames[0] * FRAME_S);
}

function expectSpeedNear(measured: number, designed: number): void {
  expect(measured).toBeGreaterThan(designed * (1 - SPEED_TOLERANCE.below));
  expect(measured).toBeLessThan(designed * (1 + SPEED_TOLERANCE.above));
}

test("dải Đợt tới gọi Chạy nhanh và Giáp bằng tên riêng", { tag: ["@TC-COMBAT-001"] }, async ({
  titlePage,
  battlePage,
  mapSelectPage,
}) => {
  // every map unlocked, last played Đèo Gió (first wave: 10 Chạy nhanh); Lò Rèn Cũ opens with 5 Giáp
  const maps: Partial<Record<MapId, MapRecord>> = {};
  for (const id of MAP_ORDER.slice(0, 4)) maps[id] = cleared(MAPS[id].startLives, MAPS[id].waves);
  await titlePage.seedProfile(profile({ maps, lastMap: "m04" }));
  await titlePage.goto();
  await titlePage.play();
  await battlePage.waitReady();
  await expect(battlePage.nextWaveEntry(FIRST_WAVES.m04.count, "runner")).toBeVisible();

  await battlePage.backButton().click();
  await mapSelectPage.pick("m05");
  await battlePage.waitReady();
  await expect(battlePage.nextWaveEntry(FIRST_WAVES.m05.count, "armored")).toBeVisible();
});

test("Lính đi khoảng 34 đơn vị mỗi giây", { tag: ["@TC-COMBAT-002"] }, async ({ titlePage, battlePage }) => {
  await enterMap(titlePage, battlePage, "m01");
  expectSpeedNear(await measuredSpeed(battlePage, "m01"), ENEMIES.grunt.speed);
});

test("Chạy nhanh đi khoảng 62 đơn vị mỗi giây và mỗi con lọt qua trừ một mạng", { tag: ["@TC-COMBAT-003"] }, async ({
  titlePage,
  battlePage,
}) => {
  await enterMap(titlePage, battlePage, "m04");
  const speed = await measuredSpeed(battlePage, "m04");
  expectSpeedNear(speed, ENEMIES.runner.speed);
  expect(speed).toBeGreaterThan(ENEMIES.grunt.speed);
  await expect.poll(() => battlePage.lives()).toBe(MAPS.m04.startLives - FIRST_WAVES.m04.count * ENEMIES.runner.leak);
});

test("Giáp đi chậm nhất, khoảng 26 đơn vị mỗi giây, và mỗi con lọt qua trừ hai mạng", { tag: ["@TC-COMBAT-004"] }, async ({
  titlePage,
  battlePage,
}) => {
  await enterMap(titlePage, battlePage, "m05");
  const speed = await measuredSpeed(battlePage, "m05");
  expectSpeedNear(speed, ENEMIES.armored.speed);
  expect(speed).toBeLessThan(ENEMIES.grunt.speed);
  await expect.poll(() => battlePage.lives()).toBe(MAPS.m05.startLives - FIRST_WAVES.m05.count * ENEMIES.armored.leak);
});

test("diệt Chạy nhanh thì mỗi con ra đúng 13 vàng", { tag: ["@TC-COMBAT-005"] }, async ({ titlePage, battlePage }) => {
  await enterMap(titlePage, battlePage, "m04");
  for (const slot of [1, 2, 6]) await battlePage.build(slot, "arrow");
  const before = await battlePage.gold();
  await battlePage.callWave();
  const { leakFrames, goldSteps } = await battlePage.traceWave();

  expect(leakFrames).toEqual([]);
  expect(await battlePage.gold()).toBe(before + FIRST_WAVES.m04.count * ENEMIES.runner.bounty);
  // every rise is a whole number of runner bounties: nothing else is paid in between
  for (const step of goldSteps) expect(step.delta % ENEMIES.runner.bounty).toBe(0);
});

test("diệt Giáp thì mỗi con ra đúng 28 vàng", { tag: ["@TC-COMBAT-006"] }, async ({ titlePage, battlePage }) => {
  // +200 start gold (Tiền khởi đầu bậc 4) pays for two cannons and two archers: the five armoured all die
  await enterMap(titlePage, battlePage, "m05", { startGold: 4 });
  await battlePage.build(2, "cannon");
  await battlePage.build(5, "cannon");
  await battlePage.build(1, "arrow");
  await battlePage.build(4, "arrow");
  const before = await battlePage.gold();
  await battlePage.callWave();
  const { leakFrames, goldSteps } = await battlePage.traceWave();

  expect(leakFrames).toEqual([]);
  expect(await battlePage.gold()).toBe(before + FIRST_WAVES.m05.count * ENEMIES.armored.bounty);
  for (const step of goldSteps) expect(step.delta % ENEMIES.armored.bounty).toBe(0);
});
