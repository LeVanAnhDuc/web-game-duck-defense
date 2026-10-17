import { test, expect } from "@/fixtures";
import { DUCKER } from "@/data/test-data";

// FR-37 · US-05 · ADR-0010: sign-in against the flag-on build (project app-auth, dev only) and a fake issuer
// (fakeIssuer) that is never resolved for real.

test.beforeEach(async ({ fakeIssuer }) => {
  await fakeIssuer();
});

test("đăng nhập xong thấy nút tài khoản, URL sạch và không lỗi console", { tag: ["@TC-DUCKERID-003", "@smoke"] }, async ({
  page,
  titlePage,
}) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await titlePage.goto();
  await titlePage.signIn();
  await expect(titlePage.accountButton()).toBeVisible();
  expect(new URL(page.url()).search).not.toMatch(/code=|state=/);
  expect(errors).toEqual([]);
});

test("menu tài khoản hiện tên, hồ sơ, đăng xuất và trả focus đúng chỗ", { tag: ["@TC-DUCKERID-004"] }, async ({
  page,
  titlePage,
}) => {
  await titlePage.goto();
  await titlePage.signIn();

  await titlePage.accountButton().click();
  await expect(titlePage.accountMenu().getByText(DUCKER.user.name).first()).toBeVisible();
  await expect(titlePage.profileLink()).toHaveAttribute("href", `${DUCKER.issuer}${DUCKER.profilePath}`);

  await page.keyboard.press("Escape");
  await expect(titlePage.accountButton()).toBeFocused();

  await titlePage.accountButton().click();
  await titlePage.signOutItem().click();
  await expect(titlePage.signInButton()).toBeFocused();
});

test("tải lại khi đang đăng nhập thì về chưa đăng nhập", { tag: ["@TC-DUCKERID-005"] }, async ({ titlePage }) => {
  await titlePage.goto();
  await titlePage.signIn();
  await titlePage.reload();
  await expect(titlePage.signInButton()).toBeVisible();
});

test("state bị sửa thì về chưa đăng nhập và URL sạch", { tag: ["@TC-DUCKERID-006"] }, async ({ page, titlePage }) => {
  await titlePage.goto("code=stolen&state=evil");
  await expect(titlePage.signInButton()).toBeVisible();
  expect(new URL(page.url()).search).toBe("");
});

test("Ducker ID trả lỗi thì về chưa đăng nhập và URL sạch", { tag: ["@TC-DUCKERID-007"] }, async ({ page, titlePage }) => {
  await titlePage.goto("error=access_denied&error_description=nope");
  await expect(titlePage.signInButton()).toBeVisible();
  expect(new URL(page.url()).search).toBe("");
});

test("đã đăng nhập thì game vẫn chơi được", { tag: ["@TC-DUCKERID-008"] }, async ({ titlePage, battlePage }) => {
  await titlePage.goto();
  await titlePage.signIn();
  await titlePage.play();
  await battlePage.waitReady();
  await expect(battlePage.canvas()).toBeVisible();
});

test("nhãn đăng nhập và menu bằng tiếng Anh", { tag: ["@TC-DUCKERID-009"] }, async ({ titlePage }) => {
  await titlePage.goto();
  await titlePage.switchLanguage("en");
  await expect(titlePage.signInButton()).toBeVisible();
  await titlePage.signIn();
  await titlePage.accountButton().click();
  await expect(titlePage.profileLink()).toBeVisible();
  await expect(titlePage.signOutItem()).toBeVisible();
});

test("ở 375px nút đăng nhập rộng ít nhất 44 và không đè công tắc ngôn ngữ", { tag: ["@TC-DUCKERID-010"] }, async ({
  page,
  titlePage,
}) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await titlePage.goto();
  await expect(titlePage.signInButton()).toBeEnabled();
  const button = (await titlePage.signInButton().boundingBox())!;
  const language = (await titlePage.languageSwitch().boundingBox())!;
  expect(button.width).toBeGreaterThanOrEqual(44);
  expect(button.height).toBeGreaterThanOrEqual(44);
  expect(button.x).toBeGreaterThanOrEqual(language.x + language.width);
  expect(button.x + button.width).toBeLessThanOrEqual(375);
});

for (const width of [320, 375]) {
  for (const locale of ["vi", "en"] as const) {
    test(
      `ở 320 và 375px thanh trên không xuống dòng và menu nằm trong màn hình — ${width}px ${locale}`,
      { tag: ["@TC-DUCKERID-011"] },
      async ({ page, titlePage }) => {
        await page.setViewportSize({ width, height: 700 });
        await titlePage.goto();
        if (locale === "en") await titlePage.switchLanguage("en");
        await expect(titlePage.signInButton()).toBeEnabled();

        const barSignedOut = (await titlePage.topBar().boundingBox())!;
        const lang0 = (await titlePage.languageSwitch().boundingBox())!;
        const signIn = (await titlePage.signInButton().boundingBox())!;
        expect(Math.abs(signIn.y - lang0.y)).toBeLessThan(8);
        expect(signIn.x + signIn.width).toBeLessThanOrEqual(width);

        await titlePage.signIn();
        const before = (await titlePage.topBar().boundingBox())!;
        const lang1 = (await titlePage.languageSwitch().boundingBox())!;
        expect(before.height).toBe(barSignedOut.height);
        expect(lang1.width).toBeGreaterThanOrEqual(44);
        expect(lang1.height).toBeGreaterThanOrEqual(44);
        const account = (await titlePage.accountButton().boundingBox())!;
        expect(account.x).toBeGreaterThanOrEqual(lang1.x + lang1.width);
        expect(account.x + account.width).toBeLessThanOrEqual(width);

        await titlePage.accountButton().click();
        await expect(titlePage.accountMenu()).toBeVisible();
        expect(await titlePage.accountMenu().evaluate((el) => getComputedStyle(el).position)).toBe("absolute");
        const menu = (await titlePage.accountMenu().boundingBox())!;
        expect(menu.x).toBeGreaterThanOrEqual(0);
        expect(menu.x + menu.width).toBeLessThanOrEqual(width);
        expect(await titlePage.topBar().boundingBox()).toEqual(before);
      },
    );
  }
}
