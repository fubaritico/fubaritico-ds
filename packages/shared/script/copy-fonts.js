/**
 * Copies font files referenced in dist/fonts.css from @fontsource packages
 * into dist/files/ so the published package is self-contained.
 */
import { readFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const distDir = resolve(root, 'dist')
const outDir = resolve(distDir, 'files')

const fontsCss = readFileSync(resolve(distDir, 'fonts.css'), 'utf-8')

// Extract all url(./files/<filename>) references
const urls = [...fontsCss.matchAll(/url\(\.\/files\/([^)]+)\)/g)].map((m) => m[1])
const unique = [...new Set(urls)]

// Map font filename prefix to @fontsource package name
const packageMap = {
  roboto: '@fontsource/roboto',
  'roboto-condensed': '@fontsource/roboto-condensed',
  inter: '@fontsource/inter',
}

mkdirSync(outDir, { recursive: true })

let copied = 0
for (const file of unique) {
  // e.g. "roboto-latin-400-normal.woff2" → package "roboto"
  //      "roboto-condensed-latin-700-normal.woff2" → package "roboto-condensed"
  //      "inter-latin-400-normal.woff2" → package "inter"
  const pkg = Object.keys(packageMap)
    .sort((a, b) => b.length - a.length) // longest first to match "roboto-condensed" before "roboto"
    .find((prefix) => file.startsWith(prefix + '-'))

  if (!pkg) {
    console.error(`No @fontsource package found for: ${file}`)
    process.exit(1)
  }

  const src = resolve(root, 'node_modules', packageMap[pkg], 'files', file)
  if (!existsSync(src)) {
    console.error(`Font file not found: ${src}`)
    process.exit(1)
  }

  copyFileSync(src, resolve(outDir, file))
  copied++
}

console.error(`Copied ${copied} font files to dist/files/`)
