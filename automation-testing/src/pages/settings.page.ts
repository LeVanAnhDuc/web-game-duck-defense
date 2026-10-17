import type { Locator } from "@playwright/test";
import { BasePage } from "./base.page";

/** Settings: language and ONE sound slider (FR-18 narrowed: no music in v1). */
export class SettingsPage extends BasePage {
  heading(): Locator {
    return this.page.getByRole("heading", { name: this.t("settings.title"), level: 1 });
  }

  languageGroup(): Locator {
    return this.page.getByRole("radiogroup", { name: this.t("settings.language") });
  }

  languageOption(locale: "vi" | "en"): Locator {
    return this.languageGroup().getByRole("radio", { name: this.t(locale === "vi" ? "locale.vi" : "locale.en") });
  }

  /** The sound slider, found through its <label for> — NFR-A11Y-04. */
  soundSlider(): Locator {
    return this.page.getByLabel(this.t("settings.sound"));
  }

  /** "80%" or "Tắt" next to the slider label. */
  soundValue(text: string): Locator {
    return this.page.locator("label").getByText(text, { exact: true });
  }

  musicControl(): Locator {
    return this.page.getByLabel(this.t("settings.music"));
  }

  /** Moves the range input to `percent` (0–100, step 5) the way a keyboard user would land on it. */
  async setSound(percent: number): Promise<void> {
    await this.soundSlider().fill(String(percent));
  }
}
