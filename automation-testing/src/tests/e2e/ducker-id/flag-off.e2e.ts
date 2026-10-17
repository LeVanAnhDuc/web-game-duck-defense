import { test, expect } from "@/fixtures";
import { STORAGE } from "@/data/test-data";

// FR-37 · ADR-0010 · NFR-DATA-04: with the flag off (the default build, and the deployed one) the sign-in feature
// leaves no trace — no button, no request outside the app, no storage, and a stray ?code= is not touched.

test("cờ tắt thì không có nút đăng nhập và không request nào ra ngoài", { tag: ["@TC-DUCKERID-001", "@smoke"] }, async ({
  page,
  baseURL,
  titlePage,
}) => {
  const origin = new URL(baseURL!).origin;
  const outside: string[] = [];
  page.on("request", (r) => {
    // Google Fonts predates the feature and is allowed by NFR-DATA-04
    if (!r.url().startsWith(origin) && !r.url().startsWith("data:") && !r.url().includes("fonts.g")) outside.push(r.url());
  });
  await titlePage.goto();
  await expect(titlePage.signInButton()).toHaveCount(0);
  await expect(titlePage.accountButton()).toHaveCount(0);
  expect(outside).toEqual([]);
  expect(await page.evaluate((key) => sessionStorage.getItem(key), STORAGE.pkce)).toBeNull();
});

test("cờ tắt thì code và state lạ trên URL được để yên", { tag: ["@TC-DUCKERID-002"] }, async ({ page, titlePage }) => {
  await titlePage.goto("code=abc&state=xyz");
  await expect(titlePage.playButton()).toBeVisible();
  expect(new URL(page.url()).search).toBe("?code=abc&state=xyz");
});
