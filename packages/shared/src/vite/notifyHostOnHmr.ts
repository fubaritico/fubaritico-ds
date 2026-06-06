import type { Plugin } from 'vite'

/**
 * Options for the notifyHostOnHmr plugin.
 */
export interface NotifyHostOnHmrOptions {
  /** Name of the remote application (used for identification in logs) */
  appName: string
  /** URL of the host application (e.g., 'http://localhost:3000') */
  hostUrl: string
  /** Endpoint on the host to notify (default: '/on-child-rebuild') */
  endpoint?: string
  /** Suppress console logs (default: false) */
  suppressLogs?: boolean
}

/**
 * Vite plugin that notifies the host application when HMR updates occur in a remote.
 *
 * ## Why this plugin exists
 *
 * In a Module Federation setup with Vite, HMR doesn't work between host and remotes
 * because the WebSocket connection is only established by the host. When a file changes
 * in a remote, the remote's Vite server detects it, but the browser displaying the host
 * doesn't know about it.
 *
 * ## How it works
 *
 * 1. This plugin hooks into Vite's `handleHotUpdate` event (triggered on every HMR update)
 * 2. When a file changes, it sends an HTTP GET request to the host's `/on-child-rebuild` endpoint
 * 3. The host (using `listenForRemoteRebuilds` from `@antdevx/vite-plugin-hmr-sync`) receives
 *    the request and triggers a full page reload in the browser
 *
 * ## Why not use notifyOnRebuild from @antdevx/vite-plugin-hmr-sync?
 *
 * The `notifyOnRebuild` plugin from that library uses Vite's `buildEnd` hook, which only
 * triggers after a complete build. In dev mode with `vite dev`, Vite uses HMR (hot updates)
 * without full rebuilds, so `buildEnd` is never called.
 *
 * This plugin uses `handleHotUpdate` instead, which is called on every HMR update.
 *
 * ## Usage
 *
 * ```typescript
 * // In remote's vite.config.ts
 * import { notifyHostOnHmr } from '@fubaritico-ds/shared'
 *
 * export default defineConfig({
 *   plugins: [
 *     notifyHostOnHmr({
 *       appName: 'list',
 *       hostUrl: `http://localhost:${process.env.HOST_PORT}`,
 *     }),
 *   ],
 * })
 * ```
 *
 * ## Note
 *
 * This triggers a **full page reload** (Live Reload), not true HMR. True HMR would
 * preserve React state, but that's not possible with Module Federation because modules
 * are loaded dynamically from another server.
 *
 * @see https://github.com/antdevx/vite-plugin-hmr-sync - Host-side plugin
 * @see files/HMR-SYNC.md - Full documentation of the HMR sync solution
 */
export function notifyHostOnHmr(options: NotifyHostOnHmrOptions): Plugin {
  const {
    appName,
    hostUrl,
    endpoint = '/on-child-rebuild',
    suppressLogs = false,
  } = options

  const notifyHost = async () => {
    try {
      const url = `${hostUrl}${endpoint}?app=${appName}`
      const response = await fetch(url, { method: 'GET' })

      if (!suppressLogs) {
        if (response.ok) {
          console.warn(`[${appName}] 🔔 Notified host of HMR update`)
        } else {
          console.warn(
            `[${appName}] ⚠️ Failed to notify host: ${String(response.status)}`
          )
        }
      }
    } catch {
      if (!suppressLogs) {
        console.warn(`[${appName}] ⚠️ Could not reach host at ${hostUrl}`)
      }
    }
  }

  return {
    name: 'notify-host-on-hmr',
    apply: 'serve',

    handleHotUpdate({ file }) {
      if (!suppressLogs) {
        console.warn(`[${appName}] 🔥 HMR update: ${file}`)
      }

      void notifyHost()

      return undefined
    },
  }
}
