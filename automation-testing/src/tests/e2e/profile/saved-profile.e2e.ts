import { test, expect } from "@/fixtures";
import { t } from "@/data/copy";
import { cleared, freshProfile, profile } from "@/data/profiles";
import { STORAGE } from "@/data/test-data";

// FR-11 · FR-25 · NFR-REL-04 · NFR-REL-05 · NFR-SEC-07 · invariants #10: the saved profile is one key, read
// defensively — a save it cannot read is kept aside and never deleted, and the player is told.

const BROKEN_JSON = '{"schemaVersion":1,"cores":';

test("đổi một cài đặt ghi ngay một khoá profile có schemaVersion 1", { tag: ["@TC-PROFILE-001"] }, async ({
  titlePage,
  settingsPage,
}) => {
  await titlePage.goto();
  await titlePage.openSettings();
  await settingsPage.setSound(50);
  await expect.poll(() => settingsPage.storageKeys()).toEqual([STORAGE.profile]);
  const saved = await settingsPage.storedProfile();
  expect(saved?.schemaVersion).toBe(1);
  expect(saved?.settings.sfx).toBeCloseTo(0.5);
  expect(saved?.cores).toBe(0);
});

test("profile JSON vỡ được giữ nguyên văn, game bắt đầu mới và nói rõ", { tag: ["@TC-PROFILE-002", "@smoke"] }, async ({
  titlePage,
}) => {
  await titlePage.seedProfile(BROKEN_JSON);
  await titlePage.goto();
  await expect(titlePage.mapsUnlocked(1)).toBeVisible();
  await expect(titlePage.coresHeld()).toHaveText("0");
  await expect(titlePage.storageNotice()).toContainText(t("storage.recovered"));
  expect(await titlePage.corruptProfileCopies()).toEqual([BROKEN_JSON]);
});

test("profile sai schemaVersion được giữ lại và game bắt đầu mới", { tag: ["@TC-PROFILE-003"] }, async ({ titlePage }) => {
  const future = JSON.stringify({ ...freshProfile(), schemaVersion: 2, cores: 999 });
  await titlePage.seedProfile(future);
  await titlePage.goto();
  await expect(titlePage.coresHeld()).toHaveText("0");
  await expect(titlePage.storageNotice()).toContainText(t("storage.recovered"));
  expect(await titlePage.corruptProfileCopies()).toEqual([future]);
});

test("một trường sai được sửa về mặc định, phần còn lại giữ nguyên", { tag: ["@TC-PROFILE-004", "@smoke"] }, async ({
  titlePage,
}) => {
  await titlePage.seedProfile(JSON.stringify({ ...profile({ maps: { m01: cleared() } }), cores: "abc" }));
  await titlePage.goto();
  await expect(titlePage.storageNotice()).toContainText(t("storage.recovered"));
  await expect(titlePage.mapsUnlocked(2)).toBeVisible();
  await expect(titlePage.coresHeld()).toHaveText("0");
  expect(await titlePage.corruptProfileCopies()).toEqual([]);
});

test("nâng cấp và bản đồ của phiên bản khác bị bỏ, phần còn lại giữ nguyên", { tag: ["@TC-PROFILE-005"] }, async ({
  titlePage,
  workshopPage,
}) => {
  const base = profile({ cores: 50 });
  await titlePage.seedProfile(
    JSON.stringify({
      ...base,
      upgrades: { startGold: 1, laserTower: 2 },
      maps: { ...base.maps, m09: { cleared: true, bestWave: 3, bestLives: 1 } },
    }),
  );
  await titlePage.goto();
  await expect(titlePage.storageNotice()).toContainText(t("storage.recovered"));
  await titlePage.openWorkshop();
  await expect(workshopPage.levelText("startGold", 1, 4)).toBeVisible();
  await expect(workshopPage.coresChip()).toHaveAttribute("aria-label", `${t("common.cores")}: 50`);
});

test("trình duyệt chặn lưu trữ thì game vẫn chơi được và nói rõ", { tag: ["@TC-PROFILE-006", "@smoke"] }, async ({
  page,
  titlePage,
  battlePage,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await titlePage.blockStorage();
  await titlePage.goto();
  await expect(titlePage.storageNotice()).toContainText(t("storage.notWritable"));
  await titlePage.play();
  await battlePage.waitReady();
  await battlePage.build(8, "arrow");
  await expect.poll(() => battlePage.gold()).toBe(200);
});

test("chuỗi HTML và script trong profile không bao giờ chạy hay hiện ra", { tag: ["@TC-PROFILE-007"] }, async ({
  page,
  titlePage,
  mapSelectPage,
}) => {
  const dialogs: string[] = [];
  page.on("dialog", async (d) => {
    dialogs.push(d.message());
    await d.dismiss();
  });
  await titlePage.seedProfile(
    JSON.stringify({
      ...freshProfile(),
      locale: '<img src=x onerror="window.__pwned=1">',
      lastMap: "<script>window.__pwned=1</script>",
    }),
  );
  await titlePage.goto();
  await expect(titlePage.playButton()).toBeVisible(); // Vietnamese: the bad locale fell back to "vi"
  await expect(titlePage.lastMapLine()).toHaveCount(0);
  await titlePage.openMapSelect();
  await expect(mapSelectPage.heading()).toBeVisible();

  expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
  expect(await page.locator('img[src="x"]').count()).toBe(0);
  expect(dialogs).toEqual([]);
});

test("đóng thông báo thì nó biến mất và bản cũ vẫn được giữ", { tag: ["@TC-PROFILE-008"] }, async ({ titlePage }) => {
  await titlePage.seedProfile(BROKEN_JSON);
  await titlePage.goto();
  await expect(titlePage.storageNotice()).toBeVisible();
  await titlePage.storageNotice().getByRole("button", { name: t("common.close"), exact: true }).click();
  await expect(titlePage.storageNotice()).toHaveCount(0);
  expect(await titlePage.corruptProfileCopies()).toEqual([BROKEN_JSON]);
});
