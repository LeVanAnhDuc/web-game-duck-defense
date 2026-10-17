import { test, expect } from "@/fixtures";
import { VIEWPORTS } from "@/data/test-data";

// NFR-PERF-07 · invariants #7: React reads a 10Hz snapshot, never one per frame.

test.use({ viewport: VIEWPORTS.desktop });

test("HUD đổi ở nhịp 10Hz chứ không theo frame khi trận đang chạy", { tag: ["@TC-PERFORMANCE-001"] }, async ({
  enterBattle,
  battlePage,
}) => {
  test.setTimeout(60_000);
  await enterBattle();
  // Build first: with no tower nothing changes for ~31 s and the count is 0 because the HUD stands still, not because
  // React behaves.
  for (const slot of [8, 9, 3]) await battlePage.build(slot, "arrow");
  await battlePage.speedOption(3).click();
  await battlePage.callWave();

  // A stand-in for React render count: a render counter would have to live in production code. If React rendered
  // 60 times a second the gold figure would change up to 60 times a second and this would climb into the hundreds.
  const mutations = await battlePage.hudMutations(5000);
  expect(mutations).toBeGreaterThan(0);
  // 10 Hz × 5 s = 50 state changes; each may touch a few text nodes
  expect(mutations, `HUD changed ${mutations} times in 5 s`).toBeLessThan(400);
});
