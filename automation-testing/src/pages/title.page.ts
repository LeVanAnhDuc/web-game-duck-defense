import type { Locator } from "@playwright/test";
import { BasePage } from "./base.page";
import { escapeRe } from "@/data/copy";

/** The title screen: one primary action (PLAY), map select, workshop, settings, language switch, progress footer. */
export class TitlePage extends BasePage {
  /** Opens the game and waits for the title screen. */
  async goto(query = ""): Promise<void> {
    await this.page.goto(query ? `./?${query}` : "./");
    await this.playButton().waitFor();
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.playButton().waitFor();
  }

  heading(): Locator {
    return this.page.getByRole("heading", { level: 1 });
  }

  tagline(): Locator {
    return this.page.getByText(this.t("app.tagline"), { exact: true });
  }

  playButton(): Locator {
    return this.page.getByRole("button", { name: this.t("title.play"), exact: true });
  }

  /** The pre-FR-34 label "CHƠI TIẾP" ("continue"): must not come back. */
  continueButton(): Locator {
    return this.page.getByRole("button", { name: /CHƠI TIẾP|CONTINUE/ });
  }

  mapSelectButton(): Locator {
    return this.page.getByRole("button", { name: this.t("title.mapSelect"), exact: true });
  }

  workshopButton(): Locator {
    return this.page.getByRole("button", { name: this.t("title.workshop"), exact: true });
  }

  settingsButton(): Locator {
    return this.page.getByRole("button", { name: this.t("common.settings"), exact: true });
  }

  /** The VI / EN switch at the top right (a radiogroup named "Ngôn ngữ" / "Language"). */
  languageSwitch(): Locator {
    return this.page.getByRole("radiogroup", { name: this.t("settings.language") });
  }

  languageOption(locale: "vi" | "en"): Locator {
    return this.languageSwitch().getByRole("radio", { name: this.t(locale === "vi" ? "locale.vi" : "locale.en") });
  }

  /** Switches language and follows it: later locators read the other dictionary. */
  async switchLanguage(locale: "vi" | "en"): Promise<void> {
    await this.languageOption(locale).click();
    this.locale = locale;
    await this.playButton().waitFor();
  }

  /** "<map> · kỷ lục đợt X / N" under PLAY — only rendered when there is progress. Any map, any numbers. */
  lastMapLine(): Locator {
    const marker = this.t("title.lastMap", { map: "¤", wave: "¤", total: "¤" }).split("¤")[1].trim();
    return this.page.getByText(new RegExp(escapeRe(marker)));
  }

  /** The footer count "Đã mở n / total bản đồ". */
  mapsUnlocked(n: number, total = 5): Locator {
    return this.page.getByText(this.t("title.mapsUnlocked", { n, total }), { exact: true });
  }

  /** The cores count in the footer: the number next to "Lõi". */
  coresHeld(): Locator {
    return this.page.locator("footer").getByText(/^\d+$/);
  }

  async play(): Promise<void> {
    await this.playButton().click();
  }

  async openMapSelect(): Promise<void> {
    await this.mapSelectButton().click();
  }

  async openWorkshop(): Promise<void> {
    await this.workshopButton().click();
  }

  async openSettings(): Promise<void> {
    await this.settingsButton().click();
  }
}
