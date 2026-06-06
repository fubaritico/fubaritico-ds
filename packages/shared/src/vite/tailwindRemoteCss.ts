import { execSync, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Plugin } from 'vite'

export interface TailwindRemoteCssOptions {
  input: string
  output: string
  content: string
  suppressLogs?: boolean
}

export function tailwindRemoteCss(options: TailwindRemoteCssOptions): Plugin {
  const { input, output, content, suppressLogs = false } = options

  const log = (message: string) => {
    if (!suppressLogs) {
      console.warn('[tailwind-remote-css] ' + message)
    }
  }

  const generateCss = (cwd: string) => {
    const inputPath = resolve(cwd, input)
    const outputPath = resolve(cwd, output)

    if (!existsSync(inputPath)) {
      log('[WARN] Input file not found: ' + inputPath)
      return
    }

    try {
      execSync(
        'npx tailwindcss -i "' +
          inputPath +
          '" -o "' +
          outputPath +
          '" --content "' +
          content +
          '"',
        { cwd, stdio: 'pipe' }
      )
      log('[OK] Generated ' + output)
    } catch (error) {
      log('[ERROR] Failed to generate CSS: ' + String(error))
    }
  }

  const startWatch = (cwd: string) => {
    const inputPath = resolve(cwd, input)
    const outputPath = resolve(cwd, output)

    const child = spawn(
      'npx',
      [
        'tailwindcss',
        '-i',
        inputPath,
        '-o',
        outputPath,
        '--content',
        content,
        '--watch',
      ],
      { cwd, stdio: 'pipe', shell: true }
    )

    child.on('error', (error) => {
      log('[ERROR] Watch process error: ' + error.message)
    })

    log('[WATCH] Watching for changes...')

    return child
  }

  let cwd: string
  let isServe = false

  return {
    name: 'tailwind-remote-css',

    configResolved(config) {
      cwd = config.root
      isServe = config.command === 'serve'
    },

    buildStart() {
      log('[BUILD] Generating CSS...')
      generateCss(cwd)
    },

    configureServer() {
      if (isServe) {
        startWatch(cwd)
      }
    },
  }
}
