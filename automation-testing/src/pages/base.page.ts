import type { Locator, Page } from "@playwright/test";
import { t, type CopyKey, type Locale } from "@/data/copy";
import type { Profile } from "@/data/profiles";
import { STORAGE } from "@/data/test-data";

/**
 * Shared parts of every screen. Duck Defense is a single-URL SPA: every screen lives at "./" (relative, so the same
 * object works under GitHub Pages' /web-game-duck-defense/ base path), and the only thing that varies between
 * visits is what the game finds in localStorage.
 */
export abstract class BasePage {
  /** Which dictionary the locators read their names from. Tests that switch to English set this to "en". */
  locale: Locale = "vi";

  constructor(readonly page: Page) {}

  protected t(key: CopyKey, params: Record<string, string | number> = {}): string {
    return t(key, params, this.locale);
  }

  /**
   * Puts a profile in localStorage before the game reads it. Runs on the first document of this tab only (a
   * sessionStorage marker), so a later reload sees what the GAME wrote, not the planted value again.
   * `raw` lets a test plant something that is not valid JSON.
   */
  async seedProfile(profile: Profile | string): Promise<void> {
    const raw = typeof profile === "string" ? profile : JSON.stringify(profile);
    await this.page.addInitScript(
      ([key, value]) => {
        if (sessionStorage.getItem("__e2e_seeded") === key) return;
        localStorage.setItem(key, value);
        sessionStorage.setItem("__e2e_seeded", key);
      },
      [STORAGE.profile, raw] as const,
    );
  }

  /** The way private mode or a blocked-site-data policy looks to a page: touching localStorage throws. */
  async blockStorage(): Promise<void> {
    await this.page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        get() {
          throw new DOMException("The operation is insecure.", "SecurityError");
        },
      });
    });
  }

  /** The saved profile as the game last wrote it (null when nothing is stored). */
  async storedProfile(): Promise<Profile | null> {
    const raw = await this.page.evaluate((key) => localStorage.getItem(key), STORAGE.profile);
    return raw === null ? null : (JSON.parse(raw) as Profile);
  }

  /** Every localStorage key the page holds. */
  async storageKeys(): Promise<string[]> {
    return this.page.evaluate(() => Object.keys(localStorage));
  }

  /** The persistent banner above every screen (storage could not be read / cannot be written). */
  storageNotice(): Locator {
    return this.page.getByRole("status").filter({ has: this.page.getByRole("button", { name: this.t("common.close") }) });
  }

  backButton(): Locator {
    return this.page.getByRole("button", { name: this.t("common.back"), exact: true });
  }

  /** Horizontal overflow of the whole document, in px (0 = no sideways scroll). */
  async horizontalOverflow(): Promise<number> {
    return this.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  }

  /** The element that has keyboard focus: its tag and accessible-ish name, or "BODY" when focus fell to <body>. */
  async focused(): Promise<{ tag: string; label: string; text: string }> {
    return this.page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return {
        tag: el?.tagName ?? "",
        label: el?.getAttribute("aria-label") ?? "",
        text: (el?.textContent ?? "").trim(),
      };
    });
  }
}
