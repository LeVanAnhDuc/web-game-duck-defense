import { test, expect } from "@/fixtures";
import { M01, TOWERS, VIEWPORTS } from "@/data/test-data";

// FR-02 · FR-06 · FR-10 · FR-22 · FR-24 · NFR-PERF-06: waves, what they pay, what they cost, speed and pause.
// Cases that play a wave to its end run on a fake clock (BattlePage.useFakeClock): one frame = 200 ms of game time.

test.use({ viewport: VIEWPORTS.desktop });

const GRUNT_BOUNTY = 11; // ../client/src/data/enemies.ts → grunt.bounty

test("trước đợt đầu thanh tiến độ ở 0 và dải Đợt tới báo 5 Lính", { tag: ["@TC-WAVE-001", "@smoke"] }, async ({
  enterBattle,
  battlePage,
}) => {
  await enterBattle();
  await expect(battlePage.waveNumber(1, M01.waves)).toBeVisible();
  await expect(battlePage.waveBar()).toHaveAttribute("aria-valuenow", "0");
  await expect(battlePage.nextWaveEntry(M01.firstWave.grunt, "grunt")).toBeVisible();
  await expect(battlePage.callWaveButton()).toHaveAttribute("aria-disabled", "false");
});

test("đang có đợt thì nút gọi đợt tắt mà vẫn ở trong tab order", { tag: ["@TC-WAVE-002"] }, async ({ enterBattle, battlePage }) => {
  await enterBattle();
  await battlePage.callWave();
  const button = battlePage.callWaveButton();
  await expect(button).toHaveAttribute("aria-disabled", "true");
  await expect(button).not.toHaveAttribute("disabled", /.*/);
  await button.focus();
  await expect(button).toBeFocused();
  // force: Playwright treats aria-disabled as disabled and would otherwise wait for the wave to end
  await button.click({ force: true });
  await expect(battlePage.waveNumber(1, M01.waves)).toBeVisible();
  await expect(battlePage.waveBar()).toHaveAttribute("aria-valuenow", "0");
});

test("hết đợt 1 thì tiến độ lên 1, sang Đợt 2 và nút gọi đợt bật lại", { tag: ["@TC-WAVE-003", "@smoke"] }, async ({
  enterBattle,
  battlePage,
}) => {
  await battlePage.useFakeClock();
  await enterBattle();
  await battlePage.warmUp();
  await battlePage.speedOption(3).click();
  await battlePage.callWave();
  await battlePage.finishWave();

  await expect(battlePage.waveBar()).toHaveAttribute("aria-valuenow", "1");
  await expect(battlePage.waveNumber(2, M01.waves)).toBeVisible();
  await expect(battlePage.nextWaveEntry(M01.secondWave.grunt, "grunt")).toBeVisible();
  await expect(battlePage.callWaveButton()).toHaveAttribute("aria-disabled", "false");
});

test("tháp diệt Lính thì mỗi con ra đúng 11 vàng", { tag: ["@TC-WAVE-004", "@smoke"] }, async ({ enterBattle, battlePage }) => {
  await battlePage.useFakeClock();
  await enterBattle();
  await battlePage.warmUp();
  // three archers around the first stretch of road: wave 1 is wiped out
  for (const slot of [8, 9, 3]) await battlePage.build(slot, "arrow");
  await battlePage.advance(2);
  const afterBuilding = M01.startGold - 3 * TOWERS.arrow.cost;
  await expect.poll(() => battlePage.gold()).toBe(afterBuilding);

  await battlePage.speedOption(3).click();
  await battlePage.callWave();
  await battlePage.finishWave();

  await expect.poll(() => battlePage.gold()).toBe(afterBuilding + M01.firstWave.grunt * GRUNT_BOUNTY);
  expect(await battlePage.lives()).toBe(M01.startLives);
});

test("Lính đi hết đường thì mỗi con trừ một mạng", { tag: ["@TC-WAVE-005", "@smoke"] }, async ({ enterBattle, battlePage }) => {
  await battlePage.useFakeClock();
  await enterBattle();
  await battlePage.warmUp();
  await battlePage.speedOption(3).click();
  await battlePage.callWave();
  await battlePage.finishWave();

  await expect.poll(() => battlePage.lives()).toBe(M01.startLives - M01.firstWave.grunt);
  expect(await battlePage.gold()).toBe(M01.startGold);
});

test("tốc độ mặc định x1 và đổi được sang x2, x3", { tag: ["@TC-WAVE-006"] }, async ({ enterBattle, battlePage }) => {
  await enterBattle();
  await expect(battlePage.speedOption(1)).toHaveAttribute("aria-checked", "true");
  await expect(battlePage.speedOption(2)).toHaveAttribute("aria-checked", "false");
  await expect(battlePage.speedOption(3)).toHaveAttribute("aria-checked", "false");

  await battlePage.speedOption(2).click();
  await expect(battlePage.speedOption(2)).toHaveAttribute("aria-checked", "true");
  await expect(battlePage.speedOption(1)).toHaveAttribute("aria-checked", "false");

  await battlePage.speedOption(3).click();
  await expect(battlePage.speedOption(3)).toHaveAttribute("aria-checked", "true");
  await expect(battlePage.speedOption(2)).toHaveAttribute("aria-checked", "false");
});

test("cùng một đợt ở x1 và x3 mất đúng số mạng như nhau", { tag: ["@TC-WAVE-007"] }, async ({
  enterBattle,
  battlePage,
  mapSelectPage,
}) => {
  await battlePage.useFakeClock();
  await enterBattle();
  await battlePage.warmUp();
  await battlePage.callWave(); // x1
  await battlePage.finishWave({ maxFrames: 1200 });
  const livesAtX1 = await battlePage.lives();

  // a fresh battle on the same map, this time at x3
  await battlePage.backButton().click();
  await mapSelectPage.pick("m01");
  await battlePage.waitReady();
  await battlePage.warmUp();
  await battlePage.speedOption(3).click();
  await battlePage.callWave();
  await battlePage.finishWave();

  expect(livesAtX1).toBe(M01.startLives - M01.firstWave.grunt);
  await expect.poll(() => battlePage.lives()).toBe(livesAtX1);
});

test("tạm dừng làm trận đứng yên và Tiếp tục chạy lại", { tag: ["@TC-WAVE-008"] }, async ({ enterBattle, battlePage }) => {
  await battlePage.useFakeClock();
  await enterBattle();
  await battlePage.warmUp();
  await battlePage.speedOption(3).click();
  await battlePage.callWave();
  await battlePage.advance(20); // 4 s: the grunts are on the road

  await battlePage.pauseButton().click();
  await expect(battlePage.resumeButton()).toHaveAttribute("aria-pressed", "true");
  await battlePage.advance(300); // 60 s of time, far more than a wave needs
  expect(await battlePage.lives()).toBe(M01.startLives);
  await expect(battlePage.waveBar()).toHaveAttribute("aria-valuenow", "0");

  await battlePage.resumeButton().click();
  await expect(battlePage.pauseButton()).toHaveAttribute("aria-pressed", "false");
  await battlePage.finishWave();
  await expect.poll(() => battlePage.lives()).toBe(M01.startLives - M01.firstWave.grunt);
});
