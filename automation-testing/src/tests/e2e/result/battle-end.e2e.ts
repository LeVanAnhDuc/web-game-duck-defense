import { test, expect } from "@/fixtures";
import { t } from "@/data/copy";
import { cleared, profile } from "@/data/profiles";
import { MAPS, M01, REWARDS, UPGRADES, VIEWPORTS, type TowerId } from "@/data/test-data";

// FR-06 · FR-07 · FR-15 · FR-16 · US-01 · US-02 · invariants #11: how a battle ends, what it pays, what it saves.
// Every case runs on a fake clock. "Lose fast" = build nothing and call waves back to back: map 1 runs out of lives
// in wave 3 (5 + 8 + 9 leaks against 20 lives).

test.use({ viewport: VIEWPORTS.desktop });

const LOST_AT_WAVE = 3;

test.beforeEach(async ({ battlePage }) => {
  await battlePage.useFakeClock();
});

test("hết mạng thì thua và màn kết quả báo đợt, mạng, số địch đã diệt", { tag: ["@TC-RESULT-001", "@smoke"] }, async ({
  enterBattle,
  battlePage,
  resultPage,
}) => {
  await enterBattle();
  await battlePage.warmUp();
  await battlePage.speedOption(3).click();
  await battlePage.callWavesUntilOver();

  await expect(resultPage.outcome(false)).toBeVisible();
  await expect(resultPage.mapName("m01")).toBeVisible();
  await expect(resultPage.wavesSurvived(LOST_AT_WAVE, M01.waves)).toBeVisible();
  await expect(resultPage.livesLeft(0)).toBeVisible();
  await expect(resultPage.killed(0)).toBeVisible();
});

test("thua vẫn nhận lõi theo số đợt và lõi được cộng vào tiến trình", { tag: ["@TC-RESULT-002", "@smoke"] }, async ({
  enterBattle,
  battlePage,
  resultPage,
  workshopPage,
}) => {
  await enterBattle();
  await battlePage.warmUp();
  await battlePage.speedOption(3).click();
  await battlePage.callWavesUntilOver();

  const earned = LOST_AT_WAVE * REWARDS.perWave;
  await expect(resultPage.coresEarned()).toHaveText(`+${earned}`);
  await resultPage.workshopButton().click();
  await expect(workshopPage.coresChip()).toHaveAttribute("aria-label", `${t("common.cores")}: ${earned}`);

  const saved = await workshopPage.storedProfile();
  expect(saved?.cores).toBe(earned);
  expect(saved?.maps.m01).toEqual({ cleared: false, bestWave: LOST_AT_WAVE, bestLives: 0 });
});

test(
  "thắng lần đầu Đồng Cỏ được 216 lõi kèm dòng thưởng lần đầu",
  { tag: ["@TC-RESULT-003", "@TC-RESULT-004", "@smoke"] },
  async ({ titlePage, enterBattle, battlePage, resultPage }) => {
    test.setTimeout(240_000);
    await titlePage.seedProfile(
      profile({ upgrades: { startGold: 4, arrowDamage: 4, startLives: 3, buildCost: 3, bounty: 3, cannonSplash: 3 } }),
    );
    await enterBattle();
    await battlePage.warmUp();

    // map 1's reference layout (../client/src/data/maps/m01-dong-co.ts), slot numbers as the player reads them
    const plan: [slot: number, tower: TowerId, level: number][] = [
      [8, "arrow", 3], [9, "cannon", 3], [10, "frost", 2], [4, "arrow", 3], [1, "cannon", 2], [6, "arrow", 2],
    ];
    for (const [slot, tower] of plan) await battlePage.build(slot, tower);
    const levels = new Map(plan.map(([slot]) => [slot, 1]));
    // one upgrade per call, in plan order, when gold allows — the way a player tops up between and during waves
    const spend = async () => {
      for (const [slot, , target] of plan) {
        if (levels.get(slot)! >= target) continue;
        await battlePage.anySlot(slot).click();
        const upgrade = battlePage.upgradeButton();
        if ((await upgrade.count()) && (await upgrade.isEnabled())) {
          await upgrade.click();
          levels.set(slot, levels.get(slot)! + 1);
        }
        return;
      }
    };

    await battlePage.speedOption(3).click();
    for (let wave = 0; wave < M01.waves && !(await battlePage.ended()); wave++) {
      await spend();
      await battlePage.callWave();
      await battlePage.finishWave({ between: spend });
    }

    await test.step("TC-RESULT-003 — thắng lần đầu Đồng Cỏ được 216 lõi kèm dòng thưởng lần đầu", async () => {
      await expect(resultPage.outcome(true)).toBeVisible();
      await expect(resultPage.wavesSurvived(M01.waves, M01.waves)).toBeVisible();
      await expect(resultPage.coresEarned()).toHaveText(`+${M01.waves * REWARDS.perWave + REWARDS.firstClearBonus}`);
      await expect(resultPage.firstClearLine(REWARDS.firstClearBonus)).toBeVisible();
    });

    await test.step("TC-RESULT-004 — sau lần thắng đầu bản đồ được lưu là đã qua và Bản đồ tiếp theo vào Hẻm Đá", async () => {
      const livesLeft = await resultPage.livesLeftValue();
      expect(livesLeft).toBeGreaterThan(0);
      const saved = await resultPage.storedProfile();
      expect(saved?.maps.m01).toEqual({ cleared: true, bestWave: M01.waves, bestLives: livesLeft });

      await resultPage.nextMapButton().click();
      await battlePage.waitReady();
      await expect(battlePage.waveNumber(1, MAPS.m02.waves)).toBeVisible();
      expect(await battlePage.gold()).toBe(MAPS.m02.startGold + 4 * UPGRADES.startGold.perLevel);
    });
  },
);

