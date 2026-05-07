# Contributing to FilmDrop UI

Thank you for contributing. This project is a React component library (and
standalone SPA) published to npm. Changes must preserve both modes.

## Quality gates (required before commit)

Run in this exact order:

1. `npm run format-fix && npm run lint-fix`
2. `npm run lint && npm run format`
3. `npm run typecheck`
4. `npm run test-pre-commit`

`npm run test-nocov` is **forbidden** in this repository — the coverage
pipeline is wired into `vitest --run` via `npm run coverage`.

## Dependency & Effect Discipline

- Stable refs (`dispatch`, `navigate`, TanStack hook returns) **must not**
  appear in hook dependency arrays. Flag every intentional omission in the
  PR description.
- Prefer derivations, event handlers, and render-time compute over
  `useEffect`. Do not add effect chains (A sets state that triggers B).
- Reuse existing helpers (`addTimeoutToMap`, `buildStacRequestHeaders`,
  `useDebouncedCallback`) instead of inventing new ones.

## Host DOM contract

FilmDrop must be safe to embed beside arbitrary host chrome. Every PR
that touches a component or utility should honor the following audit:

1. **`document.title` / favicon / `<html data-theme>`** — gated by
   `shouldApplyDocumentBranding()` (see `src/utils/themeHelper.js`).
   Enabled by default for SPA mode; embed consumers opt out via
   `applyDocumentBranding={false}`.
2. **`document.body` mutations** — only `useResizablePanel` writes
   `body.style.{cursor,userSelect}` during an active drag, and the prior
   values are captured into refs on `mousedown` and restored on
   `mouseup`/unmount. No other component is allowed to mount nodes on
   `document.body`.
3. **`document.activeElement` / `execCommand`** — forbidden. Focus
   management uses React refs (see `MultiSelect`), downloads use a
   detached `<a>` + synthetic click (see `ExportButton`), and clipboard
   uses `navigator.clipboard.writeText` unconditionally (see
   `clipboardHelper`).
4. **`localStorage` / `sessionStorage`** — `APP_AUTH_TOKEN`,
   `APP_THEME_PREFERENCE`, and `POST_AUTH_REDIRECT_URL` are the only
   keys. `APP_THEME_PREFERENCE` is additionally gated by
   `shouldPersistThemePreference()`.
5. **CSS scoping** — any new selector targeting theme CSS variables must
   ship both `:root[data-theme=…]` and `.filmdrop-root[data-theme=…]`
   branches. `validateThemeCSS` accepts either form.

Run `grep -rn "document\.\(title\|body\|head\|documentElement\|activeElement\|execCommand\)" src/`
to reproduce the audit; every match should land inside a gated helper.

## Quick Start

Three development flows are supported:

1. **Library tests / SPA dev** — at the repo root:

   ```bash
   npm install
   npm run start          # dev server for the standalone SPA
   npm run test-pre-commit
   ```

2. **Built-library starter** — exercises the published-style consumer
   path. Use this for any change that touches the public API surface:

   ```bash
   npm run build:lib
   npm run sync:starter-brand
   npm run sync:starter-data
   npm run dev:starter         # http://localhost:5180/app/
   npm run verify:starter      # after `npm run build:starter`
   ```

3. **Source-HMR starter** — fast inner loop while iterating on library
   internals. Aliases `filmdrop-ui` to `src/lib-entry.jsx`:

   ```bash
   npm run dev:starter:src     # FILMDROP_DEV_SRC=1
   ```

   Do not use this mode for bundle-size measurement or release
   verification — `verify:starter` and `verify:consumer` will refuse
   to run with `FILMDROP_DEV_SRC=1` set.

## Releasing

The release-time gate is `scripts/phase4-final-check.sh`. It runs the
full pipeline (format, lint, typecheck, library tests, library build,
library verify, starter sync, starter build, starter verify, consumer
smoke, type smoke, starter tests, `npm pack --dry-run`) and exits
non-zero on any failure. CI runs the same set in
`.github/workflows/ci.yml`.

A release is unblocked when all of the following are green on `main`:

- `verify:lib`, `verify:consumer`, `verify:starter`, `verify:types`
- Library + starter Vitest suites
- `audit-prod` (no high/critical advisories on production deps)
- A reviewer has signed off on `CHANGELOG.md` and `package.json`
  version bump.

## Supply chain security

- `npm install` always uses the committed `package-lock.json`. Lockfile
  drift is a CI failure.
- The `audit-prod` script scans only production deps and is the gate;
  `audit-all` (which includes devDependencies) is informational.
