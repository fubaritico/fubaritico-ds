import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Icon, { ICON_NAMES, isIconName } from './Icon'

describe('Icon', () => {
  describe('happy path', () => {
    it('renders a decorative glyph', () => {
      const { container } = render(<Icon name="Check" />)
      expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    })

    it('recognises a name of the set', () => {
      expect(isIconName('Check')).toBe(true)
    })
  })

  describe('variants', () => {
    it.each([16, 20, 24] as const)('draws the glyph at %i px', (size) => {
      const { container } = render(<Icon name="Check" size={size} />)
      expect(container.querySelector('svg')).toHaveAttribute('width', String(size))
    })

    it('lists every name of the set at run time', () => {
      expect(ICON_NAMES).toContain('XMark')
      expect(ICON_NAMES.every(isIconName)).toBe(true)
    })
  })

  describe('managed errors', () => {
    it('does not recognise a name outside the set', () => {
      expect(isIconName('Unicorn')).toBe(false)
    })
  })

  // L4: N/A — a typed name renders; an untyped one is checked with isIconName before it gets here.

  describe('edge cases', () => {
    it.each(['toString', 'constructor', '__proto__', ''])(
      'does not take the inherited or empty name %o for an icon',
      (name) => {
        expect(isIconName(name)).toBe(false)
      }
    )

    it('freezes the list', () => {
      expect(Object.isFrozen(ICON_NAMES)).toBe(true)
    })
  })
})
