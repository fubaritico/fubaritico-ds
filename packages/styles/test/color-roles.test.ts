import { readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// A theme redefines the colour ROLES (`--color-surface`, `--color-text`…), never the grey scale.
// So a skin that reads a primitive (`--color-primitive-neutral-0`) is out of a theme's reach, and
// a skin that reads a role the tokens do not emit renders nothing. Both are silent in a browser.

const STYLES_DIR = join(import.meta.dirname, '..', 'src', 'styles')

/** The skin partials, name → source. */
const SKINS = readdirSync(STYLES_DIR)
  .filter((file) => file.endsWith('.css'))
  .map((file) => ({
    file,
    // Comments may name a token (history, rationale) without reading it.
    css: readFileSync(join(STYLES_DIR, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''),
  }))

/** The custom properties the tokens package emits. */
const TOKENS = new Set(
  readFileSync(
    createRequire(import.meta.url).resolve('@fubaritico/tokens/css'),
    'utf8'
  ).match(/--color-[a-z0-9-]+(?=:)/g)
)

/** Skins allowed to read primitives: the colour picker paints colours, its chrome is invariant. */
const INVARIANT_SKINS = new Set(['color-picker.css'])

const COLOR_REF = /var\((--color-[a-z0-9-]+)/g

describe('colour roles', () => {
  describe('happy path', () => {
    it('reads only colours the tokens emit', () => {
      for (const { file, css } of SKINS) {
        for (const [, name] of css.matchAll(COLOR_REF)) {
          expect({ file, name, emitted: TOKENS.has(name) }).toEqual({
            file,
            name,
            emitted: true,
          })
        }
      }
    })

    it('reads roles, not the primitive scale, outside the colour picker', () => {
      for (const { file, css } of SKINS) {
        if (INVARIANT_SKINS.has(file)) continue
        const primitives = [
          ...css.matchAll(/var\((--color-primitive-[a-z0-9-]+)/g),
        ].map(([, name]) => name)
        expect({ file, primitives }).toEqual({ file, primitives: [] })
      }
    })
  })

  // L2: N/A — one rule, no variants. L4: N/A — pure source check, no runtime input.

  describe('managed errors', () => {
    it('reads none of the names removed on 2026-10-13 (their overrides would be ignored silently)', () => {
      const removed = /var\(--color-(foreground|muted|background|secondary|accent|card|popover|input|ring)\b/
      for (const { file, css } of SKINS) {
        expect({ file, removed: removed.exec(css)?.[0] ?? null }).toEqual({ file, removed: null })
      }
    })
  })

  describe('edge cases', () => {
    it('finds the skins and the tokens (a broken path must not pass vacuously)', () => {
      expect(SKINS.length).toBeGreaterThan(20)
      expect(TOKENS.has('--color-surface')).toBe(true)
    })
  })
})