test(
  "chơi lại bản đồ đã qua thì lõi giảm, màn kết quả nói rõ và trạng thái đã qua còn nguyên",
  { tag: ["@TC-RESULT-005"] },
  async ({ titlePage, mapSelectPage, battlePage, resultPage }) => {
    await titlePage.seedProfile(profile({ maps: { m01: cleared(17) } }));
    await titlePage.goto();
    await titlePage.openMapSelect();
    await mapSelectPage.pick("m01");
    await battlePage.waitReady();
    await battlePage.warmUp();
    await battlePage.speedOption(3).click();
    await battlePage.callWavesUntilOver();

    await expect(resultPage.coresEarned()).toHaveText(`+${Math.floor(LOST_AT_WAVE * REWARDS.perWave * REWARDS.replayFactor)}`);
    await expect(resultPage.replayLine()).toBeVisible();
    await expect(resultPage.firstClearLine(REWARDS.firstClearBonus)).toHaveCount(0);

    await resultPage.mapSelectButton().click();
    await expect(mapSelectPage.card("m01")).toContainText(t("mapSelect.cleared"));
    await expect(mapSelectPage.card("m01")).toContainText(t("mapSelect.clearedDetail", { total: M01.waves, lives: 17 }));
  },
);

test("Chơi lại vào một trận mới của cùng bản đồ từ đợt 1", { tag: ["@TC-RESULT-006"] }, async ({
  enterBattle,
  battlePage,
  resultPage,
}) => {
  await enterBattle();
  await battlePage.warmUp();
  await battlePage.speedOption(3).click();
  await battlePage.callWavesUntilOver();

  await resultPage.retryButton().click();
  await battlePage.waitReady();
  await expect(battlePage.waveNumber(1, M01.waves)).toBeVisible();
  await expect(battlePage.waveBar()).toHaveAttribute("aria-valuenow", "0");
  expect(await battlePage.lives()).toBe(M01.startLives);
  expect(await battlePage.gold()).toBe(M01.startGold);
});

test("Chọn bản đồ từ màn kết quả thấy kỷ lục đợt vừa đạt", { tag: ["@TC-RESULT-007"] }, async ({
  enterBattle,
  battlePage,
  resultPage,
  mapSelectPage,
}) => {
  await enterBattle();
  await battlePage.warmUp();
  await battlePage.speedOption(3).click();
  await battlePage.callWavesUntilOver();

  await resultPage.mapSelectButton().click();
  await expect(mapSelectPage.heading()).toBeVisible();
  await expect(mapSelectPage.card("m01")).toContainText(t("mapSelect.best", { wave: LOST_AT_WAVE, total: M01.waves }));
});

test("tải lại giữa trận về màn tiêu đề và không lưu gì của trận dở", { tag: ["@TC-RESULT-008"] }, async ({
  enterBattle,
  titlePage,
  battlePage,
}) => {
  await enterBattle();
  await battlePage.warmUp();
  await battlePage.build(8, "arrow");
  await battlePage.speedOption(3).click();
  await battlePage.callWave();
  await battlePage.finishWave();
  await expect(battlePage.waveBar()).toHaveAttribute("aria-valuenow", "1");

  await titlePage.reload();
  await expect(titlePage.playButton()).toBeVisible();
  await expect(battlePage.goldChip()).toHaveCount(0);
  await expect(titlePage.coresHeld()).toHaveText("0");
  const saved = await titlePage.storedProfile();
  expect(saved?.maps.m01).toEqual({ cleared: false, bestWave: 0, bestLives: 0 });

  await titlePage.play();
  await battlePage.waitReady();
  expect(await battlePage.gold()).toBe(M01.startGold);
});
