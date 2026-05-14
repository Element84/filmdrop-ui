# Testing FilmDrop UI

This document covers test patterns for components, services, hooks, and the
Redux store. Run tests with `npm run test -- --run` (`npm run test-nocov`
is forbidden in this repo; see `CONTRIBUTING.md`).

## Canonical test harness — `renderFilmDrop`

`src/testing/renderFilmDrop.jsx` wraps React Testing
Library's `render` with:

- A fresh store created via `createFilmDropStore()`.
- A TanStack router created via `createFilmDropRouter({ basepath })`.
- Automatic `setActiveStore` / `setActiveRouter` setup + cleanup.
- Options: `{ preloadedState, basename, initialUrl, configOverrides }`.

Prefer this harness over raw `<Provider>` / `<RouterProvider>` wiring.

## Active store/router contract

`src/setupTests.js` creates one test store + stub router and registers them
as the active refs. Each `beforeEach` resets state via `mainSliceReset()`
and re-registers refs so a failing test cannot leak into the next.

Module-scope `vi.mock(...)` calls are mandatory (inside `beforeEach` they
silently no-op because Vitest hoists mocks at parse time). If you need
per-test mock control, use `vi.mocked(...)` and `mockReset()` / `mockReturnValueOnce()`.

## StrictMode double-mount regression

`src/FilmDropRoot.strictmode.test.jsx` asserts that:

- `getActiveStore()` / `getActiveRouter()` return a live ref across
  mount → unmount → remount cycles.
- No stray `console.error` / `console.warn` output.
- No leaked global event listeners.

Add a case to this file whenever you touch the active-ref contract.

## Component tests

- Render via `renderFilmDrop` (or `renderHook` with the harness's wrapper).
- Query by accessible role / name whenever possible. Use `data-testid`
  only for non-accessible visual elements.
- Assert through `screen.*` queries; avoid `container.querySelector`.

## Service tests

- Mock `fetch` with `vi.spyOn(globalThis, 'fetch')`.
- Stub the active store via `mainSliceReset()` + direct `dispatch(setX(...))`
  instead of hand-crafting state objects.
- Assert on normalized error shapes (`stacErrorHelper`) when the service
  has been migrated; several services still throw raw errors.

### Service contract assertions (required for migrated services)

When testing services that follow the standardized contract, assert all three
branches explicitly:

1. Abort path: `AbortError` returns `undefined`, does not call `console.error`,
   and still clears loading flags.
2. Network/runtime failure: returns a normalized network error object and logs
   exactly once with the service context label.
3. HTTP/API failure (`!response.ok`): returns a normalized API error object and
   logs exactly once with the same context label.

Loading flags must be asserted as lifecycle behavior (set true in-flight,
set false on completion/failure/abort), not just end state.

Use `src/testing/abort-test-helper.js` to avoid re-implementing abort
scaffolding across suites.

## Redux tests

- Exercise reducers via the full store, not by importing the raw reducer.
- Use `waitFor` to assert on async effects; never `setTimeout` in tests.

## Isolation and lifecycle conventions

- Use `beforeEach` to reset store state (`mainSliceReset()`) and reset mocks.
- Use `afterEach` for `vi.restoreAllMocks()` so spies do not leak across files.
- For async service flows, prefer explicit in-flight assertions over timing
  hacks. Do not use artificial sleeps.

## Avoid these pitfalls

- **Do not bind Redux store methods in a Proxy `get` trap.** `useSyncExternalStore`
  resubscribes when `subscribe` identity changes, which causes infinite
  re-renders. Redux Toolkit's `getState` / `dispatch` / `subscribe` are
  closures — no bind needed.
- **`router.jsx` imports `App`.** To prevent app code from being evaluated
  before per-test mocks, active-router state lives in
  `src/router-test-hooks.js`. setupTests imports only the hooks module.
- **`escapeHtml` is a pure-regex helper.** It escapes `&`, `<`, `>` only
  (matching browser `innerHTML` behavior). Do not add `"`, `'`, `/` —
  existing tests assert the current output.
- **`openExternal`** passes `'noopener,noreferrer'` as the third arg to
  `window.open`. Tests asserting on `window.open(url, '_blank')` need the
  three-arg form.
