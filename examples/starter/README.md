# FilmDrop Starter

Minimal host-app showing how to embed `filmdrop-ui` as a library at a
non-root basepath.

## Prerequisites

1. Build the library once from the repo root:

   ```bash
   cd ../..
   npm install
   npm run build:lib
   ```

2. Install starter deps:

   ```bash
   cd examples/starter
   npm install
   ```

3. **Copy the grid-data JSON files** from `../../public/data/` into
   `./public/data/`. These files (`cdem.json`, `doqq.json`, `mgrs.json`,
   `wrs2.json`) are not redistributed through the starter but FilmDrop
   requires them at `${configUrl base}/data/*.json` whenever the
   `grid-code` view is used.

   ```bash
   mkdir -p public/data
   cp ../../public/data/*.json public/data/
   ```

## Run

```bash
npm run dev     # http://localhost:5180/app/
npm run build   # outputs ./dist/
npm run preview # serve ./dist at /app/
```

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

## Notice

This starter intentionally ships **no brand assets**. Consumers must supply
their own brand assets via `config.json` (`BRAND_LOGO`, `LOGIN_LOGO`,
`APP_FAVICON`) and corresponding files placed alongside the config
(e.g. under `public/config/`). FilmDrop renders with a
neutral text wordmark when these are absent.

## Troubleshooting

- **Blank map, 404 for `data/mgrs.json`** — you forgot step 3 above.
- **Theme CSS not applying** — ensure the starter is serving from
  `/app/`; the scoped `.filmdrop-root[data-theme=…]` selectors need the
  wrapper div that `App.jsx` renders.
- **`filmdrop-ui` resolution fails** — run `npm install` in the starter
  AFTER running `npm run build:lib` in the repo root. The starter uses
  `"filmdrop-ui": "file:../.."` which resolves the symlinked package
  against the root's `dist/`.
