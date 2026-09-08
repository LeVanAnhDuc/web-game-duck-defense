# Phòng Tuyến — a browser tower defense

A 2D tower defense game that runs straight in the browser. No install, no
account, no backend. Progress lives in the player's own browser.

Playable with a finger or a mouse, in Vietnamese or English, from a 375px phone
in either orientation up to a 1440px desktop.

## Features

- Five hand-built maps, twelve to eighteen waves each, unlocked in order.
- Five tower lines — fast single-target, splash cannon, area slow, wide-splash
  bolt and armour-piercing venom — each with three in-battle upgrade levels.
- Three enemy types with their own speed, armour and bounty, including an
  armoured line that only pierce damage handles well.
- A global upgrade tree in four branches, bought with `cores` earned from
  battles. A loss still pays, and replaying a cleared map pays much less than
  a first clear.
- Battle speed at x1, x2 or x3, plus pause. Speed runs more simulation ticks
  rather than scaling time, so the outcome is identical at any frame rate.
- Progress saved to the browser. A save that cannot be read is kept aside
  rather than deleted, and the player is told what happened.
- Vietnamese and English, switchable without a reload.
- Every battle action reachable by keyboard, with `1 2 3` to pick a tower,
  `Space` to call a wave and `Esc` to clear the selection.
- Respects `prefers-reduced-motion`.

## Running it

```bash
npm ci
npm run dev          # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | typecheck, then production build into `dist/` |
| `npm run preview` | serve the production build at the root |
| `npm run preview:pages` | serve a `GITHUB_PAGES=true` build **under its real sub-path** |
| `npm test` | Vitest — 220 tests, no browser needed |
| `npm run test:e2e` | Playwright — 15 tests in Chromium, starts its own server on port 5273 |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

There are **no environment variables**. `.env.example` is intentionally empty —
nothing in the code reads one.

## How it fits together

```
src/core/     pure TypeScript simulation — no Phaser, no React, no DOM
src/data/     balance tables and map definitions — numbers, no logic
src/game/     Phaser: renders the battle, reads input on the canvas, plays audio
src/ui/       React: every screen, the HUD, the upgrade tree
src/bridge/   the only place ui/ and game/ talk to each other
src/storage/  reads and writes the saved profile, defensively
src/i18n/     vi and en dictionaries
```

Two rules carry most of the design:

**`core/` does not know it is in a browser.** It runs in Node, so a whole battle
can be simulated in under 200ms with no canvas. That is what makes the balance
gate possible: `tests/balance/maps-are-beatable.test.ts` plays every map twice —
once with the reference layout handed over for free, and once with a simulated
player who may only spend the gold it actually earns — and fails if any map
cannot be won with no upgrades at all. ESLint enforces the boundary.

**React never renders per frame.** The battle publishes a reduced snapshot at
10Hz and React reads that. Enemy health bars are drawn inside the canvas
precisely because a 100ms lag would be visible on them.

The reasoning behind each choice is in [`docs/decisions/`](docs/decisions/); the
things that break silently are in
[`docs/03-design/invariants.md`](docs/03-design/invariants.md). Read that file
before changing anything in `src/core/`.

## Art

Sprites are from the [Kenney Tower Defense (top-down)
pack](https://kenney.nl/assets/tower-defense-top-down), CC0. The licence ships
with them at `public/assets/kenney/License.txt`.

The road is still drawn as vectors rather than with the pack's road tiles: those
are 64px grid tiles, while the maps are free polylines at arbitrary coordinates.
Adopting them would mean re-authoring all five maps onto a grid and rebalancing
every one of them. The road colours are sampled from the pack so the two do not
clash. See `docs/04-state/backlog.md`.

## Deploying

Pushing to `main` builds and publishes to GitHub Pages. The build needs
`GITHUB_PAGES=true` so Vite emits the right `base` — get that wrong and the site
works locally and serves a blank page in production.

**Do not use `npm run preview` to check that.** It serves `dist/` from the root,
so a request for `/web-game-tower-defense/assets/index-*.js` hits the SPA
fallback and comes back as HTML. The page fails to boot and it looks as though
`base` is wrong, when in fact `base` is exactly right for Pages. Use:

```bash
GITHUB_PAGES=true npm run build
npm run preview:pages     # http://localhost:5275/web-game-tower-defense/
```

That serves the build under its real sub-path and returns a genuine 404 for a
missing asset instead of hiding it behind index.html.
