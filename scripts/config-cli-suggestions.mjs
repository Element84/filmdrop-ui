import path from 'node:path'
import { quotePosixShellArg } from './shell-quote.mjs'

/**
 * Suggested output path: same directory as input, `name.migrated.json` when input ends in `.json`.
 */
export function suggestedMigratedOutputPath(inputPath) {
  const normalized = String(inputPath)
  const dir = path.dirname(normalized)
  const base = path.basename(normalized)
  if (base.toLowerCase().endsWith('.json')) {
    const stem = base.slice(0, -'.json'.length)
    return path.join(dir, `${stem}.migrated.json`)
  }
  return `${normalized}.migrated.json`
}

/**
 * Print three copy-paste lines for bash/zsh (paths POSIX-quoted).
 */
export function printSuggestedMigrateFollowUp({ inputPath, outputPath }) {
  const qi = quotePosixShellArg(inputPath)
  const qo = quotePosixShellArg(outputPath)
  console.log('\nSuggested commands (bash/zsh):')
  console.log(`npm run config:migrate -- --input ${qi} --dry-run`)
  console.log(`npm run config:migrate -- --input ${qi} --output ${qo}`)
  console.log(`npm run config:lint -- ${qo}`)
}
