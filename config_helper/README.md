# FilmDrop UI Config Helper Scripts

This directory contains helper configs and documentation for the JavaScript config tools.

## CLI Commands

Use the repo-level npm scripts:

```bash
# Validate config format and schema (add --verbose for banner header)
npm run config:lint -- public/config/config.json

# Preview migration from legacy -> modern format
npm run config:migrate -- --input public/config/config.json --dry-run

# Write migrated config to a new file
npm run config:migrate -- --input public/config/config.json --output public/config/config.migrated.json
```

## Suggested next commands (lint / dry-run)

When `config:lint` detects a **legacy** config, or after `config:migrate --dry-run`, the CLI prints **Suggested commands (bash/zsh)** using your input path. The suggested output file is **`*.migrated.json`** next to the input (for example `config.json` → `config.migrated.json`). Paths are wrapped in **POSIX single quotes** for pasting into bash, zsh, or **Git Bash**; **cmd.exe** does not treat those quotes the same way, and PowerShell may need different escaping.

## Config file format (strict JSON)

`config:lint` and `config:migrate` read the file with `JSON.parse` (standard JSON only).
They do **not** support JSON5, `//` or `/* */` comments, or trailing commas.
Files saved as UTF-8 with a **BOM** can fail to parse in some editors.
Use plain UTF-8 without BOM, or preprocess the file before running the CLI.

## Maintenance: new top-level config keys

When you add a supported top-level key to the app config:

1. Add it to `MODERN_CONFIG_KEYS` in [src/utils/configFormat.mjs](../src/utils/configFormat.mjs) (and legacy list if applicable).
2. Add its **type** to `TOP_LEVEL_CONFIG_EXPECTED_TYPES` in the same file so `config:lint` stays in sync with the runtime.

The unit test `TOP_LEVEL_CONFIG_EXPECTED_TYPES keys match MODERN and LEGACY union` in [src/utils/configFormat.test.js](../src/utils/configFormat.test.js) fails if those lists diverge.

## Mixed-format policy

`config:migrate` and `config:lint` treat as mixed when `COLLECTIONS_CONFIG` is present together
with legacy keys, or together with a legacy `COLLECTIONS` array.
That prevents silent data loss from ambiguous precedence.

Use one of these workflows:

1. Start from a legacy-only source file, then run migration.
2. Manually reconcile values into `COLLECTIONS_CONFIG` and remove legacy keys.

## Migration Rules

The migration command converts legacy config keys into modern `COLLECTIONS_CONFIG` entries:

| Legacy Parameter                  | New Location                                    |
| --------------------------------- | ----------------------------------------------- |
| `SCENE_TILER_PARAMS[id]`          | `COLLECTIONS_CONFIG[id].visualizations.default` |
| `MOSAIC_TILER_PARAMS[id]`         | `COLLECTIONS_CONFIG[id].mosaicTilerParams`      |
| `SEARCH_MIN_ZOOM_LEVELS[id].high` | `COLLECTIONS_CONFIG[id].sceneMinZoom`           |
| `POPUP_DISPLAY_FIELDS[id]`        | `COLLECTIONS_CONFIG[id].popupDisplayFields`     |
| `TILE_LAYER_PARAMS[id]`           | `COLLECTIONS_CONFIG[id].tileLayerParams`        |
| `ENHANCED_DISPLAY_CONFIG[id]`     | `COLLECTIONS_CONFIG[id].enhancedDisplayConfig`  |
| `DEFAULT_COLLECTION`              | `COLLECTIONS.default`                           |
| `COLLECTIONS` (array)             | `COLLECTIONS.include`                           |

Reserved metadata keys (for example `_comment*` and `_DEPRECATED_*`) are excluded from collection migration.

## Strict Runtime Behavior

Runtime config loading does not auto-migrate legacy keys. Legacy or mixed configs fail at startup with guidance to run `config:migrate`.

## References

- [CONFIGURATION.md](../CONFIGURATION.md)
- [README.md](../README.md)
- `config.example.json`
- `config-new-format-example.json`
