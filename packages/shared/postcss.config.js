import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Maps package `exports` subpaths to their actual file locations.
 * `postcss-import` cannot resolve `package.json#exports` natively,
 * so we resolve them manually via the workspace symlink.
 *
 * @type {Record<string, string>}
 */
const exportMap = {
  '@fubaritico-ds/tokens/tailwind': resolve(
    __dirname,
    'node_modules/@fubaritico-ds/tokens/dist/tailwind/theme.css',
  ),
}

/**
 * Custom resolve function for `postcss-import`.
 * Returns the absolute path for known package exports, falls back to the original id.
 *
 * @param {string} id - The `@import` specifier from the CSS source.
 * @param {string} basedir - The directory of the file containing the `@import`.
 * @returns {string} Resolved absolute path or the original specifier.
 */
function resolveImport(id, basedir) {
  return exportMap[id] || id
}

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    'postcss-import': { resolve: resolveImport },
  },
}
