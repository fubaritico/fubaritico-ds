import path from 'node:path'

import type { Plugin } from 'vite'

/**
 * Options for the fontPreloadInjection plugin.
 */
export interface FontPreloadInjectionOptions {
  /** Critical fonts to preload (font-family names, e.g., 'press-start-2p', 'inter') */
  criticalFonts?: string[]
  /** Suppress console logs (default: false) */
  suppressLogs?: boolean
}

/**
 * Vite plugin that injects font preload links into HTML after build.
 *
 * ## Why this plugin exists
 *
 * Fontsource fonts are imported via CSS and bundled with hashed filenames.
 * The hashes are only known after build completes. This plugin:
 * 1. Waits for build to finish and CSS to be bundled
 * 2. Scans the dist folder for actual .woff2 filenames
 * 3. Injects <link rel="preload"> tags into the HTML head
 *
 * This eliminates network discovery time for critical fonts on slow networks.
 *
 * ## How it works
 *
 * - Runs during `transformIndexHtml` hook (post-build phase)
 * - Uses glob to find .woff2 files in dist/assets
 * - Filters to only critical fonts (configurable)
 * - Injects preload links before </head>
 * - Fails gracefully if no fonts found (doesn't break build)
 *
 * ## Usage
 *
 * ```typescript
 * // In host's vite.config.ts
 * import { fontPreloadInjection } from '@fubaritico-ds/shared/vite'
 *
 * export default defineConfig({
 *   plugins: [
 *     fontPreloadInjection({
 *       criticalFonts: ['press-start-2p', 'inter'],
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
 * <link rel="preload" href="/assets/press-start-2p-400-normal-abc123.woff2" as="font" type="font/woff2" crossorigin>
 * <link rel="preload" href="/assets/inter-400-normal-def456.woff2" as="font" type="font/woff2" crossorigin>
 * ```
 */
export function fontPreloadInjection(
  options?: FontPreloadInjectionOptions
): Plugin {
  const { criticalFonts = ['press-start-2p', 'inter'], suppressLogs = false } =
    options ?? {}

  const log = (msg: string) => {
    if (!suppressLogs) {
      console.warn(`[font-preload] ${msg}`)
    }
  }

  // Store detected fonts during generateBundle for use in transformIndexHtml
  const detectedFonts: { name: string; path: string }[] = []

  return {
    name: 'font-preload-injection',
    apply: 'build',

    generateBundle(_outputOptions, bundle) {
      // Detect critical fonts from the bundle assets
      // Font filenames follow pattern: fontname-latin-weight-normal-hash.woff2
      // E.g.: press-start-2p-latin-400-normal-_wFEWmAB.woff2
      const fontPatterns = criticalFonts.map((font) =>
        font.toLowerCase().replace(/\s+/g, '-')
      )
      const fontRegexStr = fontPatterns.join('|')
      // Match: (font-name)(-latin)?-(weight)-(normal|italic)
      const fontRegex = new RegExp(String.raw`(${fontRegexStr}).*.woff2$`, 'i')

      // Log all .woff2 files in bundle for debugging
      const woff2Files = Object.keys(bundle).filter((name) =>
        name.endsWith('.woff2')
      )
      if (woff2Files.length > 0) {
        log(`Found ${String(woff2Files.length)} woff2 files in bundle`)
      } else {
        log('No woff2 files found in bundle during generateBundle')
      }

      // Scan bundle for matching woff2 files
      for (const [fileName] of Object.entries(bundle)) {
        if (fontRegex.test(fileName)) {
          detectedFonts.push({
            name: path.basename(fileName),
            path: fileName,
          })
        }
      }

      if (detectedFonts.length > 0) {
        log(
          `Detected ${String(detectedFonts.length)} critical font(s) in bundle`
        )
      }
    },

    transformIndexHtml: {
      order: 'post',
      handler(html) {
        try {
          if (detectedFonts.length === 0) {
            log('No critical fonts found to preload')
            return html
          }

          log(`Injecting ${String(detectedFonts.length)} font preload link(s)`)
          return injectPreloadLinks(html, detectedFonts)
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
  fontFiles: { name: string; path: string }[]
): string {
  // Generate preload link tags
  const preloadLinks = fontFiles
    .map(({ path: fontPath }) => {
      // Construct absolute path from host root
      const href = `/${fontPath}`.replace(/\\/g, '/')
      return `    <link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin>`
    })
    .join('\n')

  // Inject before </head>
  const injected = html.replace('  </head>', `${preloadLinks}\n  </head>`)

  if (injected === html) {
    console.warn(
      '[font-preload] WARNING: Could not find </head> in HTML, no preload links injected'
    )
    return html
  }

  return injected
}
