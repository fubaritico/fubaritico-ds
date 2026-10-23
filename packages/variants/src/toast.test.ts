import { describe, expect, it } from 'vitest'

import { toastVariants, toasterVariants } from './toast.js'

describe('toasterVariants', () => {
  describe('happy path', () => {
    it('sits at the bottom end by default', () => {
      expect(toasterVariants()).toBe('ui-toaster ui-toaster--bottom-end')
    })
  })

  describe('variants', () => {
    it.each([
      'top-start',
      'top-center',
      'top-end',
      'bottom-start',
      'bottom-center',
      'bottom-end',
    ] as const)('emits the %s modifier', (position) => {
      expect(toasterVariants({ position })).toBe(
        `ui-toaster ui-toaster--${position}`
      )
    })
  })

  // L3: managed errors — N/A (pure class-name resolver)

  describe('unmanaged errors', () => {
    it('ignores an undefined position', () => {
      expect(toasterVariants({ position: undefined })).toBe(
        'ui-toaster ui-toaster--bottom-end'
      )
    })
  })

  describe('edge cases', () => {
    it('keeps the base class first (override-friendly ordering)', () => {
      expect(
        toasterVariants({ position: 'top-center' }).startsWith('ui-toaster ')
      ).toBe(true)
    })
  })
})

describe('toastVariants', () => {
  describe('happy path', () => {
    it('emits the base block class with default props', () => {
      expect(toastVariants()).toBe('ui-toast')
    })
  })

  describe('variants', () => {
    it.each(['neutral', 'info'] as const)(
      'emits no modifier for %s (the base look)',
      (variant) => {
        expect(toastVariants({ variant })).toBe('ui-toast')
      }
    )

    it.each(['success', 'warning', 'error'] as const)(
      'emits the %s modifier',
      (variant) => {
        expect(toastVariants({ variant })).toBe(`ui-toast ui-toast--${variant}`)
      }
    )

    it('emits the bare modifier', () => {
      expect(toastVariants({ bare: true })).toBe('ui-toast ui-toast--bare')
    })

    it('combines an intent and the bare shell', () => {
      expect(toastVariants({ variant: 'error', bare: true })).toBe(
        'ui-toast ui-toast--error ui-toast--bare'
      )
    })
  })

  // L3: managed errors — N/A (pure class-name resolver)

  describe('unmanaged errors', () => {
    it('falls back to the defaults on an empty object', () => {
      expect(toastVariants({})).toBe('ui-toast')
    })

    it('ignores undefined props', () => {
      expect(toastVariants({ variant: undefined, bare: undefined })).toBe(
        'ui-toast'
      )
    })
  })

  describe('edge cases', () => {
    it('emits no modifier for bare: false', () => {
      expect(toastVariants({ bare: false })).toBe('ui-toast')
    })
  })
})
