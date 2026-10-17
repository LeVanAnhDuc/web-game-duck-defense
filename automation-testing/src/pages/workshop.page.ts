import type { Locator } from "@playwright/test";
import { BasePage } from "./base.page";
import { escapeRe } from "@/data/copy";

export type UpgradeNodeId =
  | "startGold" | "bounty" | "waveInterest" | "arrowDamage" | "frostDepth"
  | "startLives" | "buildCost" | "sellRatio" | "unlockBolt" | "unlockVenom";
export type Branch = "economy" | "damage" | "utility" | "unlock";

/** Workshop: the upgrade tree, four branches — columns at ≥1024px, tabs below. */
export class WorkshopPage extends BasePage {
  heading(): Locator {
    return this.page.getByRole("heading", { name: this.t("workshop.title"), level: 1 });
  }

  coresChip(): Locator {
    return this.page.getByRole("group", { name: new RegExp(`^${escapeRe(this.t("common.cores"))}: \\d+$`) });
  }

  async cores(): Promise<number> {
    return Number(((await this.coresChip().getAttribute("aria-label")) ?? "").replace(/\D+/g, ""));
  }

  /** The branch tabs, only below 1024px. */
  branchTab(branch: Branch): Locator {
    return this.page
      .getByRole("radiogroup", { name: this.t("workshop.title") })
      .getByRole("radio", { name: this.t(`workshop.branch.${branch}`), exact: true });
  }

  /** The column headings, only at ≥1024px. */
  branchHeading(branch: Branch): Locator {
    return this.page.getByRole("heading", { name: this.t(`workshop.branch.${branch}`), level: 2 });
  }

  /** One node row of the visible tree. */
  node(id: UpgradeNodeId): Locator {
    return this.page
      .getByRole("listitem")
      .filter({ has: this.page.getByText(this.t(`upgrade.${id}`), { exact: true }) })
      .locator("visible=true");
  }

  buyButton(id: UpgradeNodeId): Locator {
    return this.node(id).getByRole("button", { name: new RegExp(`^${escapeRe(this.t("workshop.upgrade"))}`) });
  }

  /** "Bậc 1 / 4", "Đã tối đa" or "Khoá" at the right of the node name. */
  levelText(id: UpgradeNodeId, level: number, max: number): Locator {
    return this.node(id).getByText(this.t("tower.levelOf", { level, max }), { exact: true });
  }

  maxedText(id: UpgradeNodeId): Locator {
    return this.node(id).getByText(this.t("workshop.maxed"), { exact: true });
  }

  lockedText(id: UpgradeNodeId): Locator {
    return this.node(id).getByText(this.t("workshop.locked"), { exact: true });
  }

  /** "Cần <node> bậc N". */
  needsText(id: UpgradeNodeId, needs: UpgradeNodeId, level: number): Locator {
    return this.node(id).getByText(this.t("workshop.needs", { node: this.t(`upgrade.${needs}`), level }), { exact: true });
  }

  invested(n: number, total: number): Locator {
    return this.page.getByText(this.t("workshop.invested", { n, total }), { exact: true });
  }
}
