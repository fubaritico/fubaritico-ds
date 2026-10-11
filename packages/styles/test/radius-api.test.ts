import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// The radius API is hand-written in every skin: these checks parse the CSS so a typo in one of
// ~80 declarations (a wrong corner, a block name that differs between the corner var and its
// fallback) cannot ship. The browser test in reference (Card) proves the mechanism renders.

const STYLES_DIR = join(import.meta.dirname, '..', 'src', 'styles')

/** The skin partials, name → source. */
const SKINS = readdirSync(STYLES_DIR)
  .filter((file) => file.endsWith('.css'))
  .map((file) => ({ file, css: readFileSync(join(STYLES_DIR, file), 'utf8') }))

/** The four logical corners, in declaration order. */
const CORNERS = ['start-start', 'start-end', 'end-start', 'end-end'] as const

/** Shapes round by nature: one radius var, on `--radius-full`, and no per-corner API. */
const SHAPES = [
  ['avatar.css', '--ui-avatar-radius'],
  ['spinner.css', '--ui-spinner-radius'],
  ['dropdown.css', '--ui-dropdown-dot-radius'],
  ['color-picker.css', '--ui-color-picker-thumb-radius'],
  ['slider.css', '--ui-slider-thumb-radius'],
] as const

const CORNER_RULE =
  /border-(start-start|start-end|end-start|end-end)-radius:\s*var\((--ui-[a-z0-9-]+?)-radius-(start-start|start-end|end-start|end-end),\s*var\((--ui-[a-z0-9-]+?)-radius\)\)/g

describe('radius API', () => {
  describe('happy path', () => {
    it('names every corner after the property it sets, on one block var', () => {
      for (const { file, css } of SKINS) {
        for (const [, property, block, corner, fallback] of css.matchAll(CORNER_RULE)) {
          expect({ file, corner }).toEqual({ file, corner: property })
          expect({ file, fallback }).toEqual({ file, fallback: block })
        }
      }
    })
  })

  describe('variants', () => {
    it('sets all four corners per block var — the bottom sheet its two top ones only', () => {
      for (const { file, css } of SKINS) {
        const byBlock = new Map<string, string[]>()
        for (const [, , block, corner] of css.matchAll(CORNER_RULE))
          byBlock.set(block, [...(byBlock.get(block) ?? []), corner])
        for (const [block, corners] of byBlock) {
          const expected =
            block === '--ui-bottom-sheet' ? ['start-start', 'start-end'] : [...CORNERS]
          expect({ file, block, corners }).toEqual({ file, block, corners: expected })
        }
      }
    })

    it.each(SHAPES)('keeps %s / %s round: --radius-full, no corners', (file, variable) => {
      const css = SKINS.find((skin) => skin.file === file)?.css ?? ''
      expect(css).toContain(`${variable}: var(--radius-full)`)
      expect(css).toContain(`border-radius: var(${variable})`)
      expect(css).not.toContain(`${variable}-start-start`)
    })
  })

  // L3/L4: N/A — static source checks, no runtime error path.

  describe('edge cases', () => {
    it('writes no radius literal: every border-radius is a var, or inherit', () => {
      for (const { file, css } of SKINS) {
        for (const [, value] of css.matchAll(/(?<![-\w])border-radius:\s*([^;]+);/g))
          expect({ file, value }).toEqual({
            file,
            value: value === 'inherit' ? 'inherit' : expect.stringMatching(/^var\(--ui-[a-z0-9-]+-radius\)$/),
          })
      }
    })
  })
})
