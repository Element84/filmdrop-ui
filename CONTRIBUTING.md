# Contributing to FilmDrop UI

Thank you for contributing. This project is a React component library (and
standalone SPA) published to npm. Changes must preserve both modes.

## Quality gates (required before commit)

Run in this exact order:

1. `npm run format-fix && npm run lint-fix`
2. `npm run lint && npm run format`
3. `npm run typecheck`
4. `npm run test -- --run` (or `npm run test-pre-commit`)

`npm run test-nocov` is **forbidden** in this repository — the coverage
pipeline is wired into `vitest --run` via `npm run coverage`. See
`componentization_plan.md` Decision 0.10 for the full quality rubric.

## Dependency & Effect Discipline

- Stable refs (`dispatch`, `navigate`, TanStack hook returns) **must not**
  appear in hook dependency arrays. Flag every intentional omission in the
  PR description.
- Prefer derivations, event handlers, and render-time compute over
  `useEffect`. Do not add effect chains (A sets state that triggers B).
- Reuse existing helpers (`addTimeoutToMap`, `buildStacRequestHeaders`,
  `useDebouncedCallback`) instead of inventing new ones.

## Phase overview

Development is staged by the `componentization_plan.md` phases:

| Phase | Scope                                                                  |
| ----- | ---------------------------------------------------------------------- |
| 0     | Locked decisions (router basepath, store factory, CSS scoping, etc.)   |
| 1     | FilmDropRoot, store/router factories, active-ref contract — ✅ shipped |
| 2     | Library build + package surface — this document lands with Phase 2     |
| 3     | Host-integration hardening (basepath, branding gates, DOM scoping)     |
| 4     | Shell app dogfooding the library                                       |
| 5     | Multi-instance support (deferred)                                      |
| 6     | Code-quality backlog                                                   |

## Commit conventions

- Imperative, present-tense subject lines ("Add X", "Fix Y").
- Reference the Phase/Step ID where relevant (e.g. `[p2-1]`).
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

## Release workflow (Phase 2 Step 2.22)

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

Phases 1–4 assume **one `<FilmDropRoot>` per page**. Shared
`localStorage` keys (`APP_AUTH_TOKEN`, `APP_THEME_PREFERENCE`), module-scope
singletons, and last-writer-wins on active store/router refs all break
under concurrent mounts. Phase 5 adds multi-instance support via context
threading and key namespacing.

## SemVer + deprecation (Phase 2 Step 2.22 / Phase 4 Step 4.8)

- Breaking changes to `FilmDropRoot` props, exported hook/type names, or
  reserved URL params (`dt`, `view`, `viz`, `tab`, `z`, `c`) are MAJOR.
- Config schema additions are MINOR; removals/renames are MAJOR (one
  MAJOR of `applyConfigDefaults()` legacy coverage).
- Deprecations: add `@deprecated` JSDoc + runtime `console.warn` one MINOR
  before removal. Never silent-remove.
- Peer dependency major bumps (e.g. React 19 → 20) are MAJOR for FilmDrop.
