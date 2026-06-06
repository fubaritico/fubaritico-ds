import path from 'node:path'

import type { Plugin } from 'vite'

/**
 * Options for the assetPreloadInjection plugin.
 */
export interface AssetPreloadInjectionOptions {
  /** File patterns to include in preload (defaults to critical JS + CSS) */
  include?: string[]
  /** File patterns to exclude from preload */
  exclude?: string[]
  /** Suppress console logs (default: false) */
  suppressLogs?: boolean
}

/**
 * Vite plugin that injects asset preload links into HTML after build.
 *
 * ## Why this plugin exists
 *
 * When using Module Federation, the host app loads multiple JS bundles in sequence:
 * 1. index.js (host code)
 * 2. hostInit.js (Module Federation setup)
 * 3. remoteEntry.js (from remotes)
 *
 * Without preload hints, browsers discover these files sequentially, causing critical
 * request chaining (75ms+ latency between requests). Preload enables parallel discovery
 * and loading, reducing FCP/LCP.
 *
 * ## How it works
 *
 * - Runs during `transformIndexHtml` hook (post-build phase)
 * - Scans the bundle for .js and .css files
 * - Filters to exclude patterns (fonts, remoteEntry.js, etc.)
 * - Injects preload links before </head>
 * - Fails gracefully if no assets found (doesn't break build)
 *
 * ## Usage
 *
 * ```typescript
 * // In host's vite.config.ts
 * import { assetPreloadInjection } from '@fubaritico-ds/shared/vite'
 *
 * export default defineConfig({
 *   plugins: [
 *     assetPreloadInjection({
 *       include: ['index', 'hostInit'],
 *       exclude: ['remoteEntry'],
 *       suppressLogs: false,
 *     }),
 *   ],
 * })
 * ```
 *
 * ## Expected output
 *
 * Adds to <head>:
 * ```html
 * <link rel="preload" href="/assets/index-abc123.js" as="script">
 * <link rel="preload" href="/assets/hostInit-def456.js" as="script">
 * ```
 */
export function assetPreloadInjection(
  options?: AssetPreloadInjectionOptions
): Plugin {
  const {
    include = ['index', 'hostInit'],
    exclude = ['remoteEntry', '.woff2', '.woff', '.ttf'],
    suppressLogs = false,
  } = options ?? {}

  const log = (msg: string) => {
    if (!suppressLogs) {
      console.warn(`[asset-preload] ${msg}`)
    }
  }

  // Store detected assets during generateBundle for use in transformIndexHtml
  const detectedAssets: {
    name: string
    path: string
    type: 'script' | 'style'
  }[] = []

  return {
    name: 'asset-preload-injection',
    apply: 'build',

    generateBundle(_outputOptions, bundle) {
      // Detect critical assets from the bundle
      const includePatterns = include.map((pattern) =>
        pattern.toLowerCase().replace(/\s+/g, '-')
      )
      const excludePatterns = exclude.map((pattern) =>
        pattern.toLowerCase().replace(/\s+/g, '-')
      )

      // Match files that include critical patterns and exclude others
      const includeRegexStr = includePatterns.join('|')
      const includeRegex = new RegExp(includeRegexStr, 'i')

      const shouldExclude = (fileName: string) => {
        const lowerName = fileName.toLowerCase()
        return excludePatterns.some((pattern) => lowerName.includes(pattern))
      }

      // Log all JS and CSS files in bundle for debugging
      const jsFiles = Object.keys(bundle).filter(
        (name) => name.endsWith('.js') && !name.endsWith('.woff2')
      )
      const cssFiles = Object.keys(bundle).filter((name) =>
        name.endsWith('.css')
      )

      if (jsFiles.length > 0 || cssFiles.length > 0) {
        log(
          `Found ${String(jsFiles.length)} JS and ${String(cssFiles.length)} CSS files in bundle`
        )
      }

      // Scan bundle for matching JS/CSS files
      for (const [fileName] of Object.entries(bundle)) {
        if (shouldExclude(fileName)) {
          continue
        }

        if (fileName.endsWith('.js') && includeRegex.test(fileName)) {
          detectedAssets.push({
            name: path.basename(fileName),
            path: fileName,
            type: 'script',
          })
        } else if (fileName.endsWith('.css') && includeRegex.test(fileName)) {
          detectedAssets.push({
            name: path.basename(fileName),
            path: fileName,
            type: 'style',
          })
        }
      }

      if (detectedAssets.length > 0) {
        log(
          `Detected ${String(detectedAssets.length)} critical asset(s) in bundle`
        )
        detectedAssets.forEach((asset) => {
          log(`  - ${asset.name} (${asset.type})`)
        })
      }
    },

    transformIndexHtml: {
      order: 'post',
      handler(html) {
        try {
          if (detectedAssets.length === 0) {
            log('No critical assets found to preload')
            return html
          }

          log(
            `Injecting ${String(detectedAssets.length)} asset preload link(s)`
          )
          return injectPreloadLinks(html, detectedAssets)
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          log(`ERROR: ${message}`)
          return html
        }
      },
    },
  }
}

/**
 * Inject preload links into HTML head.
 * Adds links before </head> closing tag.
 */
function injectPreloadLinks(
  html: string,
  assets: { name: string; path: string; type: 'script' | 'style' }[]
): string {
  // Generate preload link tags
  const preloadLinks = assets
    .map(({ path: assetPath, type }) => {
      // Construct absolute path from host root
      const href = `/${assetPath}`.replace(/\\/g, '/')
      return `    <link rel="preload" href="${href}" as="${type}">`
    })
    .join('\n')

  // Inject before </head>
  const injected = html.replace('  </head>', `${preloadLinks}\n  </head>`)

  if (injected === html) {
    console.warn(
      '[asset-preload] WARNING: Could not find </head> in HTML, no preload links injected'
    )
    return html
  }

  return injected
}
