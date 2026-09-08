import Phaser from 'phaser';
import { drainIntents, publishSnapshot, SNAPSHOT_INTERVAL_MS } from '../bridge';
import type { BattleSnapshot, BattleSpeed, Selection } from '../bridge';
import { applyIntent, createBattle, type Battle } from '../core/battle';
import { buildCost, sellValue, upgradeCostOf } from '../core/economy';
import { pathAt } from '../core/path';
import { step } from '../core/step';
import { FIXED_DT } from '../core/types';
import type { EntityId } from '../core/types';
import type { UpgradeState } from '../core/upgrades';
import { ENEMIES } from '../data/enemies';
import type { EnemyTypeId } from '../data/enemies';
import type { MapId } from '../data/maps';
import type { BattleOutcome } from '../core/runBattle';
import { readPalette, type Palette } from './palette';

/**
 * Chặn tối đa bao nhiêu tick mô phỏng trong MỘT frame.
 *
 * Tab bị ẩn một phút rồi hiện lại sẽ có `delta` khổng lồ. Không có chặn này thì
 * frame đó cố chạy 3600 tick, treo luồng chính, và trận nhảy vọt về phía trước.
 */
const MAX_STEPS_PER_FRAME = 30;

/** Bán kính chạm quanh tâm ô, đơn vị bản đồ. Ô vẽ 36 đơn vị nên 26 là dễ chạm. */
const SLOT_TAP_RADIUS = 26;

const ENEMY_RADIUS = 13;
const TOWER_RADIUS = 19;

export type BattleSceneConfig = {
  mapId: MapId;
  upgrades: UpgradeState;
  seed: number;
  onFinish: (outcome: BattleOutcome) => void;
};

export class BattleScene extends Phaser.Scene {
  private cfg: BattleSceneConfig;
  private battle!: Battle;
  private pal!: Palette;

  private boardLayer!: Phaser.GameObjects.Graphics;
  private entityLayer!: Phaser.GameObjects.Graphics;
  private overlayLayer!: Phaser.GameObjects.Graphics;

  private acc = 0;
  private speed: BattleSpeed = 1;
  private paused = false;
  private selection: Selection = null;
  private finished = false;

  /** `s` của mỗi enemy ở tick trước, để nội suy vị trí giữa hai tick. */
  private prevS = new Map<EntityId, number>();
  /** Phần tick đã tiêu trong frame hiện tại, dùng làm hệ số nội suy. */
  private alpha = 0;

  constructor(cfg: BattleSceneConfig) {
    super('battle');
    this.cfg = cfg;
  }

  create(): void {
    this.pal = readPalette();
    this.battle = createBattle(this.cfg.mapId, this.cfg.upgrades, this.cfg.seed);

    this.boardLayer = this.add.graphics();
    this.entityLayer = this.add.graphics();
    this.overlayLayer = this.add.graphics();

    this.drawBoard();

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.onTap(p.worldX, p.worldY));

