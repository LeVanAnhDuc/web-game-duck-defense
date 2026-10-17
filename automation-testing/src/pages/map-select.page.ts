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
    // `has` an element whose whole text is the name: the next card's lock reason also names this map.
    return this.page.getByRole("button").filter({ has: this.page.getByText(this.t(`map.${map}`), { exact: true }) });
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

  /**
   * Every text span of every card that is NOT fully drawn inside its card: zero-sized, or cut off above/below
   * (invariants #13). Geometry, not semantics — a clipped text still passes toBeVisible()/toHaveText(), because it
   * is in the DOM, visible, and read by screen readers; only no pixel of it is painted.
   * Returns one line per problem; [] means every card reads in full.
   */
  async clippedCardText(maps: MapId[]): Promise<string[]> {
    const names = maps.map((m) => this.t(`map.${m}`));
    return this.page.evaluate((cardNames) => {
      const bad: string[] = [];
      for (const name of cardNames) {
        const card = [...document.querySelectorAll("button")].find((b) => b.innerText.includes(name));
        if (!card) {
          bad.push(`${name}: no card`);
          continue;
        }
        const cardBox = card.getBoundingClientRect();
        const spans = [...card.querySelectorAll("span")].filter(
          (s) => s.children.length === 0 && (s.textContent ?? "").trim().length > 0,
        );
        if (spans.length === 0) bad.push(`${name}: card has no text`);
        for (const span of spans) {
          const b = span.getBoundingClientRect();
          if (b.height === 0 || b.width === 0) bad.push(`${name}: "${span.textContent}" has zero size`);
          else if (b.bottom > cardBox.bottom + 1 || b.top < cardBox.top - 1)
            bad.push(`${name}: "${span.textContent}" cut (text ${Math.round(b.top)}–${Math.round(b.bottom)}, card ${Math.round(cardBox.top)}–${Math.round(cardBox.bottom)})`);
        }
      }
      return bad;
    }, names);
  }
}
