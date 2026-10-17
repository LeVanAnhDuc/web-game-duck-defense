import { test as base, expect } from "@/fixtures";
import { STORAGE, VIEWPORTS } from "@/data/test-data";

// NFR-DATA-04 · NFR-DATA-01: the game collects nothing — no requests out, no cookies, one storage key of progress.

const FONT_HOSTS = ["https://fonts.googleapis.com/", "https://fonts.gstatic.com/"];

// Local to this spec: "play" = a full wave with towers on a fake clock, back to the title, change a setting —
// every path that could send or store something. Yields the requests that left the app's origin.
const test = base.extend<{ played: { outside: string[] } }>({
  played: async ({ page, baseURL, enterBattle, titlePage, settingsPage, battlePage }, use) => {
    const origin = new URL(baseURL!).origin;
    const outside: string[] = [];
    page.on("request", (r) => {
      const url = r.url();
      // data: and blob: never leave the machine (Phaser builds its textures as blob: object URLs)
      if (url.startsWith(origin) || /^(data|blob):/.test(url) || FONT_HOSTS.some((h) => url.startsWith(h))) return;
      outside.push(url);
    });

    await battlePage.useFakeClock();
    await enterBattle();
    await battlePage.warmUp();
    for (const slot of [8, 9, 3]) await battlePage.build(slot, "arrow");
    await battlePage.speedOption(3).click();
    await battlePage.callWave();
    await battlePage.finishWave();
    await battlePage.backButton().click(); // battle → map select
    await titlePage.backButton().click(); // map select → title
    await titlePage.openSettings();
    await settingsPage.setSound(40);
    await settingsPage.backButton().click();
    await expect(titlePage.playButton()).toBeVisible();
    await use({ outside });
  },
});

test.use({ viewport: VIEWPORTS.desktop });

test("chơi một đợt trọn vẹn không gửi gì ra ngoài origin ngoài Google Fonts", { tag: ["@TC-PRIVACY-001", "@smoke"] }, async ({
  played,
}) => {
  expect(played.outside).toEqual([]);
});

test("game không đặt cookie nào", { tag: ["@TC-PRIVACY-002"] }, async ({ played, context }) => {
  expect(played.outside).toEqual([]);
  expect(await context.cookies()).toEqual([]);
});

test("sau khi chơi chỉ còn một khoá profile chỉ chứa tiến trình", { tag: ["@TC-PRIVACY-003"] }, async ({
  played,
  page,
  titlePage,
}) => {
  expect(played.outside).toEqual([]);
  expect(await titlePage.storageKeys()).toEqual([STORAGE.profile]);
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
  const saved = await titlePage.storedProfile();
  expect(Object.keys(saved ?? {}).sort()).toEqual(["cores", "lastMap", "locale", "maps", "schemaVersion", "settings", "upgrades"]);
});
