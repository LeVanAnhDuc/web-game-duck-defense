import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";
import { resolveEnv } from "@/config/env";
import { buildGrepInvert } from "@/config/env-guard";
import { findUrls } from "@/config/urls";

const env = resolveEnv(process.env.ENV);
const includeFull = process.env.FULL === "1";
const isDev = env === "dev";
const grepInvert = buildGrepInvert(env, includeFull);
// Page objects navigate with "./…": GitHub Pages serves the game under /web-game-duck-defense/, so the baseURL keeps
// its path and ends with "/" (a leading "/" would drop the path). undefined on an env without a host.
const webUrl = findUrls(env)?.webUrl;
const baseURL = webUrl ? `${webUrl}/` : undefined;

// Dev runs against the PRODUCTION BUILD of ../client served by `vite preview`, not `vite` dev: that is what GitHub
// Pages serves. A second build with Ducker ID sign-in switched ON against a fake issuer (ADR-0010) is served on its
// own port for the ducker-id sign-in spec only. Each server builds its own output first unless CLIENT_PREBUILT=1
// (then ../client/dist and ../client/dist-auth must already exist). Ports 5273/5275 are this repo's own, with
// --strictPort, so a clash with another workspace app fails loudly instead of testing the wrong game.
const PORT = 5273;
const AUTH_PORT = 5275;
const AUTH_URL = `http://localhost:${AUTH_PORT}/`;
const prebuilt = process.env.CLIENT_PREBUILT === "1";

// The flag-off build must not pick up a developer's client/.env that switches sign-in on: process env beats .env.
const FLAG_OFF_ENV = { VITE_BASE_PATH: "/", VITE_FEATURE_DUCKER_SIGN_IN: "" };
// The flag-on build points at http://ducker.test, which never resolves: the issuer fixture answers it with page.route.
const FLAG_ON_ENV = {
  VITE_BASE_PATH: "/",
  VITE_FEATURE_DUCKER_SIGN_IN: "true",
  VITE_DUCKER_ISSUER: "http://ducker.test",
  VITE_DUCKER_CLIENT_ID: "e2e-client",
  VITE_DUCKER_SCOPE: "openid profile email",
  VITE_DUCKER_PROFILE_PATH: "/profile",
};

const SIGN_IN = /e2e\/ducker-id\/sign-in\.e2e\.ts$/;

export default defineConfig({
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  // A battle is a Phaser canvas rendered in software WebGL: every worker runs a game loop, so the worker count is
  // kept low on purpose — a starved loop reads like a slow battle, not like a test bug.
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  // "app" first: the playwright-test MCP server (agents) treats the first project as primary.
  // Variants are extra projects named "app-<variant>"; package.json runs --project="app*".
  projects: [
    {
      name: "app",
      testDir: "./src/tests",
      testMatch: [/e2e\/.*\.e2e\.ts$/, /api\/.*\.api\.ts$/, /seed\.spec\.ts$/],
      testIgnore: [SIGN_IN],
      grepInvert,
      use: { ...devices["Desktop Chrome"], baseURL },
    },
    // Ducker ID sign-in against the flag-on build. Only dev has one: the deployed build ships with the flag off.
    ...(isDev
      ? [
          {
            name: "app-auth",
            testDir: "./src/tests",
            testMatch: SIGN_IN,
            grepInvert,
            use: { ...devices["Desktop Chrome"], baseURL: AUTH_URL },
          },
        ]
      : []),
    // One-off data setup (pnpm provision), never part of a normal run.
    {
      name: "provision",
      testDir: "./src/tests/setup",
      testMatch: /.*\.setup\.ts$/,
      workers: 1,
      use: { baseURL },
    },
    { name: "unit", testDir: "./src", testMatch: /.*\.test\.ts$/ },
  ],
  // Boots the game itself on dev. The unit project needs no browser and no server.
  webServer:
    isDev && !process.argv.includes("--project=unit")
      ? [
          {
            command: `cd ../client && ${prebuilt ? "" : "pnpm build && "}pnpm exec vite preview --port ${PORT} --strictPort`,
            url: `http://localhost:${PORT}/`,
            env: FLAG_OFF_ENV,
            reuseExistingServer: !process.env.CI,
            timeout: 300_000,
          },
          {
            command: `cd ../client && ${prebuilt ? "" : "pnpm exec vite build --outDir dist-auth --emptyOutDir && "}pnpm exec vite preview --outDir dist-auth --port ${AUTH_PORT} --strictPort`,
            url: AUTH_URL,
            env: FLAG_ON_ENV,
            reuseExistingServer: !process.env.CI,
            timeout: 300_000,
          },
        ]
      : undefined,
});
