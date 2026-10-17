import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { escapeRe, type CopyKey } from "@/data/copy";
import type { TowerId } from "@/data/test-data";

/**
 * The battle screen. The board is a Phaser canvas; everything a player can act on is DOM:
 *   • a transparent button per build slot over the canvas ("Ô số N", "Ô số N — đã xây", "Cung bậc 1 ở ô số N"),
 *   • the HUD chips (role=group named "Vàng: 260", "Mạng: 20"), the wave progressbar, the call-wave button,
 *   • the build panel (tower cards, stats, confirm), the selected-tower panel (upgrade, sell), speed and pause.
 * The HUD reads a snapshot published at 10Hz, so values settle within ~100ms of a change: assert with polling.
 *
 * Time: a battle needs ~35 s of game time per wave. Tests that must play waves to the end install a fake clock
 * BEFORE loading the page (`useFakeClock`) and step it with `advance()` — each step is one rendered frame carrying
 * up to 30 simulation ticks at x3, so a wave takes a few seconds of real time and the outcome is the same as real
 * time (fixed timestep, invariants #4).
 */
export class BattlePage extends BasePage {
  private fakeClock = false;

  constructor(page: Page) {
    super(page);
  }

  // ── time ────────────────────────────────────────────────────────────────

  /** Must run before the page is loaded: from then on the game only moves when `advance()` says so. */
  async useFakeClock(): Promise<void> {
    await this.page.clock.install();
    this.fakeClock = true;
  }

  /**
   * Moves time forward by `frames` rendered frames of `ms` each. Phaser clamps one frame to 200 ms and, for its
   * first 120 frames, to one display frame (its start-up "cool down"), so `warmUp()` runs those short frames first.
   */
  async advance(frames: number, ms = 200): Promise<void> {
    for (let i = 0; i < frames; i++) await this.page.clock.fastForward(ms);
  }

  async warmUp(): Promise<void> {
    await this.advance(130, 17);
  }

  /** Waits until the HUD exists (the first snapshot reached React). With a fake clock, steps it until then. */
  async waitReady(): Promise<void> {
    if (this.fakeClock) {
      for (let i = 0; i < 100 && (await this.goldChip().count()) === 0; i++) await this.page.clock.runFor(100);
    }
    await this.goldChip().waitFor();
  }

  // ── HUD ─────────────────────────────────────────────────────────────────

  private chip(key: CopyKey): Locator {
    return this.page.getByRole("group", { name: new RegExp(`^${escapeRe(this.t(key))}: `) }).first();
  }

  goldChip(): Locator {
    return this.chip("common.gold");
  }

  livesChip(): Locator {
    return this.chip("common.lives");
  }

  private async chipValue(chip: Locator): Promise<number> {
    const label = (await chip.getAttribute("aria-label")) ?? "";
    return Number(label.replace(/\D+/g, ""));
  }

  async gold(): Promise<number> {
    return this.chipValue(this.goldChip());
  }

  async lives(): Promise<number> {
    return this.chipValue(this.livesChip());
  }

  /** Waves finished so far, as the progressbar's aria-valuenow (0 before the first wave). */
  waveBar(): Locator {
    return this.page.getByRole("progressbar", { name: this.t("battle.wave") }).first();
  }

  async wavesDone(): Promise<number> {
    return Number((await this.waveBar().getAttribute("aria-valuenow")) ?? "0");
  }

  /** "Đợt 1 / 12" as rendered next to the bar. */
  waveNumber(n: number, total: number): Locator {
    return this.page.getByText(new RegExp(`^${escapeRe(this.t("battle.wave"))} ${n}\\s*/ ${total}$`)).first();
  }

  /** The sr-only live region that narrates the battle for screen readers (NFR-A11Y-07). */
  liveRegion(): Locator {
    return this.page.locator('[aria-live="polite"]');
  }

