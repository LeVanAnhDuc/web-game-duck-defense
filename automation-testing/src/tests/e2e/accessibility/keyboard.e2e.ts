import { test, expect } from "@/fixtures";
import { t } from "@/data/copy";
import { M01, TOWERS, VIEWPORTS } from "@/data/test-data";

// NFR-A11Y-02 · FR-29 · FR-36 · NFR-A11Y-07: the whole battle by keyboard, a focus ring that never disappears or
// falls to <body>, shortcuts that never steal a focused button's key, and a text alternative for the canvas.

test.use({ viewport: VIEWPORTS.desktop });

test("đặt được tháp chỉ bằng bàn phím và vòng focus luôn thấy được", { tag: ["@TC-ACCESSIBILITY-001", "@smoke"] }, async ({
  page,
  enterBattle,
  battlePage,
}) => {
  await enterBattle();
  await page.keyboard.press("1"); // pick the archer first

  // The canvas cannot take focus: without the DOM slot overlay this loop never reaches a slot.
  const slotPrefix = t("battle.slotLabel", { n: "" });
  let reached = false;
  for (let i = 0; i < 40 && !reached; i++) {
    await page.keyboard.press("Tab");
    reached = (await battlePage.focused()).label.startsWith(slotPrefix);
  }
  expect(reached, "Tab never reached a slot — the DOM overlay is missing").toBe(true);

  const ring = await battlePage.focusOutline();
  expect(ring.style).not.toBe("none");
  expect(ring.width).toBeGreaterThan(0);

  await page.keyboard.press("Enter");
  await expect(battlePage.confirmBuildButton()).toBeVisible(); // FR-33: choosing the slot pays nothing
  expect(await battlePage.gold()).toBe(M01.startGold);

  const buildPrefix = t("battle.confirmBuild", { cost: "" });
  let onBuild = false;
  for (let i = 0; i < 20 && !onBuild; i++) {
    await page.keyboard.press("Tab");
    const focused = await battlePage.focused();
    expect(focused.tag, "focus fell to <body> halfway — NFR-A11Y-02").not.toBe("BODY");
    onBuild = focused.text.startsWith(buildPrefix);
  }
  expect(onBuild, "Tab never reached the build button").toBe(true);

  await page.keyboard.press("Enter");
  await expect.poll(() => battlePage.gold()).toBe(M01.startGold - TOWERS.arrow.cost);
});

test("vào trận bằng bàn phím thì focus không rơi về body", { tag: ["@TC-ACCESSIBILITY-002"] }, async ({ page, titlePage, battlePage }) => {
  await titlePage.goto();
  // the title screen is replaced, so the button just pressed disappears
  await titlePage.playButton().focus();
  await page.keyboard.press("Enter");
  await battlePage.waitReady();
  await expect.poll(async () => (await battlePage.focused()).tag).not.toBe("BODY");
});

test("nút gọi đợt tự tắt sau khi bấm bằng bàn phím mà focus vẫn ở đó", { tag: ["@TC-ACCESSIBILITY-003"] }, async ({
  page,
  enterBattle,
  battlePage,
}) => {
  await enterBattle();
  const callWave = battlePage.callWaveButton();
  await callWave.focus();
  await page.keyboard.press("Enter");
  // aria-disabled, not disabled: a disabled button leaves the tab order and the browser drops focus to <body>
  await expect(callWave).toHaveAttribute("aria-disabled", "true");
  await expect(callWave).toBeFocused();
  expect((await battlePage.focused()).tag).not.toBe("BODY");
});

test("phím 1, 2, 3 chọn đúng Cung, Pháo, Băng", { tag: ["@TC-ACCESSIBILITY-004"] }, async ({ page, enterBattle, battlePage }) => {
  await enterBattle();
  const towers = ["arrow", "cannon", "frost"] as const;
  for (const [key, picked] of [["2", "cannon"], ["3", "frost"], ["1", "arrow"]] as const) {
    await page.keyboard.press(key);
    for (const tower of towers) {
      await expect(battlePage.towerCard(tower)).toHaveAttribute("aria-pressed", String(tower === picked));
    }
  }
  expect(await battlePage.gold()).toBe(M01.startGold);
});

test("Esc bỏ chọn ô và Space gọi đợt khi không nút nào giữ focus", { tag: ["@TC-ACCESSIBILITY-005"] }, async ({
  page,
  enterBattle,
  battlePage,
}) => {
  await enterBattle();
  // aria-pressed on the slot button itself is the layout-independent sign of "selected"
  await battlePage.slot(8).click();
  await expect(battlePage.slot(8)).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await expect(battlePage.slot(8)).toHaveAttribute("aria-pressed", "false");

  // The click left focus ON the slot button, and Space on a focused button presses that button (TC-ACCESSIBILITY-006).
  // Move focus off every button first.
  await page.locator("body").click({ position: { x: 5, y: 400 } });
  await page.keyboard.press("Space");
  await expect(battlePage.callWaveButton()).toHaveAttribute("aria-disabled", "true");
});

test("Space trên nút Nâng đang giữ focus nâng tháp và không gọi đợt", { tag: ["@TC-ACCESSIBILITY-006"] }, async ({
  page,
  enterBattle,
  battlePage,
}) => {
  await enterBattle();
  await battlePage.build(8, "arrow");
  await expect.poll(() => battlePage.gold()).toBe(M01.startGold - TOWERS.arrow.cost);
  const goldBefore = await battlePage.gold();

  await battlePage.upgradeButton(TOWERS.arrow.upgrade[0]).focus();
  await page.keyboard.press("Space");

  await expect.poll(() => battlePage.gold()).toBe(goldBefore - TOWERS.arrow.upgrade[0]);
  await expect(battlePage.towerTitle("arrow", 2)).toBeVisible();
  await expect(battlePage.callWaveButton()).toHaveAttribute("aria-disabled", "false");
});

test("vùng aria-live đọc đợt, mạng, vàng và cập nhật sau khi xây", { tag: ["@TC-ACCESSIBILITY-008"] }, async ({
  enterBattle,
  battlePage,
}) => {
  await enterBattle();
  const say = (gold: number) =>
    `${t("battle.wave")} 1/${M01.waves} · ${t("common.lives")} ${M01.startLives} · ${t("common.gold")} ${gold}`;
  await expect(battlePage.liveRegion()).toHaveText(say(M01.startGold));
  await battlePage.build(8, "arrow");
  await expect(battlePage.liveRegion()).toHaveText(say(M01.startGold - TOWERS.arrow.cost));
});
