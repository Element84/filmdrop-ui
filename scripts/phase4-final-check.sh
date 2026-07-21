#!/usr/bin/env bash
# Release-time integration gate. Runs the full library + starter +
# consumer pipeline and fails fast on any verifier error.

set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> npm install"
npm install

echo "==> format-fix + lint-fix"
npm run format-fix
npm run lint-fix

echo "==> lint + format"
npm run lint
npm run format

echo "==> typecheck"
npm run typecheck

echo "==> test (library)"
npm run test-pre-commit

echo "==> build:lib"
npm run build:lib

echo "==> verify:lib"
npm run verify:lib

echo "==> sync starter assets"
npm run sync:starter-brand
npm run sync:starter-data

echo "==> build:starter"
npm run build:starter

echo "==> verify:starter"
npm run verify:starter

echo "==> verify:consumer"
npm run verify:consumer

echo "==> verify:types"
npm run verify:types

echo "==> test (starter workspace)"
npm run test -w filmdrop-starter -- --run

echo "==> npm pack --dry-run"
npm pack --dry-run

echo
echo "All release-gate checks passed."
