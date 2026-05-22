# FilmDrop Starter

Minimal host-app showing how to embed `filmdrop-ui` as a library at a
non-root basepath.

## Quick Start

The starter is wired as an npm workspace, so the quickest path from a
fresh clone is:

`npm run sync:starter-data` is required before `npm run dev:starter`; the
starter data files live in `examples/starter/public/data/` and are gitignored.

```bash
# from the repo root
npm install
npm run build:lib
npm run sync:starter-brand   # mirror brand assets into public/config
npm run sync:starter-data    # mirror grid JSON into public/data (gitignored)
npm run dev:starter          # http://localhost:5180/app/
```

`npm install` at the repo root installs the starter's deps (workspace),
and the two `sync:starter-*` commands populate the public assets the
starter needs at runtime.

When embedding `filmdrop-ui` in a host app, load CSS in this order:
`leaflet/dist/leaflet.css`, `leaflet-draw/dist/leaflet.draw.css`, then
`filmdrop-ui/style.css`.

## Development Modes

There are two ways to develop the starter:

1. **Built-library mode** (default — what consumers will experience):

   ```bash
   npm run build:lib       # rebuild after each library change
   npm run dev:starter
   ```

   The starter resolves `filmdrop-ui` from the parent package's `dist/`
   exactly as a published consumer would.

2. **Source-HMR mode** (fast inner loop while iterating on the library):

   ```bash
   npm run dev:starter:src
   ```

   Sets `FILMDROP_DEV_SRC=1`, which aliases `filmdrop-ui` to
   `../../src/lib-entry.jsx` so saves in `src/` reload instantly without
   `build:lib`. Use this for development only; never publish or measure
   bundle size in this mode.

## Run (inside `examples/starter/`)

```bash
npm run dev     # http://localhost:5180/app/
npm run build   # outputs ./dist/
npm run preview # serve ./dist at /app/
npm run test    # Vitest contract tests for App.jsx
```

## Starter Config Modes

The starter ships two runtime config files under `public/config/`:

- `config.json` (default) - lean starter config with core branding + a compact
  collection setup
- `config.demo.json` - richer demo config with more dataset and UI options

By default, the host loads `config.json`:

- <http://localhost:5180/app/>

To test the demo config, swap it in manually (for example, copy
`config.demo.json` over `config.json`, or temporarily rename the files before
starting the starter):

- `cp examples/starter/public/config/config.demo.json examples/starter/public/config/config.json`

This keeps the out-of-box starter minimal for new adopters while still
providing a richer reference config for manual evaluation.

## What this demonstrates

- **Basepath mount** — Vite's `base: '/app/'` matches
  `FilmDropRoot basename="/app"`. TanStack Router, post-auth redirects,
  and every in-app `<Link>` all honor this prefix. Open
  <http://localhost:5180/app/> and confirm the URL bar never drops back
  to `/`.
- **No host DOM mutation** — `applyDocumentBranding={false}` keeps the
  page `<title>` and favicon under host control. The host chrome header
  at the top of the page stays intact.
- **Host-owned theme preference** — `persistThemePreference={false}`
  prevents FilmDrop from writing to
  `localStorage['APP_THEME_PREFERENCE']`.
- **Host-owned cache busting** — `configCacheBuster="none"` disables the
  `?_cb=<timestamp>` suffix so the host's CDN + ETag strategy wins.
- **`onError` + `onOpenExternal`** — show the two extension points
  embedded hosts usually wire into their own telemetry and routing.

## Container CSS contract

The starter wraps `<FilmDropRoot>` in a `position: relative; contain: layout`
div. See the `Container-escape CSS contract` section of the root
[`README.md`](../../README.md#container-escape-css-contract) for the full
inventory of full-viewport overlays to expect.

## Brand assets

The starter ships with the canonical Element 84 logos and the FilmDrop
favicon committed under `public/config/` so a fresh clone plus
`npm run dev:starter` produces a fully branded preview. These assets are
mirrored from the repo-root `public/` by `npm run sync:starter-brand`
(which is safe to re-run any time the source files change).

External integrators forking this starter must replace these assets
with their own and update `config.json`'s `BRAND_LOGO`, `LOGIN_LOGO`,
and `APP_FAVICON` entries accordingly. The Element 84 / FilmDrop marks
themselves are NOT covered by the Apache 2.0 license that covers the
code; see the top-level [`NOTICE`](../../NOTICE) file for the trademark
boundary. The brand assets are NOT shipped to the published npm tarball
either — only `dist/`, `README.md`, `LICENSE`, `NOTICE`, `CHANGELOG.md`,
and `CONFIGURATION.md` are published.

## For Element 84 coworkers

After `git clone` and `npm install` at the repo root, you should be able
to run `npm run dev:starter` and see the full branded experience with
zero additional configuration. If brand assets look stale, run
`npm run sync:starter-brand`. If grid overlays 404, run
`npm run sync:starter-data`.

## Troubleshooting

- **Blank map, 404 for `data/mgrs.json`** — run `npm run sync:starter-data`
  from the repo root.
- **Theme CSS not applying** — ensure the starter is serving from
  `/app/`; the scoped `.filmdrop-root[data-theme=…]` selectors need the
  wrapper div that `App.jsx` renders.
- **`npm run verify:starter` fails on CSS order** — ensure
  `examples/starter/src/App.jsx` imports CSS in this exact order:
  `leaflet/dist/leaflet.css`, `leaflet-draw/dist/leaflet.draw.css`, then
  `filmdrop-ui/style.css`.
- **`filmdrop-ui` resolution fails** — run `npm install` at the repo
  root (which sets up the workspace) AFTER running `npm run build:lib`.
  The starter declares `"filmdrop-ui": "file:../.."` so the workspace
  resolver points at the parent package's `dist/`.
- **Library edits not appearing** — switch to `npm run dev:starter:src`
  for source HMR, or rerun `npm run build:lib` between iterations.
- **`[BABEL] ... deoptimised the styling ... dist/filmdrop-ui.js`** —
  expected for the large built-library bundle in linked workspace mode;
  this warning is non-blocking and does not indicate runtime failure by
  itself.
