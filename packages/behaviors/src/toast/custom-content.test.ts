import { describe, expect, it } from 'vitest'

import { customContentFor } from './custom-content.js'
import { message, setup } from './toast.test-utils.js'

describe('customContentFor', () => {
  describe('happy path', () => {
    it('hands free content to the adapter of its framework', () => {
      const { toaster } = setup()
      toaster.show({
        message: { title: 'Upload' },
        custom: { kind: 'react', value: '<node>' },
      })
      const [toast] = toaster.getState().toasts
      expect(customContentFor(toast, 'react')).toBe('<node>')
    })
  })

  describe('variants', () => {
    it('tells an adapter to render the message when there is no free content', () => {
      const { toaster } = setup()
      toaster.show(message('Saved'))
      const [toast] = toaster.getState().toasts
      expect(customContentFor(toast, 'react')).toBeUndefined()
    })
  })

  describe('managed errors', () => {
    it('throws when an adapter reads free content of another framework', () => {
      const { toaster } = setup()
      toaster.show({
        id: 'up',
        message: { title: 'Upload' },
        custom: { kind: 'angular', value: '<tpl>' },
      })
      const [toast] = toaster.getState().toasts
      expect(() => customContentFor(toast, 'react')).toThrow(
        /angular content, which a react stack cannot render/
      )
    })
  })

  // L4: N/A — the record comes from the machine, which checked the content when it was shown.

  describe('edge cases', () => {
    it('reads the free content of a toast that also holds a message', () => {
      const { toaster } = setup()
      toaster.show({
        message: { title: 'Upload' },
        custom: { kind: 'react', value: '<progress>' },
      })
      const [toast] = toaster.getState().toasts
      expect(customContentFor(toast, 'react')).toBe('<progress>')
    })
  })
})
