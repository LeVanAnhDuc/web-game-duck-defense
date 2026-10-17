import type { Locator } from "@playwright/test";
import { BasePage } from "./base.page";
import { escapeRe } from "@/data/copy";
import type { MapId } from "@/data/test-data";

/** Map select: five cards in order, a cores chip, a workshop shortcut. */
export class MapSelectPage extends BasePage {
  heading(): Locator {
    return this.page.getByRole("heading", { name: this.t("mapSelect.title"), level: 1 });
  }

  /** A map card (a button whose text holds the map name, its status and a detail line). */
  card(map: MapId): Locator {
    return this.page.getByRole("button").filter({ hasText: this.t(`map.${map}`) });
  }

  coresChip(): Locator {
    return this.page.getByRole("group", { name: new RegExp(`^${escapeRe(this.t("common.cores"))}: \\d+$`) });
  }

  /** The visible workshop shortcut (header at ≥1024px, footer below). */
  workshopButton(): Locator {
    return this.page.getByRole("button", { name: this.t("title.workshop"), exact: true }).locator("visible=true");
  }

  async pick(map: MapId): Promise<void> {
    await this.card(map).click();
  }
}