- Vulnerability exceptions are tracked in `.nsprc` (a JSON array of advisory
  IDs) at the repo root. `better-npm-audit` reads it automatically when running
  `npm run audit-prod`. Document the reason for each exception in the PR
  description and update CHANGELOG.md with a removal criterion (e.g., "remove
  when dependency X reaches version Y").
- It is normal for `.nsprc` to be an empty array (`[]`) when there are no
  active temporary exceptions.
- `verify:consumer` enforces the published-tarball allow-list
  (`dist/`, `README.md`, `LICENSE`, `NOTICE`, `CHANGELOG.md`,
  `CONFIGURATION.md`) and verifies that peer dependencies remain
  external in the bundle. Any new top-level file requires an explicit
  allow-list update.
- The verifier also asserts there is no peer-dependency duplication in
  the starter workspace. If `npm ls -w filmdrop-starter` shows two
  copies of React, Redux, or any other peer, the embedded host will
  silently misbehave; align ranges or add to `resolve.dedupe`.

## Versioning

FilmDrop UI follows Semantic Versioning. See the SemVer + deprecation
section later in this file and the `Versioning` section of `README.md`
for what counts as a breaking change.

## Asset management

FilmDrop resolves config + data assets from the directory base set by
`FilmDropRoot`'s `configUrl` prop (or Vite `BASE_URL` in SPA mode).

| Asset                | Location contract                        |
| -------------------- | ---------------------------------------- |
| `config/config.json` | `${configUrl base}/config/config.json`   |
| `config/favicon.*`   | `${configUrl base}/config/<APP_FAVICON>` |
| `config/logo.*`      | referenced from `config.json` (relative) |
| `data/mgrs.json`     | `${configUrl base}/data/mgrs.json`       |
| `data/wrs2.json`     | `${configUrl base}/data/wrs2.json`       |
| `data/cdem.json`     | `${configUrl base}/data/cdem.json`       |
| `data/doqq.json`     | `${configUrl base}/data/doqq.json`       |

These JSON grid files (~30 MB combined) are shipped in the repo under
`public/data/` but are **not** bundled into the npm tarball. Consumers
must copy them from the repo (or from their own STAC tiling source)
into their static asset pipeline. `examples/starter/README.md` documents
the exact `cp` recipe.

`cacheBuster` semantics are controlled by the `configCacheBuster` prop.
See `src/utils/configBase.js` for the single source of truth.

## Examples directory

`examples/starter/` is a reference host-app that embeds `filmdrop-ui` at
a non-root basepath with `applyDocumentBranding={false}`. It exists to
make integration regressions observable: a reviewer can `cd
examples/starter && npm install && npm run dev` to smoke-test any PR
that touches the public surface.

The `examples/` tree is excluded from the npm tarball (see the `files`
allow-list in `package.json` — only `dist/`, `README.md`, `LICENSE`,
`NOTICE`, `CHANGELOG.md`, and `CONFIGURATION.md` ship).
`scripts/verify-consumer-smoke.mjs` asserts this on every `build:lib`
run.

- Imperative, present-tense subject lines ("Add X", "Fix Y").
- Include a `Test Plan:` section when behavior changes.

## Dependency classification

| Kind               | Behavior                                    |
| ------------------ | ------------------------------------------- |
| `peerDependencies` | Consumer must install; bundle externalized. |
| `dependencies`     | Bundled into `dist/filmdrop-ui.js`.         |
| `devDependencies`  | Local only. Never shipped to consumers.     |

Peers include: `react`, `react-dom`, `react-redux`, `@reduxjs/toolkit`,
`@tanstack/react-router`, `@mui/*`, `@emotion/*`, `leaflet`, `leaflet-draw`,
`react-leaflet`. See `package.json` for authoritative ranges.

## Release workflow

1. Land all PRs for the release; confirm `main` is green.
2. Run `npm publish --dry-run` to inspect the npm tarball.
3. Bump version with `npm version [patch|minor|major]` — this creates the
   `vX.Y.Z` tag and updates `CHANGELOG.md`.
4. Push commits + tag; CI publishes on tag-push (`.github/workflows/release.yml`).
5. Use dist-tags: `latest` for stable, `next` for pre-releases,
   `experimental` for spikes.
6. Never `npm unpublish` after 24h — deprecate with `npm deprecate` instead.

`prepublishOnly` runs `build:lib` + all quality gates; a red gate blocks
publish.

## Single-instance scope (v1)

The v1 public API assumes **one `<FilmDropRoot>` per page**. Shared
`localStorage` keys (`APP_AUTH_TOKEN`, `APP_THEME_PREFERENCE`),
module-scope singletons, and last-writer-wins on active store/router
refs all break under concurrent mounts. Multi-instance support is on
the roadmap via context threading and key namespacing.

## SemVer + deprecation

- Breaking changes to `FilmDropRoot` props, exported hook/type names, or
  reserved URL params (`dt`, `view`, `viz`, `tab`, `z`, `c`) are MAJOR.
- Config schema additions are MINOR; removals/renames are MAJOR (one
  MAJOR of `applyConfigDefaults()` legacy coverage).
- Deprecations: add `@deprecated` JSDoc + runtime `console.warn` one MINOR
  before removal. Never silent-remove.
- Peer dependency major bumps (e.g. React 19 → 20) are MAJOR for FilmDrop.