    // Snapshot đi lên ở 10Hz — invariants #7. KHÔNG đẩy trong update().
    this.time.addEvent({
      delay: SNAPSHOT_INTERVAL_MS,
      loop: true,
      callback: () => publishSnapshot(this.buildSnapshot()),
    });
    publishSnapshot(this.buildSnapshot());
  }

  setSpeed(speed: BattleSpeed): void {
    this.speed = speed;
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
  }

  setSelection(selection: Selection): void {
    this.selection = selection;
    publishSnapshot(this.buildSnapshot());
  }

  update(_time: number, deltaMs: number): void {
    for (const intent of drainIntents()) this.handleIntent(intent);

    if (!this.paused && !this.finished) {
      this.acc += deltaMs / 1000;
      const whole = Math.floor(this.acc / FIXED_DT);
      this.acc -= whole * FIXED_DT;

      // Tốc độ x2/x3 = CHẠY NHIỀU TICK HƠN, không nhân dt — invariants #4.
      const wanted = whole * this.speed;
      const steps = Math.min(wanted, MAX_STEPS_PER_FRAME);

      if (steps > 0) {
        this.prevS.clear();
        for (const e of this.battle.state.enemies) this.prevS.set(e.id, e.s);
        for (let i = 0; i < steps; i++) step(this.battle);
      }

      // Tab bị ẩn lâu: bỏ phần dư thay vì để nó dồn lại thành death-spiral.
      if (this.acc > FIXED_DT * 5) this.acc = FIXED_DT * 5;

      this.alpha = this.acc / FIXED_DT;
      this.checkFinished();
    }

    this.drawEntities();
    this.drawOverlay();
  }

  // ── ý định ────────────────────────────────────────────────────────────────

  private handleIntent(intent: ReturnType<typeof drainIntents>[number]): void {
    if (intent.kind === 'select') {
      this.setSelection(this.resolveSelection(intent.target));
      return;
    }

    const before = this.battle.state.towers.length;
    applyIntent(this.battle, intent);

    // Xây xong thì chuyển lựa chọn sang chính tháp vừa xây: người chơi vừa bỏ
    // tiền, thứ họ muốn xem tiếp là tầm bắn của nó.
    if (intent.kind === 'build' && this.battle.state.towers.length > before) {
      const tower = this.battle.state.towers[this.battle.state.towers.length - 1];
      this.selection = this.resolveSelection({ kind: 'tower', towerId: tower.id });
    }
    if (intent.kind === 'sell') this.selection = null;

    publishSnapshot(this.buildSnapshot());
  }

  private resolveSelection(
    target: { kind: 'slot'; slotIndex: number } | { kind: 'tower'; towerId: EntityId } | null,
  ): Selection {
    if (!target) return null;
    const { state, map, rules } = this.battle;

    if (target.kind === 'slot') {
      const slot = map.slots[target.slotIndex];
      if (!slot) return null;
      const occupant = state.towers.find((t) => t.slotIndex === target.slotIndex);
      if (occupant) return this.resolveSelection({ kind: 'tower', towerId: occupant.id });
      return { kind: 'slot', slotIndex: target.slotIndex, x: slot.x, y: slot.y };
    }

    const tower = state.towers.find((t) => t.id === target.towerId);
    if (!tower) return null;
    const slot = map.slots[tower.slotIndex];
    const type = rules.towers[tower.typeId];
    const lv = type.levels[tower.level - 1];
    const next = type.levels[tower.level] ?? null;

    return {
      kind: 'tower',
      towerId: tower.id,
      typeId: tower.typeId,
      slotIndex: tower.slotIndex,
      level: tower.level,
      maxLevel: type.levels.length,
      x: slot.x,
      y: slot.y,
      upgradeCost: upgradeCostOf(rules, tower.typeId, tower.level),
      sellValue: sellValue(rules, tower.typeId, tower.level),
      damage: lv.damage,
      nextDamage: next ? next.damage : null,
    };
  }

  private onTap(x: number, y: number): void {
    const { map } = this.battle;
    let bestIndex = -1;
    let bestD2 = SLOT_TAP_RADIUS * SLOT_TAP_RADIUS;

    for (let i = 0; i < map.slots.length; i++) {
      const s = map.slots[i];
      const d2 = (s.x - x) ** 2 + (s.y - y) ** 2;
      if (d2 <= bestD2) {
        bestD2 = d2;
        bestIndex = i;
      }
    }

    // Chạm ra ngoài mọi ô = bỏ chọn. Chạm vào ô = CHỌN ô, không bao giờ xây —
    // xây cần một hành động thứ hai từ panel React (US-01).
    this.setSelection(bestIndex === -1 ? null : this.resolveSelection({ kind: 'slot', slotIndex: bestIndex }));
  }

  private checkFinished(): void {
    const phase = this.battle.state.phase;
    if (this.finished || (phase !== 'won' && phase !== 'lost')) return;
    this.finished = true;
    publishSnapshot(this.buildSnapshot());
    const { state } = this.battle;
    this.cfg.onFinish({
      won: phase === 'won',
      waveReached: Math.min(state.waveIndex + 1, this.battle.map.waves.length),
      ticks: state.tick,
      livesLeft: state.lives,
      goldEarned: state.stats.goldEarned,
      killed: state.stats.killed,
      leaked: state.stats.leaked,
    });
  }

  // ── snapshot ──────────────────────────────────────────────────────────────

  private buildSnapshot(): BattleSnapshot {
    const { state, map, rules } = this.battle;

    const nextWaveIndex = state.phase === 'wave' ? state.waveIndex + 1 : state.waveIndex;
    const schedule = map.waves[nextWaveIndex] ?? [];
    const grouped = new Map<EnemyTypeId, number>();
    for (const e of schedule) grouped.set(e.enemyId, (grouped.get(e.enemyId) ?? 0) + e.count);

    return {
      tick: state.tick,
      phase: state.phase,
      gold: state.gold,
      lives: state.lives,
      waveNumber: state.waveIndex + 1,
      waveCount: map.waves.length,
      speed: this.speed,
      paused: this.paused,
      selection: this.selection,
      nextWave: [...grouped].map(([enemyId, count]) => ({ enemyId, count })),
      buildOptions: rules.unlockedTowers.map((towerId) => {
        const cost = buildCost(rules, towerId);
        return { towerId, cost, affordable: state.gold >= cost };
      }),
      killed: state.stats.killed,
      leaked: state.stats.leaked,
    };
  }

  // ── vẽ ────────────────────────────────────────────────────────────────────

  private drawBoard(): void {
    const g = this.boardLayer;
    const { map, path } = this.battle;
    const p = this.pal;

    g.clear();
    g.fillStyle(p.grassA, 1).fillRect(0, 0, 400, 400);
    g.fillStyle(p.grassB, 1);
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 20; col++) {
        if ((row + col) % 2 === 0) g.fillRect(col * 20, row * 20, 20, 20);
      }
    }

    const pts = path.waypoints.map((w) => new Phaser.Math.Vector2(w.x, w.y));
    g.lineStyle(52, p.pathEdge, 1);
    g.strokePoints(pts, false, false);
    g.lineStyle(42, p.pathFill, 1);
    g.strokePoints(pts, false, false);

    for (const slot of map.slots) {
      g.fillStyle(p.edge, 0.24).fillRoundedRect(slot.x - 18, slot.y - 18, 36, 36, 7);
      g.lineStyle(2, p.ink, 0.4).strokeRoundedRect(slot.x - 18, slot.y - 18, 36, 36, 7);
    }
  }

  private drawEntities(): void {
    const g = this.entityLayer;
    const { state, map, path } = this.battle;
    const p = this.pal;
    g.clear();

    for (const tower of state.towers) {
      const slot = map.slots[tower.slotIndex];
      g.fillStyle(p.raised, 1).fillCircle(slot.x, slot.y, TOWER_RADIUS);
      g.lineStyle(3, p.edge, 1).strokeCircle(slot.x, slot.y, TOWER_RADIUS);
      const barrel =
        tower.typeId === 'arrow' ? p.act
        : tower.typeId === 'cannon' ? p.gold
        : tower.typeId === 'frost' ? p.frostBarrel
        : tower.typeId === 'bolt' ? p.core
        : p.ok;
      g.fillStyle(barrel, 1).fillCircle(slot.x, slot.y, 8);
      // Bậc hiện bằng SỐ VẠCH, không bằng màu — NFR-A11Y-06.
      g.lineStyle(3, p.edge, 1);
      for (let i = 0; i < tower.level; i++) {
        const x = slot.x - 7 + i * 7;
        g.lineBetween(x, slot.y + 13, x, slot.y + 18);
      }
    }

    for (const e of state.enemies) {
      const from = this.prevS.get(e.id);
      const s = from === undefined ? e.s : from + (e.s - from) * this.alpha;
      const at = pathAt(path, s);
      const type = ENEMIES[e.typeId];
      const body =
        e.typeId === 'grunt' ? p.enemyGrunt
        : e.typeId === 'armored' ? p.enemyArmored
        : p.enemyRunner;

      if (e.typeId === 'armored') {
        g.fillStyle(body, 1).fillRoundedRect(at.x - 13, at.y - 13, 26, 26, 6);
        g.lineStyle(3, p.edge, 1).strokeRoundedRect(at.x - 13, at.y - 13, 26, 26, 6);
      } else {
        g.fillStyle(body, 1).fillCircle(at.x, at.y, ENEMY_RADIUS);
        g.lineStyle(3, p.edge, 1).strokeCircle(at.x, at.y, ENEMY_RADIUS);
      }
      g.fillStyle(p.ink, 1).fillCircle(at.x - 4.5, at.y - 3, 2.6).fillCircle(at.x + 4.5, at.y - 3, 2.6);

      // Thanh máu vẽ TRONG canvas, không trong HUD: snapshot trễ 100ms thì
      // thanh máu sẽ thấy rõ là lệch — ADR-0004 §4.
      const frac = Math.max(0, Math.min(1, e.hp / type.hp));
      g.fillStyle(p.edge, 1).fillRoundedRect(at.x - 13, at.y - 25, 26, 6, 3);
      const barColor = frac > 0.5 ? p.ok : frac > 0.25 ? p.gold : p.danger;
      g.fillStyle(barColor, 1).fillRoundedRect(at.x - 11.5, at.y - 23.5, 23 * frac, 3, 1.5);

      if (state.tick < e.slowUntilTick) {
        g.lineStyle(2, p.frostBarrel, 0.9).strokeCircle(at.x, at.y, ENEMY_RADIUS + 4);
      }
    }

    for (const pr of state.projectiles) {
      const isSplash = pr.splashRadius > 0;
      g.fillStyle(isSplash ? p.gold : p.ink, 1).fillCircle(pr.x, pr.y, isSplash ? 4 : 2.6);
    }

    // Nòng tháp hướng về mục tiêu, vẽ sau enemy để không bị che.
    for (const tower of state.towers) {
      if (tower.targetId === null) continue;
      const target = state.enemies.find((e) => e.id === tower.targetId);
      if (!target) continue;
      const slot = map.slots[tower.slotIndex];
      const at = pathAt(path, target.s);
      const a = Math.atan2(at.y - slot.y, at.x - slot.x);
      g.lineStyle(5, p.edge, 1).lineBetween(
        slot.x, slot.y,
        slot.x + Math.cos(a) * (TOWER_RADIUS - 2),
        slot.y + Math.sin(a) * (TOWER_RADIUS - 2),
      );
    }
  }

  private drawOverlay(): void {
    const g = this.overlayLayer;
    const p = this.pal;
    g.clear();
    const sel = this.selection;
    if (!sel) return;

    if (sel.kind === 'slot') {
      g.fillStyle(p.act, 0.22).fillRoundedRect(sel.x - 21, sel.y - 21, 42, 42, 9);
      g.lineStyle(4, p.act, 1).strokeRoundedRect(sel.x - 21, sel.y - 21, 42, 42, 9);
      return;
    }

    const tower = this.battle.state.towers.find((t) => t.id === sel.towerId);
    if (!tower) return;
    const lv = this.battle.rules.towers[tower.typeId].levels[tower.level - 1];
    const range = Math.sqrt(lv.rangeSq);

    // FR-23 — tầm bắn hiện khi CHỌN, không phải khi rê chuột (MASTER.md §5).
    g.fillStyle(p.act, 0.14).fillCircle(sel.x, sel.y, range);
    g.lineStyle(3, p.act, 1).strokeCircle(sel.x, sel.y, range);
    g.lineStyle(4, p.act, 1).strokeCircle(sel.x, sel.y, TOWER_RADIUS + 3);
  }
}
