import { describe, expect, it, vi } from 'vitest'

import {
  TOASTER_DEFAULTS,
  TOAST_LEAVE_DURATION,
  createToaster,
} from './toast-machine.js'
import {
  keyEvent,
  manualScheduler,
  message,
  setup,
  titles,
} from './toast.test-utils.js'

import type { ToastInput, ToastScheduler, ToasterOptions } from './types.js'

describe('ToastMachine', () => {
  describe('happy path', () => {
    it('documents its defaults in one object', () => {
      expect(TOASTER_DEFAULTS).toEqual({
        max: 5,
        duration: 5000,
        leaveDuration: TOAST_LEAVE_DURATION,
        position: 'bottom-end',
        hotkey: 'F8',
        label: 'Notifications',
        closeLabel: 'Close',
      })
      expect(Object.isFrozen(TOASTER_DEFAULTS)).toBe(true)
    })

    it('shows a toast with the default options', () => {
      const { toaster } = setup()
      const id = toaster.show(message('Saved'))
      expect(toaster.getState().toasts).toEqual([
        {
          id,
          domId: 'app-toast-2',
          message: { title: 'Saved' },
          custom: undefined,
          duration: 5000,
          dismissible: true,
          urgent: false,
          phase: 'visible',
        },
      ])
    })

    it('removes a toast once its 5 seconds are over', () => {
      const { toaster, tick } = setup()
      toaster.show(message('Saved'))
      tick(4999)
      expect(titles(toaster)).toEqual(['Saved'])
      tick(1)
      expect(titles(toaster)).toEqual([])
    })

    it('notifies its subscribers when a toast is shown', () => {
      const { toaster, listener } = setup()
      toaster.show(message('Saved'))
      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenLastCalledWith(toaster.getState())
    })

    it('dismisses a toast by its id', () => {
      const { toaster } = setup()
      const id = toaster.show(message('Saved'))
      expect(toaster.dismiss(id)).toBe(true)
      expect(titles(toaster)).toEqual([])
    })

    it('generates distinct ids namespaced by uid', () => {
      const { toaster } = setup()
      const first = toaster.show(message('a'))
      const second = toaster.show(message('b'))
      expect(first).not.toBe(second)
      expect(first.startsWith('app-')).toBe(true)
    })

    it('runs on the global timers when no scheduler is injected', () => {
      vi.useFakeTimers()
      try {
        const toaster = createToaster<string>({ uid: 'app', leaveDuration: 0 })
        toaster.show(message('Saved'))
        vi.advanceTimersByTime(5000)
        expect(titles(toaster)).toEqual([])
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('variants', () => {
    it('evicts the oldest when a sixth toast arrives', () => {
      const { toaster } = setup({ position: 'top-end' })
      for (const t of ['t1', 't2', 't3', 't4', 't5', 't6'])
        toaster.show(message(t))
      expect(titles(toaster)).toEqual(['t2', 't3', 't4', 't5', 't6'])
    })

    it('honours a custom max', () => {
      const { toaster } = setup({ max: 2, position: 'top-end' })
      for (const t of ['t1', 't2', 't3']) toaster.show(message(t))
      expect(titles(toaster)).toEqual(['t2', 't3'])
    })

    it('evicts at once when max shrinks', () => {
      const { toaster } = setup({ position: 'top-end' })
      for (const t of ['t1', 't2', 't3']) toaster.show(message(t))
      toaster.setOptions({ max: 1 })
      expect(titles(toaster)).toEqual(['t3'])
    })

    it('orders oldest to newest top-down at the top of the screen', () => {
      const { toaster } = setup({ position: 'top-center' })
      for (const t of ['t1', 't2', 't3']) toaster.show(message(t))
      expect(titles(toaster)).toEqual(['t1', 't2', 't3'])
    })

    it('orders newest to oldest top-down at the bottom of the screen', () => {
      const { toaster } = setup({ position: 'bottom-start' })
      for (const t of ['t1', 't2', 't3']) toaster.show(message(t))
      expect(titles(toaster)).toEqual(['t3', 't2', 't1'])
    })

    it('reverses the order when the position moves from top to bottom', () => {
      const { toaster } = setup({ position: 'top-end' })
      for (const t of ['t1', 't2']) toaster.show(message(t))
      toaster.setOptions({ position: 'bottom-end' })
      expect(toaster.getState().position).toBe('bottom-end')
      expect(titles(toaster)).toEqual(['t2', 't1'])
    })

    it('sits at the bottom end by default', () => {
      const { toaster } = setup()
      expect(toaster.getState().position).toBe('bottom-end')
    })

    it('uses a per-toast duration', () => {
      const { toaster, tick } = setup()
      toaster.show(message('quick', { duration: 1000 }))
      tick(1000)
      expect(titles(toaster)).toEqual([])
    })

    it('uses the toaster duration for the toasts shown after it changes', () => {
      const { toaster, tick } = setup()
      toaster.setOptions({ duration: 2000 })
      toaster.show(message('a'))
      tick(2000)
      expect(titles(toaster)).toEqual([])
    })

    it('keeps an endless toast until it is dismissed', () => {
      const { toaster, tick, pending } = setup()
      const id = toaster.show(message('Loading', { duration: Infinity }))
      expect(pending()).toBe(0)
      tick(1_000_000)
      expect(titles(toaster)).toEqual(['Loading'])
      toaster.dismiss(id)
      expect(titles(toaster)).toEqual([])
    })

    it('replaces the content of a visible toast shown again with its id, in place', () => {
      const { toaster, tick } = setup({ position: 'top-end' })
      toaster.show(message('Saving…', { id: 'save', duration: Infinity }))
      toaster.show(message('other'))
      toaster.show(message('Saved', { id: 'save' }))
      expect(titles(toaster)).toEqual(['Saved', 'other'])
      tick(5000)
      expect(titles(toaster)).toEqual([])
    })

    it('keeps the DOM id of a toast whose content is replaced', () => {
      const { toaster } = setup()
      toaster.show(message('Saving…', { id: 'save' }))
      const before = toaster.getState().toasts[0]?.domId
      toaster.show(message('Saved', { id: 'save' }))
      expect(toaster.getState().toasts[0]?.domId).toBe(before)
    })

    it('keeps an urgent toast until it is dismissed (WCAG 2.2.1)', () => {
      const { toaster, tick } = setup()
      toaster.show(message('Offline', { urgent: true }))
      tick(60_000)
      expect(titles(toaster)).toEqual(['Offline'])
    })

    it('honours the duration given to an urgent toast', () => {
      const { toaster, tick } = setup()
      toaster.show(message('Offline', { urgent: true, duration: 2000 }))
      tick(2000)
      expect(titles(toaster)).toEqual([])
    })

    it('accepts an icon the stack renders', () => {
      const { toaster } = setup({ icons: ['Check'] })
      toaster.show({ message: { title: 'Done', icon: 'Check' } })
      expect(titles(toaster)).toEqual(['Done'])
    })

    it('flags an urgent toast', () => {
      const { toaster } = setup()
      toaster.show(message('Offline', { urgent: true }))
      expect(toaster.getState().toasts[0]?.urgent).toBe(true)
    })

    it('keeps a dismissed toast in its leaving phase for leaveDuration', () => {
      const { toaster, tick } = setup({ leaveDuration: 200 })
      const id = toaster.show(message('Saved'))
      toaster.dismiss(id)
      const [leaving] = toaster.getState().toasts
      expect(leaving.phase).toBe('leaving')
      expect(toaster.toastAttrs(leaving)['data-phase']).toBe('leaving')
      tick(200)
      expect(titles(toaster)).toEqual([])
    })

    it('keeps a dismissed toast for TOAST_LEAVE_DURATION by default', () => {
      const clock = manualScheduler()
      const toaster = createToaster<string>({
        uid: 'app',
        scheduler: clock.scheduler,
      })
      const id = toaster.show(message('Saved'))
      toaster.dismiss(id)
      clock.tick(TOAST_LEAVE_DURATION - 1)
      expect(titles(toaster)).toEqual(['Saved'])
      clock.tick(1)
      expect(titles(toaster)).toEqual([])
    })

    it('does not count a leaving toast towards max', () => {
      const { toaster } = setup({ max: 1, leaveDuration: 200 })
      toaster.show(message('a'))
      toaster.show(message('b'))
      expect(
        toaster.getState().toasts.map((t) => [t.message?.title, t.phase])
      ).toEqual([
        ['b', 'visible'],
        ['a', 'leaving'],
      ])
    })

    it('dismisses every visible toast at once, in one notification', () => {
      const { toaster, listener } = setup()
      toaster.show(message('a'))
      toaster.show(message('b'))
      listener.mockClear()
      toaster.dismissAll()
      expect(titles(toaster)).toEqual([])
      expect(listener).toHaveBeenCalledTimes(1)
    })

    describe('content', () => {
      it('keeps free content labelled with its framework', () => {
        const { toaster } = setup()
        toaster.show({
          message: { title: 'Upload' },
          custom: { kind: 'react', value: '<node>' },
        })
        const [toast] = toaster.getState().toasts
        expect(toast.custom).toEqual({ kind: 'react', value: '<node>' })
      })

      it('keeps a message beside free content', () => {
        const { toaster } = setup()
        toaster.show({
          message: { title: 'Upload', variant: 'info', icon: 'Upload' },
          custom: { kind: 'react', value: '<progress>' },
        })
        expect(toaster.getState().toasts[0]?.message).toEqual({
          title: 'Upload',
          variant: 'info',
          icon: 'Upload',
        })
      })
    })

    describe('pause (WCAG 2.2.1)', () => {
      it('holds the timers while paused and runs what was left after', () => {
        const { toaster, tick } = setup()
        toaster.show(message('Saved'))
        tick(3000)
        toaster.pause('pointer')
        expect(toaster.getState().paused).toBe(true)
        tick(60_000)
        expect(titles(toaster)).toEqual(['Saved'])
        toaster.resume('pointer')
        tick(1999)
        expect(titles(toaster)).toEqual(['Saved'])
        tick(1)
        expect(titles(toaster)).toEqual([])
      })

      it('adds up the time across two pause cycles', () => {
        const { toaster, tick } = setup()
        toaster.show(message('Saved'))
        tick(1000)
        toaster.pause('pointer')
        tick(500)
        toaster.resume('pointer')
        tick(1000)
        toaster.pause('focus')
        tick(500)
        toaster.resume('focus')
        tick(2999)
        expect(titles(toaster)).toEqual(['Saved'])
        tick(1)
        expect(titles(toaster)).toEqual([])
      })

      it('stays paused until every reason is released', () => {
        const { toaster, tick } = setup()
        toaster.show(message('Saved'))
        toaster.pause('pointer')
        toaster.pause('focus')
        toaster.resume('pointer')
        expect(toaster.getState().paused).toBe(true)
        tick(10_000)
        expect(titles(toaster)).toEqual(['Saved'])
        toaster.resume('focus')
        tick(5000)
        expect(titles(toaster)).toEqual([])
      })

      it('does not start the timer of a toast shown while paused', () => {
        const { toaster, tick } = setup()
        toaster.pause('document')
        toaster.show(message('Saved'))
        tick(10_000)
        expect(titles(toaster)).toEqual(['Saved'])
        toaster.resume('document')
        tick(5000)
        expect(titles(toaster)).toEqual([])
      })

      it('gives a toast replaced while paused its full duration on resume', () => {
        const { toaster, tick } = setup()
        toaster.show(message('Saving…', { id: 'save' }))
        tick(4000)
        toaster.pause('pointer')
        toaster.show(message('Saved', { id: 'save' }))
        tick(10_000)
        toaster.resume('pointer')
        tick(4999)
        expect(titles(toaster)).toEqual(['Saved'])
        tick(1)
        expect(titles(toaster)).toEqual([])
      })

      it('does not hold the exit of a leaving toast', () => {
        const { toaster, tick } = setup({ leaveDuration: 200 })
        const id = toaster.show(message('Saved'))
        toaster.dismiss(id)
        toaster.pause('pointer')
        tick(200)
        expect(titles(toaster)).toEqual([])
      })
    })

    describe('keyboard', () => {
      it('moves focus into the stack on F8 when it holds a toast', () => {
        const { toaster } = setup()
        toaster.show(message('Saved'))
        const event = keyEvent('F8')
        expect(toaster.handleKeydown(event)).toBe(true)
        expect(event.preventDefault).toHaveBeenCalled()
        expect(toaster.getState().focusToken).toBe(1)
      })

      it('honours a custom hotkey, named in the region label', () => {
        const { toaster } = setup({ hotkey: 'F6' })
        toaster.show(message('Saved'))
        expect(toaster.handleKeydown(keyEvent('F8'))).toBe(false)
        expect(toaster.handleKeydown(keyEvent('F6'))).toBe(true)
        expect(toaster.regionAttrs()['aria-label']).toBe('Notifications (F6)')
      })

      it('closes the focused toast on Escape', () => {
        const { toaster } = setup()
        const id = toaster.show(message('Saved'))
        const event = keyEvent('Escape')
        expect(toaster.handleToastKeydown(id, event)).toBe(true)
        expect(event.preventDefault).toHaveBeenCalled()
        expect(titles(toaster)).toEqual([])
      })

      it('leaves other keys on a toast alone', () => {
        const { toaster } = setup()
        const id = toaster.show(message('Saved'))
        expect(toaster.handleToastKeydown(id, keyEvent('Enter'))).toBe(false)
        expect(titles(toaster)).toEqual(['Saved'])
      })
    })

    describe('attributes', () => {
      it('makes the stack a named landmark, focusable by script only', () => {
        const { toaster } = setup({ label: 'Alertes' })
        expect(toaster.regionAttrs()).toEqual({
          role: 'region',
          'aria-label': 'Alertes (F8)',
          tabindex: -1,
        })
      })

      it('makes a toast focusable, named by its title', () => {
        const { toaster } = setup()
        toaster.show(message('Saved', { id: 'save' }))
        const [toast] = toaster.getState().toasts
        expect(toaster.toastAttrs(toast)).toEqual({
          id: toast.domId,
          tabindex: 0,
          'data-phase': 'visible',
          'aria-labelledby': `${toast.domId}-title`,
          'aria-label': undefined,
        })
        expect(toaster.titleAttrs(toast)).toEqual({
          id: `${toast.domId}-title`,
        })
      })

      it('names the close button after its toast title', () => {
        const { toaster } = setup({ closeLabel: 'Fermer' })
        toaster.show(message('Saved'))
        const [toast] = toaster.getState().toasts
        expect(toaster.closeButtonAttrs(toast)).toEqual({
          type: 'button',
          id: `${toast.domId}-close`,
          'aria-label': 'Fermer',
          'aria-labelledby': `${toast.domId}-close ${toast.domId}-title`,
        })
      })

      it('names free content and its close button by its label', () => {
        const { toaster } = setup()
        toaster.show({
          message: { title: 'Upload' },
          custom: { kind: 'react', value: '<progress>' },
        })
        const [toast] = toaster.getState().toasts
        expect(toaster.toastAttrs(toast)['aria-label']).toBe('Upload')
        expect(toaster.toastAttrs(toast)['aria-labelledby']).toBeUndefined()
        expect(toaster.closeButtonAttrs(toast)['aria-label']).toBe(
          'Close Upload'
        )
      })

      it('names an untitled toast by its description', () => {
        const { toaster } = setup()
        toaster.show({ message: { description: 'Stored' } })
        const [toast] = toaster.getState().toasts
        expect(toaster.toastAttrs(toast)['aria-labelledby']).toBe(
          `${toast.domId}-description`
        )
        expect(toaster.descriptionAttrs(toast)).toEqual({
          id: `${toast.domId}-description`,
        })
      })

      it('names the close button of an untitled toast after its description', () => {
        const { toaster } = setup()
        toaster.show({ message: { description: 'Stored' } })
        const [toast] = toaster.getState().toasts
        expect(toaster.closeButtonAttrs(toast)['aria-labelledby']).toBe(
          `${toast.domId}-close ${toast.domId}-description`
        )
      })

      it('describes a polite and an assertive live region, both role status', () => {
        const { toaster } = setup()
        expect(toaster.announcerAttrs('polite')).toEqual({
          role: 'status',
          'aria-live': 'polite',
          'aria-atomic': 'true',
        })
        expect(toaster.announcerAttrs('assertive')).toEqual({
          role: 'status',
          'aria-live': 'assertive',
          'aria-atomic': 'true',
        })
      })

      it('emits strings and numbers only, never booleans', () => {
        const { toaster } = setup()
        toaster.show(message('Saved'))
        const [toast] = toaster.getState().toasts
        const values = [
          ...Object.values(toaster.regionAttrs()),
          ...Object.values(toaster.toastAttrs(toast)),
          ...Object.values(toaster.closeButtonAttrs(toast)),
          ...Object.values(toaster.announcerAttrs('polite')),
        ]
        for (const value of values)
          expect(['string', 'number', 'undefined']).toContain(typeof value)
      })
    })
  })

  describe('managed errors', () => {
    it.each([0, -1, Number.NaN])(
      'throws on a toast duration of %s',
      (duration) => {
        const { toaster } = setup()
        expect(() => toaster.show(message('a', { duration }))).toThrow(
          RangeError
        )
        expect(titles(toaster)).toEqual([])
      }
    )

    it.each([0, 1.5, -2, Number.NaN])('throws on a max of %s', (max) => {
      expect(() => setup({ max })).toThrow(RangeError)
    })

    it.each([-1, Infinity, Number.NaN])(
      'throws on a leaveDuration of %s',
      (leaveDuration) => {
        expect(() => setup({ leaveDuration })).toThrow(RangeError)
      }
    )

    it.each([{ max: 0 }, { duration: 0 }, { leaveDuration: -1 }])(
      'throws on the patch %o and keeps the previous options',
      (patch) => {
        const { toaster, tick } = setup({ position: 'top-end' })
        expect(() => {
          toaster.setOptions(patch)
        }).toThrow(RangeError)
        for (const t of ['t1', 't2', 't3', 't4', 't5']) toaster.show(message(t))
        expect(titles(toaster)).toHaveLength(5)
        tick(5000)
        expect(titles(toaster)).toEqual([])
      }
    )

    it('throws when there is nothing to render', () => {
      const { toaster } = setup()
      expect(() => toaster.show({})).toThrow(TypeError)
    })

    it('throws on free content without a title, its accessible name', () => {
      const { toaster } = setup()
      expect(() =>
        toaster.show({ custom: { kind: 'react', value: '<node>' } })
      ).toThrow(/needs a `message.title` — its accessible name/)
      expect(titles(toaster)).toEqual([])
    })

    it('throws on free content without its framework', () => {
      const { toaster } = setup()
      expect(() => toaster.show({ custom: { kind: '', value: 'x' } })).toThrow(
        TypeError
      )
    })

    it.each([
      ['title', { title: 42 }],
      ['description', { description: {} }],
      ['icon', { icon: ['Check'] }],
    ])('throws when message.%s is not a string', (field, bad) => {
      const { toaster } = setup()
      const input = { message: bad } as unknown as ToastInput<string>
      expect(() => toaster.show(input)).toThrow(
        new RegExp(`message\\.${field} must be a string`)
      )
    })

    it('throws in the caller on an icon the stack does not render', () => {
      const { toaster } = setup({ icons: ['Check'] })
      expect(() =>
        toaster.show({ message: { title: 'Done', icon: 'Chek' } })
      ).toThrow(/message.icon "Chek" is not an icon this page's stack renders/)
      expect(titles(toaster)).toEqual([])
    })

    it.each([[['']], ['Check'], [[42]]])('throws on icons %o', (icons) => {
      const { toaster } = setup()
      expect(() => {
        toaster.setOptions({ icons } as unknown as ToasterOptions)
      }).toThrow(/icons must be an array of non-empty icon names/)
    })

    it('throws on an unknown variant', () => {
      const { toaster } = setup()
      const input = {
        message: { title: 'a', variant: 'danger' },
      } as unknown as ToastInput<string>
      expect(() => toaster.show(input)).toThrow(/must be one of neutral, info/)
    })

    it('throws in the caller when the stack cannot render the free content', () => {
      const { toaster } = setup({ renderer: 'react' })
      expect(() =>
        toaster.show({
          message: { title: 'Upload' },
          custom: { kind: 'angular', value: '<tpl>' },
        })
      ).toThrow(/rendered by react, it cannot render angular content/)
      expect(titles(toaster)).toEqual([])
    })

    it('accepts free content of the framework the stack renders', () => {
      const { toaster } = setup({ renderer: 'react' })
      toaster.show({
        message: { title: 'Upload' },
        custom: { kind: 'react', value: '<node>' },
      })
      expect(toaster.getState().toasts).toHaveLength(1)
    })

    it('throws on an unknown position', () => {
      expect(() =>
        setup({ position: 'middle' as unknown as ToasterOptions['position'] })
      ).toThrow(/position must be one of top-start/)
    })

    it.each(['hotkey', 'label', 'closeLabel', 'renderer'] as const)(
      'throws when %s is not a non-empty string',
      (name) => {
        const { toaster } = setup()
        expect(() => {
          toaster.setOptions({ [name]: '' })
        }).toThrow(new RegExp(`${name} must be a non-empty string`))
        expect(() => {
          toaster.setOptions({ [name]: 8 })
        }).toThrow(TypeError)
      }
    )

    it('throws on an empty uid', () => {
      expect(() => setup({ uid: '' })).toThrow(/uid must be a non-empty string/)
    })

    it.each(['uid', 'scheduler'])(
      'refuses to change %s after creation',
      (name) => {
        const { toaster } = setup()
        const patch = { [name]: undefined } as unknown as ToasterOptions
        expect(() => {
          toaster.setOptions(patch)
        }).toThrow(new RegExp(`${name} is fixed when the toaster is created`))
      }
    )

    it('throws when a second framework declares itself the renderer', () => {
      const { toaster } = setup()
      toaster.setOptions({ renderer: 'react' })
      expect(() => {
        toaster.setOptions({ renderer: 'angular' })
      }).toThrow(/already rendered by react; the angular adapter/)
    })

    it('accepts the same renderer declared twice (a remounted adapter)', () => {
      const { toaster } = setup()
      toaster.setOptions({ renderer: 'react' })
      expect(() => {
        toaster.setOptions({ renderer: 'react' })
      }).not.toThrow()
    })

    it('checks free content against a renderer declared later', () => {
      const { toaster } = setup()
      toaster.setOptions({ renderer: 'react' })
      expect(() =>
        toaster.show({
          message: { title: 'Upload' },
          custom: { kind: 'angular', value: '<tpl>' },
        })
      ).toThrow(/rendered by react/)
    })

    describe('declined gestures — silent: no throw, the UI state is the answer', () => {
      it('ignores Escape on a toast that is not dismissible', () => {
        const { toaster } = setup()
        const id = toaster.show(message('Uploading', { dismissible: false }))
        const event = keyEvent('Escape')
        expect(toaster.handleToastKeydown(id, event)).toBe(false)
        expect(event.preventDefault).not.toHaveBeenCalled()
        expect(titles(toaster)).toEqual(['Uploading'])
      })

      it('ignores Escape on a toast that is leaving or gone', () => {
        const { toaster } = setup({ leaveDuration: 200 })
        const id = toaster.show(message('Saved'))
        toaster.dismiss(id)
        expect(toaster.handleToastKeydown(id, keyEvent('Escape'))).toBe(false)
        expect(toaster.handleToastKeydown('nope', keyEvent('Escape'))).toBe(
          false
        )
      })

      it.each([
        ['ctrlKey', { ctrlKey: true }],
        ['defaultPrevented', { defaultPrevented: true }],
      ])('leaves an Escape with %s to others', (_flag, flags) => {
        const { toaster } = setup()
        const id = toaster.show(message('Saved'))
        const event = keyEvent('Escape', flags)
        expect(toaster.handleToastKeydown(id, event)).toBe(false)
        expect(event.preventDefault).not.toHaveBeenCalled()
        expect(titles(toaster)).toEqual(['Saved'])
      })

      it('still dismisses a non-dismissible toast by code', () => {
        const { toaster } = setup()
        const id = toaster.show(message('Uploading', { dismissible: false }))
        expect(toaster.dismiss(id)).toBe(true)
        expect(titles(toaster)).toEqual([])
      })

      it('does not consume the hotkey when the stack is empty', () => {
        const { toaster, listener } = setup()
        const event = keyEvent('F8')
        expect(toaster.handleKeydown(event)).toBe(false)
        expect(event.preventDefault).not.toHaveBeenCalled()
        expect(listener).not.toHaveBeenCalled()
      })

      it('does not consume the hotkey when only leaving toasts remain', () => {
        const { toaster } = setup({ leaveDuration: 200 })
        const id = toaster.show(message('Saved'))
        toaster.dismiss(id)
        expect(toaster.handleKeydown(keyEvent('F8'))).toBe(false)
      })

      it('leaves a modified hotkey to the browser', () => {
        const { toaster } = setup()
        toaster.show(message('Saved'))
        expect(toaster.handleKeydown(keyEvent('F8', { ctrlKey: true }))).toBe(
          false
        )
        expect(toaster.getState().focusToken).toBe(0)
      })

      it('leaves a hotkey another listener consumed', () => {
        const { toaster } = setup()
        toaster.show(message('Saved'))
        const event = keyEvent('F8', { defaultPrevented: true })
        expect(toaster.handleKeydown(event)).toBe(false)
        expect(toaster.getState().focusToken).toBe(0)
      })

      it('reports a dismiss of an unknown or leaving toast as declined', () => {
        const { toaster } = setup({ leaveDuration: 200 })
        expect(toaster.dismiss('nope')).toBe(false)
        const id = toaster.show(message('Saved'))
        toaster.dismiss(id)
        expect(toaster.dismiss(id)).toBe(false)
      })
    })
  })

  describe('unmanaged errors', () => {
    it('surfaces a scheduler that throws and leaves the stack as it was', () => {
      const scheduler: ToastScheduler = {
        set: () => {
          throw new Error('timer host gone')
        },
        clear: () => undefined,
        now: () => 0,
      }
      const toaster = createToaster<string>({ uid: 'app', scheduler })
      expect(() => toaster.show(message('Saved'))).toThrow('timer host gone')
      expect(titles(toaster)).toEqual([])
    })

    it.each([
      ['a null message', { message: null }, /message must be an object/],
      ['a string message', { message: 'Saved' }, /message must be an object/],
      ['a null custom content', { custom: null }, /custom must be an object/],
      ['a null input', null, /show\(\) takes an object/],
    ])('throws a named error on %s', (_label, input, error) => {
      const { toaster } = setup()
      expect(() =>
        toaster.show(input as unknown as ToastInput<string>)
      ).toThrow(error)
      expect(titles(toaster)).toEqual([])
    })
  })

  describe('edge cases', () => {
    it('consumes the hotkey from an event without preventDefault', () => {
      const { toaster } = setup()
      toaster.show(message('Saved'))
      expect(toaster.handleKeydown({ key: 'F8' })).toBe(true)
      expect(toaster.getState().focusToken).toBe(1)
    })
    it('returns the same snapshot reference until something changes', () => {
      const { toaster } = setup()
      const before = toaster.getState()
      expect(toaster.getState()).toBe(before)
      toaster.show(message('a'))
      expect(toaster.getState()).not.toBe(before)
    })

    it('keeps an option passed as undefined', () => {
      const { toaster } = setup({ max: 2, position: 'top-end' })
      toaster.setOptions({ max: undefined, position: undefined })
      for (const t of ['t1', 't2', 't3']) toaster.show(message(t))
      expect(titles(toaster)).toEqual(['t2', 't3'])
      expect(toaster.getState().position).toBe('top-end')
    })

    it('does not notify on a setOptions that changes nothing', () => {
      const { toaster, listener } = setup({ position: 'top-end' })
      toaster.setOptions({ position: 'top-end' })
      expect(listener).not.toHaveBeenCalled()
    })

    it('does not notify on a repeated pause, nor on releasing a reason never given', () => {
      const { toaster, listener } = setup()
      toaster.pause('pointer')
      listener.mockClear()
      toaster.pause('pointer')
      toaster.resume('focus')
      expect(listener).not.toHaveBeenCalled()
    })

    it('pauses an empty stack, and runs a toast shown after the resume', () => {
      const { toaster, tick } = setup()
      toaster.pause('pointer')
      toaster.resume('pointer')
      toaster.show(message('Saved'))
      tick(5000)
      expect(titles(toaster)).toEqual([])
    })

    it('does nothing on dismissAll of an empty stack', () => {
      const { toaster, listener } = setup()
      toaster.dismissAll()
      expect(listener).not.toHaveBeenCalled()
    })

    it('notifies once when a sixth toast evicts the oldest', () => {
      const { toaster, listener } = setup()
      for (const t of ['t1', 't2', 't3', 't4', 't5']) toaster.show(message(t))
      listener.mockClear()
      toaster.show(message('t6'))
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('starts a new toast at the top when its id belongs to a leaving one', () => {
      const { toaster } = setup({ leaveDuration: 200, position: 'top-end' })
      toaster.show(message('old', { id: 'save' }))
      toaster.show(message('other'))
      toaster.dismiss('save')
      toaster.show(message('new', { id: 'save' }))
      expect(
        toaster.getState().toasts.map((t) => [t.message?.title, t.phase])
      ).toEqual([
        ['other', 'visible'],
        ['new', 'visible'],
      ])
    })

    it('gives distinct DOM ids to ids that read the same once made safe', () => {
      const { toaster } = setup()
      toaster.show(message('a', { id: 'a b' }))
      toaster.show(message('b', { id: 'a-b' }))
      const [first, second] = toaster.getState().toasts
      expect(first.domId).not.toBe(second.domId)
    })

    it('makes a DOM-safe id from a uid with spaces and symbols', () => {
      const { toaster } = setup({ uid: ':r1: ç' })
      toaster.show(message('a'))
      expect(toaster.getState().toasts[0]?.domId).toMatch(/^[\w-]+$/)
    })

    it('empties the stack on destroy and stays usable', () => {
      const { toaster, listener, pending } = setup()
      toaster.show(message('a'))
      toaster.destroy()
      expect(pending()).toBe(0)
      expect(titles(toaster)).toEqual([])
      listener.mockClear()
      const again = vi.fn()
      toaster.subscribe(again)
      toaster.show(message('b'))
      expect(listener).not.toHaveBeenCalled()
      expect(again).toHaveBeenCalledTimes(1)
    })
  })
})
