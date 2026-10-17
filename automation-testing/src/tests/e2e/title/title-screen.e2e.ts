import { test, expect } from "@/fixtures";
import { cleared, profile } from "@/data/profiles";
import { MAPS } from "@/data/test-data";

// FR-14 · FR-34 · US-01 · US-03: what the title screen shows, and where PLAY goes.

test("lần đầu mở thấy một nút CHƠI, hai lối phụ, cài đặt và chân trang trống", { tag: ["@TC-TITLE-001", "@smoke"] }, async ({
  titlePage,
}) => {
  await titlePage.goto();
  await expect(titlePage.heading()).toHaveText("Duck Defense");
  await expect(titlePage.tagline()).toBeVisible();
  await expect(titlePage.playButton()).toBeVisible();
  await expect(titlePage.mapSelectButton()).toBeVisible();
  await expect(titlePage.workshopButton()).toBeVisible();
  await expect(titlePage.settingsButton()).toBeVisible();
  await expect(titlePage.mapsUnlocked(1)).toBeVisible();
  await expect(titlePage.coresHeld()).toHaveText("0");
  await expect(titlePage.lastMapLine()).toHaveCount(0);
});

test("người mới bấm CHƠI vào thẳng trận Đồng Cỏ ở đợt 1", { tag: ["@TC-TITLE-002", "@smoke"] }, async ({
  titlePage,
  battlePage,
  mapSelectPage,
}) => {
  await titlePage.goto();
  await titlePage.play();
  await battlePage.waitReady();
  await expect(battlePage.canvas()).toBeVisible();
  await expect(mapSelectPage.heading()).toHaveCount(0);
  await expect(battlePage.waveNumber(1, MAPS.m01.waves)).toBeVisible();
  expect(await battlePage.gold()).toBe(MAPS.m01.startGold);
  expect(await battlePage.lives()).toBe(MAPS.m01.startLives);
});

test("có tiến trình thì nút vẫn là CHƠI và dòng phụ gọi con số là kỷ lục", { tag: ["@TC-TITLE-003"] }, async ({ titlePage }) => {
  await titlePage.seedProfile(
    profile({ maps: { m01: cleared(), m02: cleared(11, 14), m03: { bestWave: 6 } }, lastMap: "m03" }),
  );
  await titlePage.goto();
  await expect(titlePage.playButton()).toBeVisible();
  await expect(titlePage.continueButton()).toHaveCount(0);
  await expect(titlePage.lastMapLine()).toHaveText("Đầm Sương · kỷ lục đợt 6 / 14");
});

test("CHƠI khi có tiến trình vào bản đồ chơi gần nhất", { tag: ["@TC-TITLE-004"] }, async ({ titlePage, battlePage }) => {
  await titlePage.seedProfile(profile({ maps: { m01: cleared() }, lastMap: "m02" }));
  await titlePage.goto();
  await titlePage.play();
  await battlePage.waitReady();
  await expect(battlePage.waveNumber(1, MAPS.m02.waves)).toBeVisible();
  expect(await battlePage.gold()).toBe(MAPS.m02.startGold);
  expect(await battlePage.lives()).toBe(MAPS.m02.startLives);
});

test("chưa có bản đồ chơi gần nhất thì CHƠI vào bản đồ mở cuối cùng", { tag: ["@TC-TITLE-005"] }, async ({
  titlePage,
  battlePage,
}) => {
  await titlePage.seedProfile(profile({ maps: { m01: cleared() }, lastMap: null }));
  await titlePage.goto();
  await titlePage.play();
  await battlePage.waitReady();
  await expect(battlePage.waveNumber(1, MAPS.m02.waves)).toBeVisible();
  expect(await battlePage.gold()).toBe(MAPS.m02.startGold);
});

test("chân trang đếm số bản đồ đã mở và số lõi đang giữ", { tag: ["@TC-TITLE-006"] }, async ({ titlePage }) => {
  await titlePage.seedProfile(profile({ cores: 340, maps: { m01: cleared(), m02: cleared(11, 14) } }));
  await titlePage.goto();
  await expect(titlePage.mapsUnlocked(3)).toBeVisible();
  await expect(titlePage.coresHeld()).toHaveText("340");
});

test("tới chọn bản đồ, xưởng, cài đặt và Quay lại về màn tiêu đề", { tag: ["@TC-TITLE-007"] }, async ({
  titlePage,
  mapSelectPage,
  workshopPage,
  settingsPage,
}) => {
  await titlePage.goto();

  await titlePage.openMapSelect();
  await expect(mapSelectPage.heading()).toBeVisible();
  await mapSelectPage.backButton().click();
  await expect(titlePage.playButton()).toBeVisible();

  await titlePage.openWorkshop();
  await expect(workshopPage.heading()).toBeVisible();
  await workshopPage.backButton().click();
  await expect(titlePage.playButton()).toBeVisible();

  await titlePage.openSettings();
  await expect(settingsPage.heading()).toBeVisible();
  await settingsPage.backButton().click();
  await expect(titlePage.playButton()).toBeVisible();
});
