import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  GLOBAL_TOASTER_UID,
  GLOBAL_TOASTER_VERSION,
  getGlobalToaster,
} from './global-toaster.js'
import { message } from './toast.test-utils.js'

describe('getGlobalToaster', () => {
  const SLOT = Symbol.for('@fubaritico/toaster')
  const host = globalThis as unknown as Record<symbol, unknown>

  afterEach(() => {
    Reflect.deleteProperty(host, SLOT)
  })

  describe('happy path', () => {
    it('returns the same machine to every caller', () => {
      expect(getGlobalToaster<string>()).toBe(getGlobalToaster<string>())
    })

    it('stores it under the registered symbol another copy of the package resolves', () => {
      const toaster = getGlobalToaster<string>()
      expect(host[SLOT]).toEqual({ version: GLOBAL_TOASTER_VERSION, toaster })
    })

    it('exposes no destroy, at run time either', () => {
      const shared = getGlobalToaster<string>() as unknown as Record<
        string,
        unknown
      >
      expect(shared.destroy).toBeUndefined()
      expect(Object.isFrozen(shared)).toBe(true)
    })

    it('namespaces its ids with the page uid', () => {
      const id = getGlobalToaster<string>().show(message('Saved'))
      expect(id.startsWith(`${GLOBAL_TOASTER_UID}-`)).toBe(true)
    })
  })

  describe('managed errors', () => {
    it('throws when the page was set up by a copy on another contract version', () => {
      const valid = getGlobalToaster<string>()
      host[SLOT] = { version: GLOBAL_TOASTER_VERSION + 1, toaster: valid }
      expect(() => getGlobalToaster()).toThrow(
        /Align the design-system versions/
      )
    })

    it('reports a version mismatch, not a foreign slot, for a copy that lacks a method', () => {
      host[SLOT] = {
        version: GLOBAL_TOASTER_VERSION + 1,
        toaster: { show: () => '' },
      }
      expect(() => getGlobalToaster()).toThrow(
        /Align the design-system versions/
      )
    })

    it.each([
      ['a string', 'hijacked'],
      ['an object without a toaster', { version: GLOBAL_TOASTER_VERSION }],
      [
        'a toaster missing its methods',
        { version: GLOBAL_TOASTER_VERSION, toaster: { show: () => '' } },
      ],
      [
        'a toaster without its attribute builders',
        {
          version: GLOBAL_TOASTER_VERSION,
          toaster: Object.fromEntries(
            [
              'show',
              'dismiss',
              'dismissAll',
              'pause',
              'resume',
              'setOptions',
              'getState',
              'subscribe',
              'batch',
              'handleKeydown',
              'handleToastKeydown',
            ].map((name) => [name, () => undefined])
          ),
        },
      ],
    ])('throws when the slot holds %s', (_label, value) => {
      host[SLOT] = value
      expect(() => getGlobalToaster()).toThrow(/is not a toaster/)
    })
  })

  // L4: N/A — the slot's content is checked (managed errors); no async path.

  describe('edge cases', () => {
    it('keeps the stack of one bundle when another unsubscribes', () => {
      const shared = getGlobalToaster<string>()
      const first = vi.fn()
      const second = vi.fn()
      const unsubscribeFirst = shared.subscribe(first)
      shared.subscribe(second)
      unsubscribeFirst()
      shared.show(message('Saved'))
      expect(first).not.toHaveBeenCalled()
      expect(second).toHaveBeenCalledTimes(1)
    })
  })
})