  /** "Đợt tới  5× Lính": one chip per enemy type of the next wave. */
  nextWaveEntry(count: number, enemy: "grunt" | "armored" | "runner"): Locator {
    return this.page.getByText(`${count}× ${this.t(`enemy.${enemy}`)}`, { exact: true }).first();
  }

  canvas(): Locator {
    return this.page.locator("canvas");
  }

  // ── board ───────────────────────────────────────────────────────────────

  /** An empty slot, by its 1-based number. */
  slot(n: number): Locator {
    return this.page.getByRole("button", { name: this.t("battle.slotLabel", { n }), exact: true });
  }

  /** A slot with a tower on it that is not the selected one. */
  builtSlot(n: number): Locator {
    return this.page.getByRole("button", { name: this.t("battle.slotBuilt", { n }), exact: true });
  }

  /** The selected tower's slot: "Cung bậc 1 ở ô số 8". */
  towerSlot(tower: TowerId, level: number, n: number): Locator {
    return this.page.getByRole("button", {
      name: this.t("battle.towerLabel", { tower: this.t(`tower.${tower}`), level, n }),
      exact: true,
    });
  }

  /** Slot n whatever is on it: empty, built, or the selected tower. */
  anySlot(n: number): Locator {
    const empty = this.t("battle.slotLabel", { n });
    const built = this.t("battle.slotBuilt", { n });
    const towerSuffix = this.t("battle.towerLabel", { tower: "¤", level: "¤", n }).split("¤").pop()!;
    return this.page.getByRole("button", {
      name: new RegExp(`^(${escapeRe(empty)}|${escapeRe(built)})$|${escapeRe(towerSuffix)}$`),
    });
  }

  /** Every slot button, whatever its state. */
  allSlots(): Locator {
    const slotPrefix = this.t("battle.slotLabel", { n: "§" }).split("§")[0];
    const towerSuffix = this.t("battle.towerLabel", { tower: "¤", level: "¤", n: "§" }).split("¤").pop()!.split("§")[0];
    return this.page.getByRole("button", {
      name: new RegExp(`^${escapeRe(slotPrefix)}\\d+|${escapeRe(towerSuffix)}\\d+$`),
    });
  }

  // ── build panel ─────────────────────────────────────────────────────────

  towerCards(): Locator {
    return this.page.getByTestId("tower-cards");
  }

  /** A tower card, scoped to the card row: the slot buttons' names also carry tower names. */
  towerCard(tower: TowerId): Locator {
    return this.towerCards().getByRole("button", { name: this.t(`tower.${tower}`) });
  }

  /** The price icon of a tower card: a coin while affordable, a lock when not (NFR-A11Y-06's second channel). */
  towerCardPriceIcon(tower: TowerId): Locator {
    return this.towerCard(tower).locator("svg").last();
  }

  /** The confirm button: "XÂY · 60" once a type is picked, "Chọn một loại tháp" before. */
  confirmBuildButton(): Locator {
    const prefix = this.t("battle.confirmBuild", { cost: "§" }).split("§")[0];
    return this.page.getByRole("button", { name: new RegExp(`^${escapeRe(prefix)}`) });
  }

  pickTowerFirstButton(): Locator {
    return this.page.getByRole("button", { name: this.t("battle.pickTowerFirst"), exact: true });
  }

  cancelButton(): Locator {
    return this.page.getByRole("button", { name: this.t("common.cancel"), exact: true });
  }

  /** The stats line of the tower type being looked at: "Sát thương 12 · Tầm bắn 78 · Nhịp bắn 0,8 s". */
  stat(key: "battle.statDamage" | "battle.statRange" | "battle.statRate"): Locator {
    return this.page.locator("dt", { hasText: this.t(key) }).locator("xpath=following-sibling::dd[1]").first();
  }

  /** The three steps of FR-33: pick the slot, pick the type, confirm. */
  async build(slot: number, tower: TowerId): Promise<void> {
    await this.slot(slot).click();
    await this.towerCard(tower).click();
    await this.confirmBuildButton().click();
  }

