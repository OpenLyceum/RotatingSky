# Rotating Sky

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

An interactive astronomy simulation about how the sky appears to rotate for an
observer on Earth, built with [SceneryStack](https://scenerystack.org/),
Vite 8, TypeScript 7, and Biome 2.

## Features

- Three screens:
  1. **Horizon System** (`src/horizon-system/`) — the local sky from an observer's horizon.
  2. **Celestial Sphere** (`src/celestial-sphere/`) — the celestial sphere, its equator, ecliptic, and poles.
  3. **Explorer** (`src/explorer/`) — the combined, interactive rotating-sky explorer.
- Model/view separation per screen
- English, Spanish, and French localization via `StringManager`
- Default and projector color profiles
- Programmatic, locale-aware home-screen / navigation-bar icons
- Progressive Web App (installable, offline-capable)
- Git hooks for Biome pre-commit checks
- Shared GitHub Actions CI via `OpenLyceum/Baton`

Multi-screen conventions (per-screen folders, shared state): [SceneryStackTemplate `doc/multi-screen.md`](https://github.com/OpenLyceum/SceneryStackTemplate/blob/main/doc/multi-screen.md).

### NAAP reference sources

Upstream Flash / AIR / React NAAP sources live in the sibling
[`Baseline`](https://github.com/OpenLyceum/Baseline) repo under `Astronomy/`
(see `baselines.json`). Clone Baseline with the fleet bootstrap, then:

```bash
(cd ../Baseline && ./scripts/fetch-baselines.sh)
```

`npm run decompile` reads `.swf` files from
`../Baseline/Astronomy/flash-animations` and writes ActionScript into the
sim-local gitignored `NAAP/decompiled/` (requires Java; one-time
`npm run decompile -- --setup`).

## Quick Start

```bash
npm install
npm run icons    # generate PNG icons from public/icons/icon.svg
npm start        # dev server → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run Vitest unit tests (includes memory-leak suite) |
| `npm run test:fuzz` | Optional Playwright fuzz smoke: pointer (`?fuzz`) + keyboard (`?fuzzBoard`), with `?ea`, 30s each |
| `npm run test:fuzz -- 90` | Same fuzz for 90 seconds (`--duration 90` or `FUZZ_DURATION=90` also work) |
| `npm run test:fuzz:quick` | Shorter fuzz smoke (10s) |
| `npm run test:fuzz:long` | Longer fuzz smoke (300s) |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome lint check |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run release` | `check && lint && build && test`, then version patch + push tags |
| `npm run clean` | Remove `dist/` |

New sims start at `version: "0.0.0"` in `package.json`. Bump only when cutting a release (for example `npm version patch` and a matching git tag). Keep `name` in kebab-case; it is separate from the SceneryStack sim identifier in `src/init.ts`, which reads its `version` from `package.json`.

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^7 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.5 | Linting + formatting |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^1 | PWA + service worker |

## License

GNU Affero General Public License v3.0 — see [OpenLyceum org license](https://github.com/OpenLyceum/.github/blob/main/LICENSE).

## Contributing

See [OpenLyceum contributing guidelines](https://github.com/OpenLyceum/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.
