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
import { playSound } from './audio';
import { readPalette, type Palette } from './palette';
import {
  DEPTH, ENEMY_DRAW_SIZE, ENEMY_FRAME, ENEMY_ROTATION_OFFSET, FRAME_GRASS,
  FRAME_TOWER_BASE, GRASS_FILL, PATH_EDGE, PATH_FILL, SHEET_KEY, SHEET_URL,
  TILE, TURRET_FRAME, TURRET_ROTATION_OFFSET,
} from './sprites';

/**
 * Chặn tối đa bao nhiêu tick mô phỏng trong MỘT frame.
 *
 * Tab bị ẩn một phút rồi hiện lại sẽ có `delta` khổng lồ. Không có chặn này thì
 * frame đó cố chạy 3600 tick, treo luồng chính, và trận nhảy vọt về phía trước.
 */
const MAX_STEPS_PER_FRAME = 30;

/** Bán kính chạm quanh tâm ô, đơn vị bản đồ. Ô vẽ 36 đơn vị nên 26 là dễ chạm. */
const SLOT_TAP_RADIUS = 26;

const TOWER_BASE_SIZE = 40;
const TURRET_SIZE = 34;
/**
 * Ô cỏ vẽ ở ĐÚNG 64 đơn vị = đúng 64 texel của frame, tỉ lệ 1:1.
 *
 * Lát ở 50 đơn vị (400/8, cho vừa khít) thì phải thu nhỏ 0,78 lần, và lọc
 * LINEAR khi đó lấy mẫu lấn sang frame kế bên trong sheet — sheet không có
 * padding giữa các frame. Kết quả là những đường chỉ mờ chạy dọc và ngang khắp
 * bàn chơi. Ở tỉ lệ 1:1 không có phép thu nhỏ nào nên không có lấn.
 *
 * Hệ quả: 400 / 64 = 6,25 nên phải lát 7×7 ô và phần dư tràn ra ngoài — canvas
 * và khung board đều kẹp nó lại.
 */
const GRASS_TILE = TILE;

export type BattleSceneConfig = {
  mapId: MapId;
  upgrades: UpgradeState;
  seed: number;
  onFinish: (outcome: BattleOutcome) => void;
  /** NFR-REL-03 — nạp asset thất bại phải hiện lỗi, không treo mãi. */
  onLoadError: (file: string) => void;
};

type TowerSprites = {
  base: Phaser.GameObjects.Image;
  turret: Phaser.GameObjects.Image;
  level: Phaser.GameObjects.Graphics;
};

export class BattleScene extends Phaser.Scene {
  private cfg: BattleSceneConfig;
  private battle!: Battle;
  private pal!: Palette;

  private boardLayer!: Phaser.GameObjects.Graphics;
  private effectLayer!: Phaser.GameObjects.Graphics;
  private overlayLayer!: Phaser.GameObjects.Graphics;

  private towerSprites = new Map<EntityId, TowerSprites>();
  private enemySprites = new Map<EntityId, Phaser.GameObjects.Image>();

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

