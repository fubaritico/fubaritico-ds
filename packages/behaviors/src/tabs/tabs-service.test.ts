import { describe, expect, it, vi } from 'vitest'

import { createTabsService } from './tabs-service.js'

import type { TabsOptions } from './types.js'

/** A service with the three tabs `a`, `b`, `c` registered. */
function setup(
  options: Partial<TabsOptions> = {},
  ids: string[] = ['a', 'b', 'c']
) {
  const service = createTabsService({ uid: 't', ...options })
  const unregister = Object.fromEntries(
    ids.map((id) => [id, service.register({ id })])
  )
  return { service, unregister }
}

/** A minimal keyboard event recording whether it was consumed. */
function key(name: string) {
  return { key: name, preventDefault: vi.fn() }
}

describe('TabsService', () => {
  describe('happy path', () => {
    it('selects the default tab and exposes it in the snapshot', () => {
      const { service } = setup({ defaultActiveId: 'b' })
      const state = service.getState()
      expect(state.activeId).toBe('b')
      expect(state.tabs.map((t) => [t.id, t.active])).toEqual([
        ['a', false],
        ['b', true],
        ['c', false],
      ])
    })

    it('selects on setActive and reports the change', () => {
      const onActiveChange = vi.fn()
      const { service } = setup({ defaultActiveId: 'a', onActiveChange })
      expect(service.setActive('c')).toBe(true)
      expect(service.getState().activeId).toBe('c')
      expect(onActiveChange).toHaveBeenCalledWith('c', 'a')
    })

    it('notifies subscribers with a new snapshot, and stops after unsubscribe', () => {
      const { service } = setup({ defaultActiveId: 'a' })
      const listener = vi.fn()
      const off = service.subscribe(listener)
      service.setActive('b')
      expect(listener).toHaveBeenCalledWith(service.getState())
      off()
      service.setActive('c')
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('links trigger and panel through deterministic ids', () => {
      const { service } = setup({ defaultActiveId: 'a' })
      expect(service.triggerAttrs('a')).toMatchObject({
        id: 'tab-t-a',
        role: 'tab',
        'aria-controls': 'tabpanel-t-a',
        'aria-selected': 'true',
        tabindex: 0,
      })
      expect(service.panelAttrs('a')).toMatchObject({
        id: 'tabpanel-t-a',
        role: 'tabpanel',
        'aria-labelledby': 'tab-t-a',
        hidden: undefined,
      })
    })
  })

  describe('variants', () => {
    it('moves focus and selection with the arrow keys (automatic)', () => {
      const { service } = setup({ defaultActiveId: 'a' })
      const event = key('ArrowRight')
      expect(service.handleKeydown(event)).toBe(true)
      expect(event.preventDefault).toHaveBeenCalled()
      expect(service.getState()).toMatchObject({
        activeId: 'b',
        focusedId: 'b',
        focusToken: 1,
      })
    })

    it('only moves focus in manual activation, Enter selects', () => {
      const { service } = setup({ defaultActiveId: 'a', activation: 'manual' })
      service.handleKeydown(key('ArrowRight'))
      expect(service.getState()).toMatchObject({
        activeId: 'a',
        focusedId: 'b',
      })
      expect(service.triggerAttrs('b').tabindex).toBe(0)
      expect(service.triggerAttrs('a').tabindex).toBe(-1)
      service.handleKeydown(key('Enter'))
      expect(service.getState().activeId).toBe('b')
    })

    it('lets Enter / Space through in automatic mode (the native click selects)', () => {
      const { service } = setup({ defaultActiveId: 'a' })
      const event = key('Enter')
      expect(service.handleKeydown(event)).toBe(false)
      expect(event.preventDefault).not.toHaveBeenCalled()
    })

    it('jumps to the ends with Home / End', () => {
      const { service } = setup({ defaultActiveId: 'b' })
      service.handleKeydown(key('End'))
      expect(service.getState().activeId).toBe('c')
      service.handleKeydown(key('Home'))
      expect(service.getState().activeId).toBe('a')
    })

    it('wraps by default and sticks to the edge without loop', () => {
      const looping = setup({ defaultActiveId: 'c' }).service
      looping.handleKeydown(key('ArrowRight'))
      expect(looping.getState().activeId).toBe('a')

      const clamped = setup({ defaultActiveId: 'c', loop: false }).service
      clamped.handleKeydown(key('ArrowRight'))
      expect(clamped.getState().activeId).toBe('c')
    })

    it('swaps the horizontal arrows in rtl', () => {
      const { service } = setup({ defaultActiveId: 'a', dir: 'rtl' })
      service.handleKeydown(key('ArrowLeft'))
      expect(service.getState().activeId).toBe('b')
      service.handleKeydown(key('ArrowRight'))
      expect(service.getState().activeId).toBe('a')
    })

    it('hides inactive panels with presence semantics, and lets a panel opt out of focus', () => {
      const { service } = setup({ defaultActiveId: 'a' })
      expect(service.panelAttrs('b').hidden).toBe('')
      expect(service.panelAttrs('a').hidden).toBeUndefined()
      expect(service.panelAttrs('a').tabindex).toBe(0)
      expect(
        service.panelAttrs('a', { focusable: false }).tabindex
      ).toBeUndefined()
    })

    it('makes the selected tab the tab stop again after resetFocus (manual activation)', () => {
      const { service } = setup({ defaultActiveId: 'a', activation: 'manual' })
      service.handleKeydown(key('ArrowRight'))
      expect(service.triggerAttrs('b').tabindex).toBe(0)
      service.resetFocus()
      expect(service.triggerAttrs('a').tabindex).toBe(0)
      expect(service.triggerAttrs('b').tabindex).toBe(-1)
    })

    it('follows the vertical axis', () => {
      const { service } = setup({
        defaultActiveId: 'a',
        orientation: 'vertical',
      })
      expect(service.handleKeydown(key('ArrowRight'))).toBe(false)
      service.handleKeydown(key('ArrowDown'))
      expect(service.getState().activeId).toBe('b')
      expect(service.listAttrs()).toEqual({
        role: 'tablist',
        'aria-orientation': 'vertical',
      })
    })

    it('in controlled mode emits the intent but keeps the parent value', () => {
      const onActiveChange = vi.fn()
      const { service } = setup({ activeId: 'a', onActiveChange })
      service.setActive('b')
      expect(onActiveChange).toHaveBeenCalledWith('b', 'a')
      expect(service.getState().activeId).toBe('a')
      service.setOptions({ activeId: 'b' })
      expect(service.getState().activeId).toBe('b')
    })

    it('switches from controlled to uncontrolled when activeId is passed as undefined', () => {
      const { service } = setup({ activeId: 'a' })
      service.setOptions({ activeId: undefined })
      service.setActive('c')
      expect(service.getState().activeId).toBe('c')
    })

    it.each([
      ['neighbor', 'c'],
      ['first', 'a'],
      ['none', null],
    ] as const)(
      'replaces a removed active tab with removalPolicy %s',
      (removalPolicy, expected) => {
        const onActiveChange = vi.fn()
        const { service, unregister } = setup({
          defaultActiveId: 'b',
          removalPolicy,
          onActiveChange,
        })
        unregister.b()
        expect(service.getState().activeId).toBe(expected)
        expect(onActiveChange).toHaveBeenCalledWith(expected, 'b')
      }
    )

    it('falls back to the previous tab when the last one is removed', () => {
      const { service, unregister } = setup({ defaultActiveId: 'c' })
      unregister.c()
      expect(service.getState().activeId).toBe('b')
    })

    it('updates a tab in place, keeping its position', () => {
      const { service } = setup({ defaultActiveId: 'a' })
      service.update('b', { disabled: true })
      expect(service.getState().tabs.map((t) => [t.id, t.disabled])).toEqual([
        ['a', undefined],
        ['b', true],
        ['c', undefined],
      ])
      service.handleKeydown(key('ArrowRight'))
      expect(service.getState().activeId).toBe('c')
    })

    it('forgets the roving focus when the focused tab is removed', () => {
      const { service, unregister } = setup({
        defaultActiveId: 'a',
        activation: 'manual',
      })
      service.handleKeydown(key('ArrowRight'))
      expect(service.getState().focusedId).toBe('b')
      unregister.b()
      expect(service.getState().focusedId).toBeNull()
    })

    it('in controlled mode, never picks a replacement for a removed active tab', () => {
      const onActiveChange = vi.fn()
      const { service, unregister } = setup({ activeId: 'b', onActiveChange })
      unregister.b()
      expect(service.getState().activeId).toBeNull()
      expect(onActiveChange).not.toHaveBeenCalled()
    })

    it('enters from the edge when nothing is selected or focused', () => {
      const forward = setup({ defaultActiveId: 'a' }).service
      forward.setActive(null)
      forward.handleKeydown(key('ArrowRight'))
      expect(forward.getState().activeId).toBe('a')

      const backward = setup({ defaultActiveId: 'a' }).service
      backward.setActive(null)
      backward.handleKeydown(key('ArrowLeft'))
      expect(backward.getState().activeId).toBe('c')
    })

    it('honours explicit order over registration order', () => {
      const service = createTabsService({ uid: 't' })
      service.register({ id: 'late', order: 0 })
      service.register({ id: 'early', order: 1 })
      expect(service.getState().tabs.map((t) => t.id)).toEqual([
        'late',
        'early',
      ])
    })

    it('batches several mutations into one notification', () => {
      const service = createTabsService({ uid: 't' })
      const listener = vi.fn()
      service.subscribe(listener)
      service.batch(() => {
        service.register({ id: 'a' })
        service.register({ id: 'b' })
      })
      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('managed errors', () => {
    it('refuses to select an unknown or disabled tab', () => {
      const service = createTabsService({ uid: 't', defaultActiveId: 'a' })
      service.register({ id: 'a' })
      service.register({ id: 'b', disabled: true })
      expect(service.setActive('zzz')).toBe(false)
      expect(service.setActive('b')).toBe(false)
      expect(service.getState().activeId).toBe('a')
    })

    it('skips disabled tabs when navigating', () => {
      const service = createTabsService({ uid: 't', defaultActiveId: 'a' })
      service.register({ id: 'a' })
      service.register({ id: 'b', disabled: true })
      service.register({ id: 'c' })
      service.handleKeydown(key('ArrowRight'))
      expect(service.getState().activeId).toBe('c')
      expect(service.triggerAttrs('b')['aria-disabled']).toBe('true')
    })

    it('warns on a duplicate id and keeps the original position', () => {
      const onWarn = vi.fn()
      const { service } = setup({ onWarn })
      service.register({ id: 'a', disabled: true })
      expect(onWarn).toHaveBeenCalledWith(
        expect.stringContaining('duplicate tab id')
      )
      expect(service.getState().tabs.map((t) => t.id)).toEqual(['a', 'b', 'c'])
    })

    it.each(['altKey', 'ctrlKey', 'metaKey'] as const)(
      'leaves a %s-modified arrow to the browser',
      (modifier) => {
        const { service } = setup({ defaultActiveId: 'a' })
        const event = { ...key('ArrowRight'), [modifier]: true }
        expect(service.handleKeydown(event)).toBe(false)
        expect(event.preventDefault).not.toHaveBeenCalled()
        expect(service.getState().activeId).toBe('a')
      }
    )

    it('ignores an unknown key without consuming it', () => {
      const { service } = setup()
      const event = key('x')
      expect(service.handleKeydown(event)).toBe(false)
      expect(event.preventDefault).not.toHaveBeenCalled()
    })
  })

  describe('unmanaged errors', () => {
    it('selects nothing for a controlled id that is not registered', () => {
      const { service } = setup({ activeId: 'ghost' })
      expect(service.getState().activeId).toBeNull()
    })

    it('ignores update / unregister on an unknown id', () => {
      const { service } = setup({ defaultActiveId: 'a' })
      const before = service.getState()
      service.update('ghost', { disabled: true })
      service.unregister('ghost')
      expect(service.getState()).toBe(before)
    })

    it('keeps working after destroy (StrictMode remount)', () => {
      const { service } = setup({ defaultActiveId: 'a' })
      service.destroy()
      service.register({ id: 'x' })
      expect(service.getState().tabs.map((t) => t.id)).toEqual(['x'])
    })
  })

  describe('edge cases', () => {
    it('reports the intended selection before any tab registers (server / first render)', () => {
      const service = createTabsService({ uid: 't', defaultActiveId: 'b' })
      expect(service.getState()).toMatchObject({
        activeId: 'b',
        initialized: false,
      })
      expect(service.panelAttrs('b').hidden).toBeUndefined()
      expect(service.triggerAttrs('b').tabindex).toBe(0)
    })

    it('selects the first tab provisionally, then hands over to a late default — silently', () => {
      const onActiveChange = vi.fn()
      const service = createTabsService({
        uid: 't',
        defaultActiveId: 'late',
        onActiveChange,
      })
      service.register({ id: 'a' })
      expect(service.getState().activeId).toBe('a')
      service.register({ id: 'late' })
      expect(service.getState().activeId).toBe('late')
      expect(onActiveChange).not.toHaveBeenCalled()
    })

    it('does not let a late default override a user choice', () => {
      const service = createTabsService({ uid: 't', defaultActiveId: 'late' })
      service.register({ id: 'a' })
      service.register({ id: 'b' })
      service.setActive('b')
      service.register({ id: 'late' })
      expect(service.getState().activeId).toBe('b')
    })

    it('keeps an explicitly cleared selection empty', () => {
      const { service } = setup({ defaultActiveId: 'a' })
      service.setActive(null)
      service.register({ id: 'd' })
      expect(service.getState().activeId).toBeNull()
    })

    it('returns the same snapshot reference until something changes', () => {
      const { service } = setup({ defaultActiveId: 'a' })
      expect(service.getState()).toBe(service.getState())
    })

    it('does not notify when setOptions changes nothing the views read', () => {
      const { service } = setup({ defaultActiveId: 'a' })
      const listener = vi.fn()
      service.subscribe(listener)
      service.setOptions({ onActiveChange: () => undefined, loop: false })
      expect(listener).not.toHaveBeenCalled()
    })

    it('notifies when the uid changes, since every id derives from it', () => {
      const { service } = setup()
      const listener = vi.fn()
      service.subscribe(listener)
      service.setOptions({ uid: 'other' })
      expect(listener).toHaveBeenCalledTimes(1)
      expect(service.triggerId('a')).toBe('tab-other-a')
    })

    it('emits only strings and numbers, so no adapter writes the string "false"', () => {
      const { service } = setup({ defaultActiveId: 'a' })
      const all = [
        service.listAttrs(),
        service.triggerAttrs('b'),
        service.panelAttrs('b'),
      ]
      for (const attrs of all) {
        for (const value of Object.values(attrs)) {
          expect(['string', 'number', 'undefined']).toContain(typeof value)
        }
      }
    })

    it('resetFocus is a no-op without a roving focus', () => {
      const { service } = setup({ defaultActiveId: 'a' })
      const listener = vi.fn()
      service.subscribe(listener)
      service.resetFocus()
      expect(listener).not.toHaveBeenCalled()
    })

    it('slugs ids that are unsafe in an HTML id attribute', () => {
      const service = createTabsService({ uid: '«r0»' })
      expect(service.triggerId('a b/c')).toBe('tab--r0--a-b-c')
    })

    it('ignores keyboard input when no tab is enabled', () => {
      const service = createTabsService({ uid: 't' })
      service.register({ id: 'a', disabled: true })
      service.handleKeydown(key('ArrowRight'))
      expect(service.getState()).toMatchObject({
        activeId: null,
        focusToken: 0,
      })
    })
  })
})
