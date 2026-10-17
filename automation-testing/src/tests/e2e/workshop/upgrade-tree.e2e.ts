import { test, expect } from "@/fixtures";
import { t } from "@/data/copy";
import { profile } from "@/data/profiles";
import { M01, TOTAL_TREE_COST, TOWERS, UPGRADES, VIEWPORTS } from "@/data/test-data";

// FR-12 · FR-27 · NFR-REL-02 · US-02: the upgrade tree — buying, prerequisites, max level, a fast double click,
// and what a purchase changes in the next battle.

test.use({ viewport: VIEWPORTS.desktop });

const coresLabel = (n: number) => `${t("common.cores")}: ${n}`;
const startGold = UPGRADES.startGold;

test("ở màn rộng xưởng hiện bốn nhánh cạnh nhau, số lõi và tổng đã đầu tư", { tag: ["@TC-WORKSHOP-001"] }, async ({
  titlePage,
  workshopPage,
}) => {
  await titlePage.seedProfile(profile({ cores: 300 }));
  await titlePage.goto();
  await titlePage.openWorkshop();
  for (const branch of ["economy", "damage", "utility", "unlock"] as const) {
    await expect(workshopPage.branchHeading(branch)).toBeVisible();
  }
  await expect(workshopPage.coresChip()).toHaveAttribute("aria-label", coresLabel(300));
  await expect(workshopPage.invested(0, TOTAL_TREE_COST)).toBeVisible();
});

test.describe("màn hẹp", () => {
  test.use({ viewport: VIEWPORTS.phone });

  test("dưới 1024px các nhánh thành tab, mặc định Kinh tế", { tag: ["@TC-WORKSHOP-002"] }, async ({ titlePage, workshopPage }) => {
    await titlePage.goto();
    await titlePage.openWorkshop();
    await expect(workshopPage.branchTab("economy")).toHaveAttribute("aria-checked", "true");
    await expect(workshopPage.node("startGold")).toBeVisible();

    await workshopPage.branchTab("utility").click();
    await expect(workshopPage.branchTab("utility")).toHaveAttribute("aria-checked", "true");
    await expect(workshopPage.node("startLives")).toBeVisible();
    await expect(workshopPage.node("startGold")).toHaveCount(0);
  });
});

test("mua một bậc trừ đúng giá, lên bậc và đổi sang giá bậc kế", { tag: ["@TC-WORKSHOP-003", "@smoke"] }, async ({
  titlePage,
  workshopPage,
}) => {
  await titlePage.seedProfile(profile({ cores: 200 }));
  await titlePage.goto();
  await titlePage.openWorkshop();
  await workshopPage.buyButton("startGold").click();

  await expect(workshopPage.coresChip()).toHaveAttribute("aria-label", coresLabel(200 - startGold.costs[0]));
  await expect(workshopPage.levelText("startGold", 1, startGold.maxLevel)).toBeVisible();
  await expect(workshopPage.buyButton("startGold")).toHaveText(`${t("workshop.upgrade")}${startGold.costs[1]}`);
  await expect(workshopPage.invested(startGold.costs[0], TOTAL_TREE_COST)).toBeVisible();
});

test("thiếu một lõi thì nút mua bị vô hiệu", { tag: ["@TC-WORKSHOP-004"] }, async ({ titlePage, workshopPage }) => {
  await titlePage.seedProfile(profile({ cores: startGold.costs[0] - 1 }));
  await titlePage.goto();
  await titlePage.openWorkshop();
  const buy = workshopPage.buyButton("startGold");
  await expect(buy).toBeDisabled();
  await buy.click({ force: true });
  await expect(workshopPage.coresChip()).toHaveAttribute("aria-label", coresLabel(startGold.costs[0] - 1));
  await expect(workshopPage.levelText("startGold", 0, startGold.maxLevel)).toBeVisible();
});

test("vừa đủ lõi thì mua được và lõi về 0", { tag: ["@TC-WORKSHOP-005"] }, async ({ titlePage, workshopPage }) => {
  await titlePage.seedProfile(profile({ cores: startGold.costs[0] }));
  await titlePage.goto();
  await titlePage.openWorkshop();
  await workshopPage.buyButton("startGold").click();
  await expect(workshopPage.coresChip()).toHaveAttribute("aria-label", coresLabel(0));
  await expect(workshopPage.levelText("startGold", 1, startGold.maxLevel)).toBeVisible();
});

