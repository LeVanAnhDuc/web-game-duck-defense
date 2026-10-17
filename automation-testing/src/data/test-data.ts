// Constants for test input. No .env, no network: values only. Every number below is copied from the app with its
// source, so a balance change is fixed here, not in specs.

// localStorage / sessionStorage keys the game owns:
//   ../client/src/storage/profile.ts → PROFILE_KEY (and `${PROFILE_KEY}.corrupt.<ts>` for a save it could not read)
//   ../client/src/auth/config.ts → DUCKER_PKCE_KEY (sessionStorage, only while a sign-in is in flight)
export const STORAGE = {
  profile: "duckdefense.profile",
  corruptPrefix: "duckdefense.profile.corrupt.",
  pkce: "ducker.pkce",
} as const;

export type MapId = "m01" | "m02" | "m03" | "m04" | "m05";
// ../client/src/data/maps/index.ts → MAP_ORDER, and the waves array length of each map file.
export const MAP_ORDER: MapId[] = ["m01", "m02", "m03", "m04", "m05"];

export type TowerId = "arrow" | "cannon" | "frost" | "bolt" | "venom";

// ../client/src/data/maps/m0*.ts — start gold, start lives and wave count of each map.
export const MAPS: Record<MapId, { startGold: number; startLives: number; waves: number }> = {
  m01: { startGold: 260, startLives: 20, waves: 12 },
  m02: { startGold: 240, startLives: 18, waves: 14 },
  m03: { startGold: 320, startLives: 16, waves: 14 },
  m04: { startGold: 300, startLives: 16, waves: 16 },
  m05: { startGold: 320, startLives: 14, waves: 18 },
};
// ../client/src/data/maps/m01-dong-co.ts — the first map: 10 slots, first wave = 5 grunts, second = 8 grunts.
export const M01 = { ...{ startGold: 260, startLives: 20, waves: 12 }, firstWave: { grunt: 5 }, secondWave: { grunt: 8 }, slots: 10 } as const;

// ../client/src/data/towers.ts — build cost, level-1 stats (range is the square root of rangeSq, cooldown in ticks of
// 1/60 s) and upgrade costs per level.
export const TOWERS = {
  arrow: { cost: 60, damage: [12, 18, 27], range: 78, cooldownTicks: 50, upgrade: [60, 110] },
  cannon: { cost: 110, damage: [28, 41, 60], range: 66, cooldownTicks: 110, upgrade: [120, 200] },
  frost: { cost: 90, damage: [4, 6, 9], range: 70, cooldownTicks: 70, upgrade: [95, 160] },
  bolt: { cost: 260 },
  venom: { cost: 300 },
} as const;

// ../client/src/core/economy.ts → sellValue: floor(spent × sellRatio); sellRatio 0.5, 0.75 with the `sellRatio` node.
export const SELL_RATIO = 0.5;

// ../client/src/data/enemies.ts — every grunt that reaches the end of the road costs one life.
export const GRUNT_LEAK = 1;

// ../client/src/core/rewards.ts — cores after a battle.
export const REWARDS = { perWave: 8, firstClearBonus: 120, replayFactor: 0.35 } as const;

// ../client/src/data/upgradeTree.ts — the nodes the workshop tests touch: costs per level and prerequisites.
export const UPGRADES = {
  startGold: { costs: [60, 110, 180, 270], perLevel: 50, maxLevel: 4 },
  bounty: { costs: [80, 140, 220], maxLevel: 3 },
  waveInterest: { costs: [220, 360], needs: { node: "bounty", level: 2 } },
  sellRatio: { costs: [190], maxLevel: 1, needs: { node: "buildCost", level: 1 } },
  buildCost: { costs: [85, 150, 240] },
  unlockBolt: { costs: [300], needs: { node: "arrowDamage", level: 3 } },
} as const;
// TOTAL_TREE_COST: the sum of every cost of every node in ../client/src/data/upgradeTree.ts.
export const TOTAL_TREE_COST = 5545;

// The two Ducker ID builds (playwright.config.ts → FLAG_ON_ENV). The issuer is never resolved: the issuer fixture
// answers every request to it (ADR-0010).
export const DUCKER = {
  issuer: "http://ducker.test",
  profilePath: "/profile",
  user: { sub: "u1", name: "Lê Văn Anh Đức", email: "duc@ducker.id" },
} as const;

// Layout breakpoints of the battle screen (../client/src/hooks/useLayoutMode.ts) and the widths FR-30 names.
export const VIEWPORTS = {
  phone: { width: 375, height: 812 },
  phoneLandscape: { width: 812, height: 375 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1024, height: 768 },
  desktop: { width: 1440, height: 900 },
} as const;