  preload(): void {
    // NFR-REL-03: mất mạng giữa lúc tải, hoặc `base` sai sau khi deploy, thì
    // phải BÁO, không được đứng ở trạng thái nạp vô hạn.
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      this.cfg.onLoadError(String(file.src ?? file.key));
    });
    this.load.spritesheet(SHEET_KEY, `${import.meta.env.BASE_URL}${SHEET_URL}`, {
      frameWidth: TILE,
      frameHeight: TILE,
    });
  }

  create(): void {
    this.pal = readPalette();
    this.battle = createBattle(this.cfg.mapId, this.cfg.upgrades, this.cfg.seed);

    this.drawGrass();

    this.boardLayer = this.add.graphics().setDepth(DEPTH.path);
    this.effectLayer = this.add.graphics().setDepth(DEPTH.effects);
    this.overlayLayer = this.add.graphics().setDepth(DEPTH.overlay);

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
      const steps = Math.min(whole * this.speed, MAX_STEPS_PER_FRAME);

      if (steps > 0) {
        this.prevS.clear();
        for (const e of this.battle.state.enemies) this.prevS.set(e.id, e.s);

        // Âm thanh suy ra từ CHÊNH LỆCH state trước/sau, không phải từ callback
        // trong `core/`: `core/` không được biết tới âm thanh (ADR-0003), và một
        // callback xuyên tầng sẽ là đường dây đầu tiên phá ranh giới đó.
        const before = {
          killed: this.battle.state.stats.killed,
          leaked: this.battle.state.stats.leaked,
          shots: this.battle.state.nextId,
        };

        for (let i = 0; i < steps; i++) step(this.battle);

        const after = this.battle.state.stats;
        if (this.battle.state.nextId > before.shots) playSound('shoot');
        if (after.killed > before.killed) playSound('kill');
        if (after.leaked > before.leaked) playSound('leak');
      }

      // Tab bị ẩn lâu: bỏ phần dư thay vì để nó dồn lại thành death-spiral.
      if (this.acc > FIXED_DT * 5) this.acc = FIXED_DT * 5;

      this.alpha = this.acc / FIXED_DT;
      this.checkFinished();
    }

    this.syncEnemies();
    this.syncTowers();
    this.drawEffects();
    this.drawOverlay();
  }

  // ── ý định ────────────────────────────────────────────────────────────────

  private handleIntent(intent: ReturnType<typeof drainIntents>[number]): void {
    if (intent.kind === 'select') {
      this.setSelection(this.resolveSelection(intent.target));
      return;
    }

    const before = this.battle.state.towers.length;
    const levelBefore =
      intent.kind === 'upgrade'
        ? (this.battle.state.towers.find((t) => t.id === intent.towerId)?.level ?? 0)
        : 0;
    applyIntent(this.battle, intent);

    // Xây xong thì chuyển lựa chọn sang chính tháp vừa xây: người chơi vừa bỏ
    // tiền, thứ họ muốn xem tiếp là tầm bắn của nó.
    if (intent.kind === 'build' && this.battle.state.towers.length > before) {
      const tower = this.battle.state.towers[this.battle.state.towers.length - 1];
      this.selection = this.resolveSelection({ kind: 'tower', towerId: tower.id });
      playSound('build');
    }
    if (intent.kind === 'upgrade') {
      const now = this.battle.state.towers.find((t) => t.id === intent.towerId)?.level ?? 0;
      if (now > levelBefore) playSound('upgrade');
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
    this.setSelection(
      bestIndex === -1 ? null : this.resolveSelection({ kind: 'slot', slotIndex: bestIndex }),
    );
  }

  private checkFinished(): void {
    const phase = this.battle.state.phase;
    if (this.finished || (phase !== 'won' && phase !== 'lost')) return;
    this.finished = true;
    playSound(phase === 'won' ? 'win' : 'lose');
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

  /**
   * Cỏ lát bằng 64 ảnh tĩnh 50×50, không bằng `tileSprite`.
   *
   * `tileSprite` lấy frame từ một spritesheet phải đi qua texture canvas nội bộ
   * và lặp theo kích thước frame gốc (64 đơn vị), nên nó không lát khít 400 đơn
   * vị. 64 ảnh tĩnh thì khít chắc chắn, và với một bàn chơi tĩnh thì chi phí
   * bằng không.
   */
  private drawGrass(): void {
    // Nền đặc trước: một pixel hở giữa hai ô thì lộ ra cỏ, không lộ ra nền đen.
    this.add
      .rectangle(200, 200, 400, 400, GRASS_FILL)
      .setDepth(DEPTH.grass - 0.1);

    const count = Math.ceil(400 / GRASS_TILE);
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        this.add
          .image(
            col * GRASS_TILE + GRASS_TILE / 2,
            row * GRASS_TILE + GRASS_TILE / 2,
            SHEET_KEY,
            FRAME_GRASS,
          )
          .setDepth(DEPTH.grass);
      }
    }
  }

  private drawBoard(): void {
    const g = this.boardLayer;
    const { map, path } = this.battle;
    const p = this.pal;
    g.clear();

    const pts = path.waypoints.map((w) => new Phaser.Math.Vector2(w.x, w.y));
    g.lineStyle(52, PATH_EDGE, 1);
    g.strokePoints(pts, false, false);
    g.lineStyle(42, PATH_FILL, 1);
    g.strokePoints(pts, false, false);

    // Ô xây được: dấu nét đứt, KHÔNG dùng sprite bệ tháp — bệ chỉ xuất hiện khi
    // đã có tháp, nên ô trống phải đọc ra là "đất trống", không phải "bệ hỏng".
    const slots = this.add.graphics().setDepth(DEPTH.slots);
    for (const slot of map.slots) {
      slots.fillStyle(p.edge, 0.2).fillRoundedRect(slot.x - 18, slot.y - 18, 36, 36, 7);
      slots.lineStyle(2, p.ink, 0.45).strokeRoundedRect(slot.x - 18, slot.y - 18, 36, 36, 7);
    }

    // Lối vào (sáng) và lối ra (đỏ). Đặt LÙI VÀO 26 đơn vị, không phải 8: điểm
    // đầu và điểm cuối của polyline nằm NGOÀI khung 400×400 để enemy đi vào và
    // đi ra khỏi màn hình, nên dấu đặt ở 8 sẽ bị cắt mất nửa ở mép.
    const ends = this.add.graphics().setDepth(DEPTH.slots);
    const entry = pathAt(path, 26);
    const exit = pathAt(path, path.length - 26);
    ends.fillStyle(p.ink, 0.9).fillCircle(entry.x, entry.y, 7);
    ends.fillStyle(p.danger, 1).fillCircle(exit.x, exit.y, 9);
    ends.lineStyle(3, p.edge, 1).strokeCircle(exit.x, exit.y, 9);
  }

  private syncEnemies(): void {
    const { state, path } = this.battle;
    const seen = new Set<EntityId>();

    for (const e of state.enemies) {
      seen.add(e.id);
      let sprite = this.enemySprites.get(e.id);
      if (!sprite) {
        sprite = this.add
          .image(0, 0, SHEET_KEY, ENEMY_FRAME[e.typeId])
          .setDisplaySize(ENEMY_DRAW_SIZE[e.typeId], ENEMY_DRAW_SIZE[e.typeId])
          .setDepth(DEPTH.enemy);
        this.enemySprites.set(e.id, sprite);
      }

      const from = this.prevS.get(e.id);
      const s = from === undefined ? e.s : from + (e.s - from) * this.alpha;
      const at = pathAt(path, s);
      const ahead = pathAt(path, Math.min(path.length, s + 6));

      sprite.setPosition(at.x, at.y);
      sprite.setRotation(Math.atan2(ahead.y - at.y, ahead.x - at.x) + ENEMY_ROTATION_OFFSET);
      // Bị làm chậm: nhuộm xanh băng. Vẫn kèm vòng băng ở `drawEffects` nên
      // trạng thái không chỉ phân biệt bằng màu (NFR-A11Y-06).
      if (state.tick < e.slowUntilTick) sprite.setTint(0x9fe2f0);
      else sprite.clearTint();
    }

    for (const [id, sprite] of this.enemySprites) {
      if (seen.has(id)) continue;
      sprite.destroy();
      this.enemySprites.delete(id);
    }
  }

  private syncTowers(): void {
    const { state, map, path } = this.battle;
    const p = this.pal;
    const seen = new Set<EntityId>();

    for (const tower of state.towers) {
      seen.add(tower.id);
      const slot = map.slots[tower.slotIndex];
      let group = this.towerSprites.get(tower.id);

      if (!group) {
        group = {
          base: this.add
            .image(slot.x, slot.y, SHEET_KEY, FRAME_TOWER_BASE)
            .setDisplaySize(TOWER_BASE_SIZE, TOWER_BASE_SIZE)
            .setDepth(DEPTH.tower),
          turret: this.add
            .image(slot.x, slot.y, SHEET_KEY, TURRET_FRAME[tower.typeId])
            .setDisplaySize(TURRET_SIZE, TURRET_SIZE)
            .setDepth(DEPTH.tower + 0.1),
          level: this.add.graphics().setDepth(DEPTH.tower + 0.2),
        };
        this.towerSprites.set(tower.id, group);
      }

      // Nòng quay về mục tiêu. Sprite nòng trong pack chĩa LÊN nên cộng π/2.
      const target =
        tower.targetId === null ? undefined : state.enemies.find((e) => e.id === tower.targetId);
      if (target) {
        const at = pathAt(path, target.s);
        group.turret.setRotation(Math.atan2(at.y - slot.y, at.x - slot.x) + TURRET_ROTATION_OFFSET);
      }

      // Bậc hiện bằng SỐ VẠCH, không bằng màu — NFR-A11Y-06.
      group.level.clear();
      for (let i = 0; i < tower.level; i++) {
        const x = slot.x - 8 + i * 6;
        group.level.fillStyle(p.ink, 1).fillRect(x, slot.y + 15, 3, 6);
        group.level.lineStyle(1, p.edge, 1).strokeRect(x, slot.y + 15, 3, 6);
      }
    }

    for (const [id, group] of this.towerSprites) {
      if (seen.has(id)) continue;
      group.base.destroy();
      group.turret.destroy();
      group.level.destroy();
      this.towerSprites.delete(id);
    }
  }

  /** Thanh máu, vòng băng, đạn — thứ đổi mỗi frame và không cần sprite riêng. */
  private drawEffects(): void {
    const g = this.effectLayer;
    const { state, path } = this.battle;
    const p = this.pal;
    g.clear();

    for (const e of state.enemies) {
      const from = this.prevS.get(e.id);
      const s = from === undefined ? e.s : from + (e.s - from) * this.alpha;
      const at = pathAt(path, s);
      const type = ENEMIES[e.typeId];
      const half = ENEMY_DRAW_SIZE[e.typeId] / 2;

      // Thanh máu vẽ TRONG canvas, không trong HUD: snapshot trễ 100ms thì
      // thanh máu sẽ thấy rõ là lệch — ADR-0004 §4.
      const frac = Math.max(0, Math.min(1, e.hp / type.hp));
      const barY = at.y - half - 8;
      g.fillStyle(p.edge, 1).fillRoundedRect(at.x - 14, barY, 28, 6, 3);
      const barColor = frac > 0.5 ? p.ok : frac > 0.25 ? p.gold : p.danger;
      g.fillStyle(barColor, 1).fillRoundedRect(at.x - 12.5, barY + 1.5, 25 * frac, 3, 1.5);

      if (state.tick < e.slowUntilTick) {
        g.lineStyle(2, p.frostBarrel, 0.95).strokeCircle(at.x, at.y, half + 3);
      }
    }

    for (const pr of state.projectiles) {
      const splash = pr.splashRadius > 0;
      g.fillStyle(p.edge, 1).fillCircle(pr.x, pr.y, splash ? 5 : 3.4);
      g.fillStyle(splash ? p.gold : p.ink, 1).fillCircle(pr.x, pr.y, splash ? 3.5 : 2.2);
    }
  }

  private drawOverlay(): void {
    const g = this.overlayLayer;
    const p = this.pal;
    g.clear();
    const sel = this.selection;
    if (!sel) return;

    if (sel.kind === 'slot') {
      g.fillStyle(p.act, 0.24).fillRoundedRect(sel.x - 21, sel.y - 21, 42, 42, 9);
      g.lineStyle(4, p.act, 1).strokeRoundedRect(sel.x - 21, sel.y - 21, 42, 42, 9);
      return;
    }

    const tower = this.battle.state.towers.find((t) => t.id === sel.towerId);
    if (!tower) return;
    const lv = this.battle.rules.towers[tower.typeId].levels[tower.level - 1];
    const range = Math.sqrt(lv.rangeSq);

    // FR-23 — tầm bắn hiện khi CHỌN, không phải khi rê chuột (MASTER.md §5).
    g.fillStyle(p.act, 0.13).fillCircle(sel.x, sel.y, range);
    g.lineStyle(3, p.act, 1).strokeCircle(sel.x, sel.y, range);
    g.lineStyle(4, p.act, 1).strokeCircle(sel.x, sel.y, TOWER_BASE_SIZE / 2 + 3);
  }
}
