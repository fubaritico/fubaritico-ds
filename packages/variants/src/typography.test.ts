import { describe, expect, it } from 'vitest'

import { typographyVariants } from './typography.js'

describe('typographyVariants', () => {
  describe('happy path', () => {
    it('returns base + body (default) when called with no args', () => {
      expect(typographyVariants()).toBe('ui-typography ui-typography--body')
    })
  })

  describe('variants', () => {
    it.each([
      ['h1', 'ui-typography ui-typography--h1'],
      ['h2', 'ui-typography ui-typography--h2'],
      ['h3', 'ui-typography ui-typography--h3'],
      ['h4', 'ui-typography ui-typography--h4'],
      ['h5', 'ui-typography ui-typography--h5'],
      ['h6', 'ui-typography ui-typography--h6'],
      ['body', 'ui-typography ui-typography--body'],
      ['caption', 'ui-typography ui-typography--caption'],
      ['overline', 'ui-typography ui-typography--overline'],
      ['label', 'ui-typography ui-typography--label'],
    ] as const)('emits the modifier for variant "%s"', (variant, expected) => {
      expect(typographyVariants({ variant })).toBe(expected)
    })

    it('emits no variant modifier for "inherit"', () => {
      expect(typographyVariants({ variant: 'inherit' })).toBe('ui-typography')
    })

    it.each([
      ['left', 'ui-typography--align-left'],
      ['center', 'ui-typography--align-center'],
      ['right', 'ui-typography--align-right'],
      ['justify', 'ui-typography--align-justify'],
    ] as const)('emits the align modifier for "%s"', (align, expected) => {
      expect(typographyVariants({ align })).toContain(expected)
    })

    it('emits no align modifier for "inherit"', () => {
      expect(typographyVariants({ align: 'inherit' })).toBe(
        'ui-typography ui-typography--body'
      )
    })

    it('emits the gutter-bottom and no-wrap modifiers when enabled', () => {
      const cls = typographyVariants({ gutterBottom: true, noWrap: true })
      expect(cls).toContain('ui-typography--gutter-bottom')
      expect(cls).toContain('ui-typography--no-wrap')
    })
  })

  // L3 managed errors: N/A — a pure CVA resolver has no user-facing error path.

  describe('unmanaged errors', () => {
    it('falls back to defaults when props are explicitly undefined', () => {
      expect(
        typographyVariants({
          variant: undefined,
          align: undefined,
          gutterBottom: undefined,
          noWrap: undefined,
        })
      ).toBe('ui-typography ui-typography--body')
    })
  })

  describe('edge cases', () => {
    it('never emits an empty-string token in the output', () => {
      const result = typographyVariants({
        variant: 'inherit',
        align: 'inherit',
      })
      expect(result.split(' ')).not.toContain('')
    })
  })
})
