# CLAUDE.md

**Duck Defense** — a browser tower defense game: Vite + React 19 for the shell, Phaser 3
for the battle canvas, a pure-TypeScript simulation in `client/src/core/`. Served from
GitHub Pages (https://levananhduc.github.io/web-game-duck-defense/). No server, no
database, no API: everything runs in the browser and progress stays in `localStorage`.
The methodology layer (docs contract, feature flow, hooks) is `.claude/CLAUDE.md`; read
it before working.

## Layout

| Folder | Holds |
| --- | --- |
| `client/` | the game app: `package.json`, `pnpm-lock.yaml`, `.env.example`, `index.html`, `public/`, `src/`, unit tests (vitest) in `tests/` |
| `automation-testing/` | the end-to-end regression suite (Playwright): requirements, test cases, defects, page objects, specs — its own `package.json`, rules in `automation-testing/CLAUDE.md` |
| `docs/` | product docs, requirements, ADRs, feature specs — map in `docs/README.md` |
| `.claude/`, `.githooks/`, `.github/`, `cliff.toml` | Claude config, git hooks, CI, release notes config — all at the root |

`.env.example` lives at `client/.env.example` (`.claude/CLAUDE.md` still draws it at the
root — same file, it moved with the app).

## Commands

```bash
cd client
pnpm install --frozen-lockfile
pnpm dev              # Vite dev server
pnpm test             # vitest: unit tests, including the FR-32 balance gate
pnpm typecheck
pnpm lint
pnpm build            # tsc, then the production build into client/dist/
pnpm preview          # serve client/dist/
pnpm release:next     # next version, from the commits (git-cliff, repo root)
```

```bash
cd automation-testing
pnpm install && pnpm exec playwright install chromium
pnpm test             # builds ../client (flag off + sign-in flag on), serves both, runs every module
pnpm typecheck
pnpm coverage:check   # REQ ↔ TC ↔ spec ↔ bug; --write regenerates the traceability matrix
```

Regression tests: automation-testing/ (/write-tests)

Git hooks: `git config core.hooksPath .githooks` (commit-msg + pre-commit ESLint on staged
`client/` files).
