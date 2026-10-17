import type { Page } from "@playwright/test";
import { DUCKER } from "@/data/test-data";
import { test as core } from "./core.fixture";

export type IssuerMode = "ok" | "deny";

const CORS = { "access-control-allow-origin": "*" };

/**
 * Plays Ducker ID for the flag-on build (ADR-0010): /oauth/authorize redirects straight back with a code (or an
 * error), /oauth/token and /oauth/userinfo answer. The issuer http://ducker.test is never resolved for real.
 */
async function install(page: Page, mode: IssuerMode): Promise<void> {
  await page.route(`${DUCKER.issuer}/oauth/authorize**`, async (route) => {
    const url = new URL(route.request().url());
    const back = new URL(url.searchParams.get("redirect_uri")!);
    if (mode === "deny") back.searchParams.set("error", "access_denied");
    else back.searchParams.set("code", "code-1");
    back.searchParams.set("state", url.searchParams.get("state")!);
    await route.fulfill({ status: 302, headers: { location: back.toString() } });
  });
  await page.route(`${DUCKER.issuer}/oauth/token`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: CORS,
      body: JSON.stringify({ access_token: "at-1", token_type: "Bearer", expires_in: 900 }),
    }),
  );
  await page.route(`${DUCKER.issuer}/oauth/userinfo`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", headers: CORS, body: JSON.stringify(DUCKER.user) }),
  );
}

export const test = core.extend<{ fakeIssuer: (mode?: IssuerMode) => Promise<void> }>({
  fakeIssuer: async ({ page }, use) => use((mode = "ok") => install(page, mode)),
});