test("node chưa đạt điều kiện hiện Khoá kèm lý do, đạt thì mở", { tag: ["@TC-WORKSHOP-006", "@smoke"] }, async ({
  titlePage,
  workshopPage,
}) => {
  await titlePage.seedProfile(profile({ cores: 400, upgrades: { bounty: 1 } }));
  await titlePage.goto();
  await titlePage.openWorkshop();

  await expect(workshopPage.lockedText("waveInterest")).toBeVisible();
  await expect(workshopPage.needsText("waveInterest", "bounty", 2)).toBeVisible();
  await expect(workshopPage.buyButton("waveInterest")).toHaveCount(0);

  await workshopPage.buyButton("bounty").click();
  await expect(workshopPage.buyButton("waveInterest")).toHaveText(`${t("workshop.upgrade")}${UPGRADES.waveInterest.costs[0]}`);
  await expect(workshopPage.lockedText("waveInterest")).toHaveCount(0);
});

test("mua tới bậc tối đa thì node nói Đã tối đa và hết nút mua", { tag: ["@TC-WORKSHOP-007"] }, async ({
  titlePage,
  workshopPage,
}) => {
  await titlePage.seedProfile(profile({ cores: UPGRADES.sellRatio.costs[0], upgrades: { buildCost: 1 } }));
  await titlePage.goto();
  await titlePage.openWorkshop();
  await workshopPage.buyButton("sellRatio").click();
  await expect(workshopPage.maxedText("sellRatio")).toBeVisible();
  await expect(workshopPage.buyButton("sellRatio")).toHaveCount(0);
  await expect(workshopPage.coresChip()).toHaveAttribute("aria-label", coresLabel(0));
});

test("bấm mua hai lần thật nhanh khi chỉ đủ một bậc thì chỉ trừ một lần", { tag: ["@TC-WORKSHOP-008", "@smoke"] }, async ({
  titlePage,
  workshopPage,
}) => {
  await titlePage.seedProfile(profile({ cores: 100 }));
  await titlePage.goto();
  await titlePage.openWorkshop();
  await workshopPage.buyButton("startGold").dblclick();

  await expect(workshopPage.coresChip()).toHaveAttribute("aria-label", coresLabel(100 - startGold.costs[0]));
  await expect(workshopPage.levelText("startGold", 1, startGold.maxLevel)).toBeVisible();
  const saved = await workshopPage.storedProfile();
  expect(saved?.cores).toBe(100 - startGold.costs[0]);
  expect(saved?.upgrades.startGold).toBe(1);
});

test("bấm hai lần thật nhanh khi đủ hai bậc thì mua hai bậc theo hai giá", { tag: ["@TC-WORKSHOP-009"] }, async ({
  titlePage,
  workshopPage,
}) => {
  const cores = startGold.costs[0] + startGold.costs[1];
  await titlePage.seedProfile(profile({ cores }));
  await titlePage.goto();
  await titlePage.openWorkshop();
  await workshopPage.buyButton("startGold").dblclick();

  await expect(workshopPage.coresChip()).toHaveAttribute("aria-label", coresLabel(0));
  await expect(workshopPage.levelText("startGold", 2, startGold.maxLevel)).toBeVisible();
});

test("nâng cấp đã mua còn sau tải lại và cộng vàng khởi đầu cho trận sau", { tag: ["@TC-WORKSHOP-010", "@smoke"] }, async ({
  titlePage,
  workshopPage,
  battlePage,
}) => {
  await titlePage.seedProfile(profile({ cores: startGold.costs[0] }));
  await titlePage.goto();
  await titlePage.openWorkshop();
  await workshopPage.buyButton("startGold").click();
  await expect(workshopPage.levelText("startGold", 1, startGold.maxLevel)).toBeVisible();

  await titlePage.reload();
  await titlePage.openWorkshop();
  await expect(workshopPage.levelText("startGold", 1, startGold.maxLevel)).toBeVisible();
  await expect(workshopPage.coresChip()).toHaveAttribute("aria-label", coresLabel(0));

  await workshopPage.backButton().click();
  await titlePage.play();
  await battlePage.waitReady();
  expect(await battlePage.gold()).toBe(M01.startGold + startGold.perLevel);
});

test("mở khoá Tháp Sét thì trận sau có thẻ tháp Sét", { tag: ["@TC-WORKSHOP-011"] }, async ({
  titlePage,
  workshopPage,
  battlePage,
}) => {
  await titlePage.seedProfile(profile({ cores: UPGRADES.unlockBolt.costs[0], upgrades: { arrowDamage: 3 } }));
  await titlePage.goto();
  await titlePage.openWorkshop();
  await workshopPage.buyButton("unlockBolt").click();
  await expect(workshopPage.maxedText("unlockBolt")).toBeVisible();

  await workshopPage.backButton().click();
  await titlePage.play();
  await battlePage.waitReady();
  await battlePage.slot(8).click();
  await expect(battlePage.towerCard("bolt")).toContainText(String(TOWERS.bolt.cost));
  for (const tower of ["arrow", "cannon", "frost"] as const) await expect(battlePage.towerCard(tower)).toBeVisible();
});
