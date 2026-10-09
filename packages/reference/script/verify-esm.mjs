/**
 * Loads every published entry point under plain Node — the check no type-check and no Storybook can
 * make, since both go through a bundler that forgives incomplete import paths.
 *
 * It imports `dist/index.js` and `dist/components/<Name>/index.js` for each emitted component, i.e.
 * everything the `exports` map (`.` and `./*`) can serve. Components that need a peer the package
 * declares as optional (`next`, `react-router-dom`) are loaded too: both are dev dependencies here.
 * Any failure exits non-zero with the module and the error.
 */
import { existsSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const COMPONENTS = 'dist/components'

const names = await readdir(COMPONENTS, { withFileTypes: true })
const entries = [
  'dist/index.js',
  ...names
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(COMPONENTS, entry.name, 'index.js'))
    .filter((path) => existsSync(path)),
]

const failures = []
for (const entry of entries) {
  try {
    await import(pathToFileURL(resolve(entry)).href)
  } catch (error) {
    failures.push(`${entry}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

if (failures.length > 0) {
  console.error(`[reference] ${String(failures.length)} entry points fail to load under Node:`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.warn(`[reference] ${String(entries.length)} entry points load under Node`)
