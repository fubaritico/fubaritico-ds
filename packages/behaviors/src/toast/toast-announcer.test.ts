import { describe, expect, it } from 'vitest'

import { TOAST_ANNOUNCEMENT_LIFETIME } from './toast-announcer.js'
import { message, setup } from './toast.test-utils.js'

/**
 * Hands back every pending announcement with a text of the caller's choosing.
 *
 * @param toaster - The toaster.
 * @param toaster.getState - Its snapshot reader.
 * @param toaster.announce - Its announce gesture.
 * @param text - The text each toast would show, by toast id.
 */
function fulfilAll(
  toaster: {
    getState: () => {
      announcements: readonly { seq: number; toastId: string }[]
    }
    announce: (seq: number, text: string) => boolean
  },
  text: (toastId: string) => string
) {
  for (const { seq, toastId } of toaster.getState().announcements)
    toaster.announce(seq, text(toastId))
}

describe('toast announcements', () => {
  describe('happy path', () => {
    it('queues a toast that appears', () => {
      const { toaster } = setup()
      const id = toaster.show(message('Saved'))
      const [toast] = toaster.getState().toasts
      expect(toaster.getState().announcements).toEqual([
        { seq: 1, toastId: id, domId: toast.domId, politeness: 'polite' },
      ])
    })

    it('writes the text the adapter hands back into the polite region', () => {
      const { toaster } = setup()
      toaster.show(message('Saved'))
      fulfilAll(toaster, () => 'Saved')
      expect(toaster.getState().live).toEqual({
        polite: 'Saved',
        assertive: '',
      })
      expect(toaster.getState().announcements).toEqual([])
    })

    it('empties the regions once the lifetime is over', () => {
      const { toaster, tick } = setup()
      toaster.show(message('Saved', { duration: Infinity }))
      fulfilAll(toaster, () => 'Saved')
      tick(TOAST_ANNOUNCEMENT_LIFETIME - 1)
      expect(toaster.getState().live.polite).toBe('Saved')
      tick(1)
      expect(toaster.getState().live.polite).toBe('')
    })
  })

  describe('variants', () => {
    it('routes an urgent toast to the assertive region', () => {
      const { toaster } = setup()
      toaster.show(message('Offline', { urgent: true }))
      fulfilAll(toaster, () => 'Offline')
      expect(toaster.getState().live).toEqual({
        polite: '',
        assertive: 'Offline',
      })
    })

    it('adds a second toast after the first, both heard', () => {
      const { toaster } = setup()
      toaster.show(message('Saved'))
      fulfilAll(toaster, () => 'Saved')
      toaster.show(message('Synced'))
      fulfilAll(toaster, () => 'Synced')
      expect(toaster.getState().live.polite).toBe('Saved. Synced')
    })

    it('queues again a toast whose content is replaced in place', () => {
      const { toaster } = setup()
      toaster.show(message('Saving…', { id: 'save' }))
      fulfilAll(toaster, () => 'Saving…')
      toaster.show(message('Saved', { id: 'save' }))
      expect(toaster.getState().announcements).toHaveLength(1)
    })

    it('queues again what was being read when the regions are remounted', () => {
      const { toaster } = setup()
      toaster.show(message('Saved', { duration: Infinity }))
      fulfilAll(toaster, () => 'Saved')
      toaster.regionRemounted(false)
      expect(toaster.getState().live).toEqual({ polite: '', assertive: '' })
      expect(toaster.getState().announcements).toHaveLength(1)
    })
    it('fills both regions when an urgent and a polite toast arrive together', () => {
      const { toaster } = setup()
      toaster.show(message('Saved'))
      toaster.show(message('Offline', { urgent: true }))
      fulfilAll(toaster, (id) => (id.endsWith('1') ? 'Saved' : 'Offline'))
      expect(toaster.getState().live).toEqual({
        polite: 'Saved',
        assertive: 'Offline',
      })
    })

    it('restarts the emptying on a second write', () => {
      const { toaster, tick } = setup()
      toaster.show(message('Saved', { duration: Infinity }))
      fulfilAll(toaster, () => 'Saved')
      tick(TOAST_ANNOUNCEMENT_LIFETIME - 100)
      toaster.show(message('Synced', { duration: Infinity }))
      fulfilAll(toaster, () => 'Synced')
      tick(100)
      expect(toaster.getState().live.polite).toBe('Saved. Synced')
      tick(TOAST_ANNOUNCEMENT_LIFETIME - 100)
      expect(toaster.getState().live.polite).toBe('')
    })

    it('releases the pointer and focus reasons when the stack is remounted without focus', () => {
      const { toaster } = setup()
      toaster.pause('pointer')
      toaster.pause('focus')
      toaster.regionRemounted(false)
      expect(toaster.getState().paused).toBe(false)
    })

    it('keeps the focus reason when the stack is remounted with focus inside', () => {
      const { toaster } = setup()
      toaster.pause('focus')
      toaster.regionRemounted(true)
      expect(toaster.getState().paused).toBe(true)
    })
  })

  describe('managed errors', () => {
    it('declines a number already handed back (an adapter run twice)', () => {
      const { toaster } = setup()
      toaster.show(message('Saved'))
      const [{ seq }] = toaster.getState().announcements
      expect(toaster.announce(seq, 'Saved')).toBe(true)
      expect(toaster.announce(seq, 'Saved')).toBe(false)
      expect(toaster.getState().live.polite).toBe('Saved')
    })

    it('drops the queued announcement of a toast that left', () => {
      const { toaster } = setup()
      const id = toaster.show(message('Saved'))
      const [{ seq }] = toaster.getState().announcements
      toaster.dismiss(id)
      expect(toaster.getState().announcements).toEqual([])
      expect(toaster.announce(seq, 'Saved')).toBe(false)
    })
  })

  // L4: N/A — the text comes from the adapter's DOM; an empty one is an edge case, below.

  describe('edge cases', () => {
    it('adds no second full stop after a text that ends a sentence', () => {
      const { toaster } = setup()
      toaster.show(message('Upload failed.'))
      fulfilAll(toaster, () => 'Upload failed.')
      toaster.show(message('Saved'))
      fulfilAll(toaster, () => 'Saved')
      expect(toaster.getState().live.polite).toBe('Upload failed. Saved')
    })

    it('queues a toast replaced in place once on a replay', () => {
      const { toaster } = setup()
      toaster.show(message('Saving…', { id: 'save', duration: Infinity }))
      fulfilAll(toaster, () => 'Saving…')
      toaster.show(message('Saved', { id: 'save', duration: Infinity }))
      toaster.regionRemounted(false)
      expect(toaster.getState().announcements).toHaveLength(1)
    })

    it('does not queue on a replay a toast that left', () => {
      const { toaster } = setup()
      const id = toaster.show(message('Saved'))
      fulfilAll(toaster, () => 'Saved')
      toaster.dismiss(id)
      toaster.regionRemounted(false)
      expect(toaster.getState().announcements).toEqual([])
    })

    it('writes nothing for an empty text, and dequeues it', () => {
      const { toaster } = setup()
      toaster.show(message('Saved'))
      fulfilAll(toaster, () => '   ')
      expect(toaster.getState().live.polite).toBe('')
      expect(toaster.getState().announcements).toEqual([])
    })

    it('does nothing on a replay with nothing being read', () => {
      const { toaster, listener } = setup()
      toaster.regionRemounted(false)
      expect(listener).not.toHaveBeenCalled()
    })

    it('empties everything on destroy', () => {
      const { toaster } = setup()
      toaster.show(message('Saved'))
      toaster.destroy()
      expect(toaster.getState().announcements).toEqual([])
      expect(toaster.getState().live).toEqual({ polite: '', assertive: '' })
    })
  })
})
