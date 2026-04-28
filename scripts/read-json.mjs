import fs from 'node:fs'

/** Strict JSON via JSON.parse; see config_helper/README.md (Config file format). */
export function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (error) {
    throw new Error(`Unable to read JSON from ${filePath}: ${error.message}`)
  }
}
