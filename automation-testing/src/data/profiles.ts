import type { MapId } from "./test-data";
import { MAP_ORDER } from "./test-data";

// The saved profile, shaped exactly like ../client/src/storage/profile.ts → Profile (schemaVersion 1). Tests plant one
// in localStorage before the game reads it, to start from "returning player" states without playing them first.

export interface MapRecord {
  cleared: boolean;
  bestWave: number;
  bestLives: number;
}

export interface Profile {
  schemaVersion: 1;
  locale: "vi" | "en";
  cores: number;
  upgrades: Record<string, number>;
  maps: Record<MapId, MapRecord>;
  settings: { music: number; sfx: number };
  lastMap: MapId | null;
}

/** ../client/src/storage/profile.ts → emptyProfile(): what a first visit starts with. */
export function freshProfile(): Profile {
  const maps = {} as Record<MapId, MapRecord>;
  for (const id of MAP_ORDER) maps[id] = { cleared: false, bestWave: 0, bestLives: 0 };
  return { schemaVersion: 1, locale: "vi", cores: 0, upgrades: {}, maps, settings: { music: 0.5, sfx: 0.8 }, lastMap: null };
}

type ProfilePatch = Partial<Omit<Profile, "maps">> & { maps?: Partial<Record<MapId, Partial<MapRecord>>> };

/** A fresh profile with some fields changed; `maps` entries are merged per map. */
export function profile(patch: ProfilePatch = {}): Profile {
  const base = freshProfile();
  const maps = { ...base.maps };
  for (const [id, record] of Object.entries(patch.maps ?? {})) {
    maps[id as MapId] = { ...maps[id as MapId], ...record };
  }
  return { ...base, ...patch, maps };
}

/** A map cleared once with `lives` left — the shape App.tsx writes after a win. */
export const cleared = (lives = 20, waves = 12): MapRecord => ({ cleared: true, bestWave: waves, bestLives: lives });
