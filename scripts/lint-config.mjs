#!/usr/bin/env node

import fs from 'node:fs'
import {
  LEGACY_CONFIG_KEYS,
  MODERN_CONFIG_KEYS,
  TOP_LEVEL_CONFIG_EXPECTED_TYPES,
  detectConfigFormat,
  getMixedFormatLegacySignals
} from '../src/utils/configFormat.mjs'
import { readJsonFile } from './read-json.mjs'
import {
  printSuggestedMigrateFollowUp,
  suggestedMigratedOutputPath
} from './config-cli-suggestions.mjs'

const MIXED_REMEDIATION_MESSAGE =
  'Mixed format is not supported. Resolve to legacy-only and migrate, or remove legacy keys and keep only COLLECTIONS_CONFIG.'

const TYPE_CHECKS = {
  string: (value) => typeof value === 'string',
  number: (value) => typeof value === 'number' && !Number.isNaN(value),
  boolean: (value) => typeof value === 'boolean',
  object: (value) =>
    typeof value === 'object' && value !== null && !Array.isArray(value),
  array: (value) => Array.isArray(value)
}

function parseLintArgv(argv) {
  let verbose = false
  const paths = []
  for (const token of argv) {
    if (token === '--verbose' || token === '-v') {
      verbose = true
    } else {
      paths.push(token)
    }
  }
  return { filePath: paths[0], verbose, pathCount: paths.length }
}

function isJsonFile(filePath) {
  return filePath.toLowerCase().endsWith('.json')
}

function expectedKeysForFormat(format) {
  if (format === 'legacy' || format === 'mixed') {
    return new Set([...MODERN_CONFIG_KEYS, ...LEGACY_CONFIG_KEYS])
  }
  return new Set(MODERN_CONFIG_KEYS)
}

function validateTypes(config, expectedKeys, format) {
  const typeErrors = []
  Object.keys(config).forEach((key) => {
    if (!expectedKeys.has(key) || !(key in TOP_LEVEL_CONFIG_EXPECTED_TYPES)) {
      return
    }
    if (
      format === 'legacy' &&
      key === 'COLLECTIONS' &&
      Array.isArray(config[key])
    ) {
      return
    }
    const expectedType = TOP_LEVEL_CONFIG_EXPECTED_TYPES[key]
    const typeCheck = TYPE_CHECKS[expectedType]
    if (!typeCheck?.(config[key])) {
      typeErrors.push(
        `Type error for key '${key}': expected ${expectedType}, got ${
          Array.isArray(config[key]) ? 'array' : typeof config[key]
        }`
      )
    }
  })
  return typeErrors
}

function lintConfig(filePath, verbose) {
  const config = readJsonFile(filePath)
  const format = detectConfigFormat(config)
  const expectedKeys = expectedKeysForFormat(format)
  const extraKeys = Object.keys(config).filter((key) => !expectedKeys.has(key))
  const typeErrors = validateTypes(config, expectedKeys, format)
  const missingRequiredKeys = ['STAC_API_URL'].filter((key) => !(key in config))
  const errors = []

  if (format === 'mixed') {
    errors.push(MIXED_REMEDIATION_MESSAGE)
  }
  if (format === 'unknown') {
    errors.push(
      'Unknown config format: expected legacy keys or COLLECTIONS_CONFIG.'
    )
  }
  errors.push(...missingRequiredKeys.map((k) => `Required key missing: ${k}`))
  errors.push(...typeErrors)

  if (verbose) {
    console.log(
      '*********************************************************************'
    )
    console.log(
      '**** Running Filmdrop UI Config Lint *******************************'
    )
    console.log(
      '*********************************************************************'
    )
  }

  console.log(`Config format: ${format.toUpperCase()}`)

  if (format === 'legacy') {
    console.log('Backward compatibility: legacy format detected.')
    printSuggestedMigrateFollowUp({
      inputPath: filePath,
      outputPath: suggestedMigratedOutputPath(filePath)
    })
    if (verbose && !('SEARCH_MIN_ZOOM_LEVELS' in config)) {
      console.log(
        '[Verbose] Many legacy configs include SEARCH_MIN_ZOOM_LEVELS for search zoom behavior; yours omits it.'
      )
    }
  } else if (format === 'mixed') {
    console.log('Mixed format detected.')
    const signals = getMixedFormatLegacySignals(config)
    console.log(`Conflicting legacy inputs: ${signals.join(', ')}`)
  } else if (format === 'new') {
    console.log('Modern format detected.')
  }

  if (extraKeys.length > 0) {
    console.log(`\n[Warning] Extra keys found: ${extraKeys.join(', ')}`)
  }

  if (errors.length > 0) {
    console.log('\n[Error] Validation failed:')
    errors.forEach((error) => console.log(` - ${error}`))
    console.log('\nConfig is INVALID')
    return false
  }

  console.log('\n[Success] Validation passed')
  console.log('Config is VALID')
  return true
}

function main() {
  try {
    const { filePath, verbose, pathCount } = parseLintArgv(
      process.argv.slice(2)
    )
    if (pathCount !== 1 || !filePath) {
      throw new Error(
        'Usage: node scripts/lint-config.mjs [--verbose] path/to/config.json'
      )
    }
    if (!isJsonFile(filePath)) {
      throw new Error('Invalid file format. Expected a JSON file.')
    }
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }
    const isValid = lintConfig(filePath, verbose)
    process.exit(isValid ? 0 : 1)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

main()
