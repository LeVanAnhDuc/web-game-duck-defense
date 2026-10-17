import type { Locator } from "@playwright/test";
import { BasePage } from "./base.page";
import type { MapId } from "@/data/test-data";

/** Result: won/lost, waves survived, lives, kills, cores earned, and where to go next. */
export class ResultPage extends BasePage {
  outcome(won: boolean): Locator {
    return this.page.getByRole("heading", { name: this.t(won ? "result.won" : "result.lost"), level: 1 });
  }

  mapName(map: MapId): Locator {
    return this.page.getByText(this.t(`map.${map}`), { exact: true });
  }

  wavesSurvived(wave: number, total: number): Locator {
    return this.page.getByText(this.t("result.wavesSurvived", { wave, total }), { exact: true });
  }

  livesLeft(n: number): Locator {
    return this.page.getByText(this.t("result.livesLeft", { n }), { exact: true });
  }

  killed(n: number): Locator {
    return this.page.getByText(this.t("result.killed", { n }), { exact: true });
  }

  /** The "+N" cores figure. */
  coresEarned(): Locator {
    return this.page.locator("dd").filter({ hasText: /^\+\d+$/ });
  }

  async cores(): Promise<number> {
    return Number(((await this.coresEarned().textContent()) ?? "").replace(/\D+/g, ""));
  }

  firstClearLine(bonus: number): Locator {
    return this.page.getByText(this.t("result.firstClear", { n: bonus }), { exact: true });
  }

  replayLine(): Locator {
    return this.page.getByText(this.t("result.replayReduced"), { exact: true });
  }

  retryButton(): Locator {
    return this.page.getByRole("button", { name: this.t("result.retry"), exact: true });
  }

  nextMapButton(): Locator {
    return this.page.getByRole("button", { name: this.t("result.nextMap"), exact: true });
  }

  workshopButton(): Locator {
    return this.page.getByRole("button", { name: this.t("result.toWorkshop"), exact: true });
  }

  mapSelectButton(): Locator {
    return this.page.getByRole("button", { name: this.t("result.toMapSelect"), exact: true });
  }
}
