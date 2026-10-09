/**
 * Makes every relative import in `dist` a complete ESM path.
 *
 * The sources import without extensions (`./Button`), which bundlers accept. `tsup` (esbuild,
 * `bundle: false`) and `tsc` copy those specifiers verbatim, so the emitted `.js` / `.d.ts` keep
 * `./Button` — and Node, hence Vitest and server rendering in a consumer, refuses them
 * (ERR_MODULE_NOT_FOUND). This rewrites each relative specifier against the files actually emitted:
 * `./Button` → `./Button.js` when that file exists, `./cells` → `./cells/index.js` for a directory.
 *
 * A specifier that resolves to neither fails the build: guessing would ship a broken import.
 */
import { existsSync, statSync } from 'node:fs'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'

const DIST = 'dist'

/**
 * Relative specifiers in `from "…"`, `import "…"`, `import("…")` and `export … from "…"`, both
 * quote styles, minified or not.
 */
const SPECIFIER = /(\bfrom\s*|\bimport\s*\(?\s*)(["'])(\.{1,2}\/[^"']*)\2/g

/**
 * Lists every file under a directory.
 *
 * @param dir - The directory to walk.
 * @returns The file paths, recursively.
 */
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name)
      return entry.isDirectory() ? walk(path) : [path]
    })
  )
  return nested.flat()
}

/**
 * Completes one relative specifier against the emitted files.
 *
 * @param file - The file holding the import.
 * @param specifier - The relative specifier as written.
 * @returns The specifier with its `.js` or `/index.js` suffix.
 * @throws Error when the specifier resolves to no emitted file.
 */
function complete(file, specifier) {
  if (specifier.endsWith('.js') || specifier.endsWith('.css') || specifier.endsWith('.json')) {
    return specifier
  }
  const target = resolve(dirname(file), specifier)
  if (existsSync(`${target}.js`)) return `${specifier}.js`
  if (existsSync(target) && statSync(target).isDirectory() && existsSync(join(target, 'index.js'))) {
    return `${specifier.replace(/\/$/, '')}/index.js`
  }
  throw new Error(`[reference] ${file}: cannot resolve "${specifier}" to an emitted file`)
}

const files = (await walk(DIST)).filter((f) => f.endsWith('.js') || f.endsWith('.d.ts'))
let rewritten = 0

for (const file of files) {
  const source = await readFile(file, 'utf8')
  const output = source.replace(SPECIFIER, (match, keyword, quote, specifier) => {
    const fixed = complete(file, specifier)
    if (fixed === specifier) return match
    rewritten += 1
    return `${keyword}${quote}${fixed}${quote}`
  })
  if (output !== source) await writeFile(file, output)
}

console.warn(`[reference] completed ${String(rewritten)} relative ESM specifiers in dist`)
