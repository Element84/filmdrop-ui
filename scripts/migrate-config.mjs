#!/usr/bin/env node

import fs from 'node:fs'
import {
  ConfigValidationError,
  getMixedFormatLegacySignals,
  migrateLegacyConfig,
  detectConfigFormat
} from '../src/utils/configFormat.mjs'
import { readJsonFile } from './read-json.mjs'
import {
  printSuggestedMigrateFollowUp,
  suggestedMigratedOutputPath
} from './config-cli-suggestions.mjs'

const MIXED_REMEDIATION_MESSAGE = [
  'Mixed configuration format is not supported.',
  'Resolve the file to one format before migration:',
  '  1) Use a legacy-only source file and run config:migrate, or',
  '  2) Manually reconcile COLLECTIONS_CONFIG: remove legacy keys and/or convert COLLECTIONS from a legacy array to object format (include/exclude/default).'
].join('\n')

function printUsage() {
  console.log('Usage:')
  console.log(
    '  node scripts/migrate-config.mjs --input config.json --output config.new.json'
  )
  console.log('  node scripts/migrate-config.mjs --input config.json --dry-run')
  console.log(
    '  node scripts/migrate-config.mjs --input config.json --validate-only'
  )
  console.log(
    '  node scripts/migrate-config.mjs --input config.json --dry-run [--verbose]'
  )
}

function parseArgs(argv) {
  const args = {
    input: null,
    output: null,
    dryRun: false,
    validateOnly: false,
    verbose: false
  }

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === '--input') {
      args.input = argv[i + 1]
      i += 1
    } else if (token === '--output') {
      args.output = argv[i + 1]
      i += 1
    } else if (token === '--dry-run') {
      args.dryRun = true
    } else if (token === '--validate-only') {
      args.validateOnly = true
    } else if (token === '--verbose' || token === '-v') {
      args.verbose = true
    } else if (token === '--help' || token === '-h') {
      printUsage()
      process.exit(0)
    } else {
      throw new Error(`Unknown argument: ${token}`)
    }
  }

  if (!args.input) {
    throw new Error('Missing required argument: --input')
  }

  return args
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`)
  } catch (error) {
    throw new Error(`Unable to write JSON to ${filePath}: ${error.message}`)
  }
}

function printReport({ format, migratedConfig, removedKeys }, verbose) {
  if (verbose) {
    console.log(
      '\n======================================================================'
    )
    console.log('MIGRATION REPORT')
    console.log(
      '======================================================================'
    )
  }

  console.log(`Original format: ${format.toUpperCase()}`)
  console.log(
    `Migrated format: ${detectConfigFormat(migratedConfig).toUpperCase()}`
  )

  if (removedKeys.length > 0) {
    console.log(`Legacy keys removed: ${removedKeys.length}`)
    if (verbose) {
      console.log(`Removed keys: ${removedKeys.join(', ')}`)
      console.log(
        `Collections migrated: ${Object.keys(migratedConfig.COLLECTIONS_CONFIG || {}).length}`
      )
    }
  } else {
    console.log('No legacy keys removed')
  }

  if (verbose) {
    console.log(
      '======================================================================\n'
    )
  }
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2))
    console.log(`Loading config from: ${args.input}`)
    const config = readJsonFile(args.input)
    const format = detectConfigFormat(config)

    if (format === 'mixed') {
      const signals = getMixedFormatLegacySignals(config)
      throw new ConfigValidationError(
        `${MIXED_REMEDIATION_MESSAGE}\nConflicting legacy inputs: ${signals.join(', ')}`,
        'MIXED_CONFIG_NOT_SUPPORTED'
      )
    }

    if (args.validateOnly) {
      console.log('Config is valid JSON.')
      console.log(`Config format: ${format.toUpperCase()}`)
      return
    }

    console.log('Migrating config...')
    const result = migrateLegacyConfig(config)
    printReport(result, args.verbose)

    if (args.dryRun) {
      console.log('DRY-RUN MODE: No files written')
      printSuggestedMigrateFollowUp({
        inputPath: args.input,
        outputPath: suggestedMigratedOutputPath(args.input)
      })
      console.log('\nMigrated config output:')
      console.log(JSON.stringify(result.migratedConfig, null, 2))
      return
    }

    if (args.output) {
      writeJson(args.output, result.migratedConfig)
      console.log(`Migrated config written to: ${args.output}`)
      return
    }

    console.log('Migrated config (stdout):')
    console.log(JSON.stringify(result.migratedConfig, null, 2))
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

main()
