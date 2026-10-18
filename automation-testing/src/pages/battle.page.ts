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
  private frozenClock = false;

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
   * Like `useFakeClock`, but time does not flow at all between steps: `page.clock.install` alone keeps the clock
   * running in real time, so a slow machine slips extra game time between two `advance()` calls. Cases that measure
   * WHEN something happens (how many frames until the first leak) need every frame to be exactly `ms` of game time.
   * Playwright's actionability checks wait for animation frames, which never come on a paused clock: clicks on this
   * page object then skip them (`press`) and step one frame after each click so React and the scene catch up.
   */
  async useFrozenClock(): Promise<void> {
    await this.page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
    await this.page.clock.pauseAt(new Date("2026-01-01T00:00:01Z"));
    this.fakeClock = true;
    this.frozenClock = true;
  }

  /** A click that works on a frozen clock too (see `useFrozenClock`). Use it for any button while the clock is frozen. */
  async press(target: Locator): Promise<void> {
    if (!this.frozenClock) return target.click();
    await target.click({ force: true });
    await this.advance(1);
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

  /** Number of DOM mutation records on the HUD bar (<header>) during `ms` of real time. -1 when there is no header. */
  async hudMutations(ms: number): Promise<number> {
    return this.page.evaluate(async (duration) => {
      const hud = document.querySelector("header");
      if (!hud) return -1;
      let count = 0;
      const observer = new MutationObserver((records) => {
        count += records.length;
      });
      observer.observe(hud, { subtree: true, childList: true, characterData: true });
      await new Promise((resolve) => setTimeout(resolve, duration));
      observer.disconnect();
      return count;
    }, ms);
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

  /** The canvas box and the board frame it lives in (invariants #12: the canvas must never outgrow its frame). */
  async canvasFit(): Promise<{ canvas: { w: number; h: number }; frame: { w: number; h: number } } | null> {
    return this.canvas().evaluate((canvas) => {
      const frame = canvas.parentElement?.getBoundingClientRect();
      const box = canvas.getBoundingClientRect();
      return frame ? { canvas: { w: box.width, h: box.height }, frame: { w: frame.width, h: frame.height } } : null;
    });
  }

  speedGroup(): Locator {
    return this.page.getByRole("radiogroup", { name: this.t("battle.speed") });
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

  /** Every tower card of the build panel: three at the start, five once Sét and Độc are unlocked. */
  towerCardButtons(): Locator {
    return this.towerCards().getByRole("button");
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
    await this.press(this.slot(slot));
    await this.press(this.towerCard(tower));
    await this.press(this.confirmBuildButton());
  }

  /** The type description under the build panel's title: "Xuyên giáp, nhắm con nhiều máu nhất." */
  towerDescription(tower: TowerId): Locator {
    return this.page.getByText(this.t(`tower.${tower}.desc` as CopyKey), { exact: true });
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
    await this.press(this.callWaveButton());
  }

  async setSpeed(speed: 1 | 2 | 3): Promise<void> {
    await this.press(this.speedOption(speed));
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

  /**
   * Where the battle is, read without waiting: "prep" (the call button is live), "wave" (it is aria-disabled) or
   * "ended" (no call button: the result screen replaced the battle). A waiting locator call here would hang for the
   * whole test timeout when the battle ends between two checks.
   */
  async phase(): Promise<"prep" | "wave" | "ended"> {
    const disabled = await this.callWaveButton().evaluateAll((els) =>
      els.length === 0 ? null : els[0].getAttribute("aria-disabled"),
    );
    if (disabled === null) return "ended";
    return disabled === "true" ? "wave" : "prep";
  }

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
      const phase = await this.phase();
      if (phase !== "wave") return;
      if (between) await between();
    }
    throw new Error(`wave still running after ${maxFrames} frames`);
  }

  /**
   * Plays the running wave frame by frame and records what the HUD shows after each frame: the frame numbers on which
   * lives dropped, and every change of gold (frame and amount). Stops at the next prep phase or the end of the battle.
   * Frame numbers count from the call of the wave, so with `useFrozenClock` frame × 200 ms is game time.
   */
  async traceWave(maxFrames = 1500): Promise<{ leakFrames: number[]; goldSteps: { frame: number; delta: number }[] }> {
    const leakFrames: number[] = [];
    const goldSteps: { frame: number; delta: number }[] = [];
    let gold = await this.gold();
    let lives = await this.lives();
    for (let frame = 1; frame <= maxFrames; frame++) {
      await this.advance(1);
      if (await this.ended()) return { leakFrames: [...leakFrames, frame], goldSteps };
      const [g, l] = [await this.gold(), await this.lives()];
      if (g !== gold) goldSteps.push({ frame, delta: g - gold });
      if (l < lives) leakFrames.push(frame);
      [gold, lives] = [g, l];
      if (frame % 10 === 0 && (await this.phase()) !== "wave") return { leakFrames, goldSteps };
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