  // ── selected tower ──────────────────────────────────────────────────────

  /** "Cung · Bậc 2" — the selected tower's title. */
  towerTitle(tower: TowerId, level: number): Locator {
    return this.page.getByText(`${this.t(`tower.${tower}`)} · ${this.t("tower.level", { level })}`, { exact: true });
  }

  /** The selected tower's damage line: "12 → 18" (current → next level), or "27" at the last level. */
  selectedDamage(): Locator {
    return this.page.locator("dt", { hasText: this.t("battle.statDamage") }).last().locator("xpath=following-sibling::dd[1]");
  }

  /** "Bậc 1 / 3" under the selected tower's title. */
  levelOf(level: number, max = 3): Locator {
    return this.page.getByText(this.t("tower.levelOf", { level, max }), { exact: true });
  }

  upgradeButton(cost?: number): Locator {
    const word = escapeRe(this.t("tower.upgrade"));
    return this.page.getByRole("button", { name: new RegExp(cost === undefined ? `^${word}` : `^${word} ${cost}$`) });
  }

  sellButton(): Locator {
    return this.page.getByRole("button", { name: new RegExp(`^${escapeRe(this.t("tower.sell"))}`) });
  }

  maxLevel(): Locator {
    return this.page.getByText(this.t("tower.maxLevel"), { exact: true });
  }

  // ── wave, speed, pause ──────────────────────────────────────────────────

  /** "GỌI ĐỢT TIẾP THEO" (or "GỌI ĐỢT" in the narrow landscape strip). aria-disabled while a wave runs. */
  callWaveButton(): Locator {
    const full = escapeRe(this.t("battle.callWave"));
    const short = escapeRe(this.t("battle.callWaveShort"));
    return this.page.getByRole("button", { name: new RegExp(`^(${full}|${short})$`) }).first();
  }

  async callWave(): Promise<void> {
    await this.callWaveButton().click();
  }

  speedOption(speed: 1 | 2 | 3): Locator {
    return this.page.getByRole("radiogroup", { name: this.t("battle.speed") }).getByRole("radio", { name: `x${speed}` });
  }

  pauseButton(): Locator {
    return this.page.getByRole("button", { name: this.t("battle.pause"), exact: true });
  }

  resumeButton(): Locator {
    return this.page.getByRole("button", { name: this.t("battle.resume"), exact: true });
  }

  /** The asset-failure overlay (NFR-REL-03). */
  loadError(): Locator {
    return this.page.getByRole("alert");
  }

  retryButton(): Locator {
    return this.page.getByRole("button", { name: this.t("error.retry"), exact: true });
  }

  // ── long runs (fake clock only) ─────────────────────────────────────────

  /** True once the battle has ended and the result screen replaced it. */
  async ended(): Promise<boolean> {
    return (await this.goldChip().count()) === 0;
  }

  /**
   * Plays the wave that is running until the call-wave button is live again (next prep phase) or the battle ends.
   * `between` runs every `every` frames — a hook to spend gold while the wave runs.
   */
  async finishWave(opts: { maxFrames?: number; every?: number; between?: () => Promise<void> } = {}): Promise<void> {
    const { maxFrames = 600, every = 10, between } = opts;
    for (let frame = 1; frame <= maxFrames; frame++) {
      await this.advance(1);
      if (frame % every !== 0) continue;
      if (await this.ended()) return;
      if ((await this.callWaveButton().getAttribute("aria-disabled")) === "false") return;
      if (between) await between();
    }
    throw new Error(`wave still running after ${maxFrames} frames`);
  }

  /** Calls waves back to back (no building) until the battle is over. */
  async callWavesUntilOver(maxWaves = 20): Promise<void> {
    for (let wave = 0; wave < maxWaves; wave++) {
      if (await this.ended()) return;
      await this.callWave();
      await this.finishWave();
    }
    throw new Error(`battle not over after ${maxWaves} waves`);
  }
}
