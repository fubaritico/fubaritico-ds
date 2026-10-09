import { describe, expect, it, vi } from 'vitest'

import { createPopoverService } from './popover-service.js'

import type { PopoverOptions } from './types.js'

/** A service with a spy on `onOpenChange`. */
function setup(options: Partial<PopoverOptions> = {}) {
  const onOpenChange = vi.fn<(open: boolean) => void>()
  const service = createPopoverService({ uid: 'p', onOpenChange, ...options })
  return { service, onOpenChange }
}

describe('PopoverService', () => {
  describe('happy path', () => {
    it('opens and closes, reporting each change', () => {
      const { service, onOpenChange } = setup()
      expect(service.getState().open).toBe(false)
      expect(service.setOpen(true)).toBe(true)
      expect(service.getState().open).toBe(true)
      service.setOpen(false)
      expect(service.getState().open).toBe(false)
      expect(onOpenChange.mock.calls).toEqual([[true], [false]])
    })

    it('ties the trigger to the surface (popovertarget, aria-controls, aria-expanded)', () => {
      const { service } = setup({ label: 'Pick a colour' })
      expect(service.triggerAttrs()).toEqual({
        type: 'button',
        popovertarget: 'p-popover',
        'aria-haspopup': 'dialog',
        'aria-expanded': 'false',
        'aria-controls': 'p-popover',
      })
      expect(service.contentAttrs()).toEqual({
        id: 'p-popover',
        popover: 'auto',
        role: 'dialog',
        'aria-label': 'Pick a colour',
        tabindex: -1,
      })
      service.setOpen(true)
      expect(service.triggerAttrs()['aria-expanded']).toBe('true')
    })
  })

  describe('variants', () => {
    it('starts open with defaultOpen', () => {
      expect(setup({ defaultOpen: true }).service.getState().open).toBe(true)
    })

    it('in controlled mode emits the intent but keeps the parent value', () => {
      const { service, onOpenChange } = setup({ open: false })
      service.setOpen(true)
      expect(onOpenChange).toHaveBeenCalledWith(true)
      expect(service.getState().open).toBe(false)
      service.setOptions({ open: true })
      expect(service.getState().open).toBe(true)
    })

    it('follows what the browser did on its own (Escape, click outside)', () => {
      const { service, onOpenChange } = setup({ defaultOpen: true })
      service.syncFromToggle('closed')
      expect(service.getState().open).toBe(false)
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('tells the adapter to revert a native toggle a controlled parent refused', () => {
      const { service } = setup({ open: false })
      service.syncFromToggle('open')
      expect(service.reconcileToggle('open')).toBe('closed')
      expect(
        setup({ defaultOpen: false }).service.reconcileToggle('closed')
      ).toBeNull()
    })

    it('names the focus target selector for every adapter', () => {
      const { service } = setup()
      expect(service.initialFocusSelector()).toContain('input:not([disabled])')
    })

    it('switches to uncontrolled when open is passed as undefined', () => {
      const { service } = setup({ open: true })
      service.setOptions({ open: undefined })
      service.setOpen(false)
      expect(service.getState().open).toBe(false)
    })
  })

  describe('managed errors', () => {
    it('reports nothing when asked for the state it already has', () => {
      const { service, onOpenChange } = setup()
      expect(service.setOpen(false)).toBe(false)
      service.syncFromToggle('closed')
      expect(onOpenChange).not.toHaveBeenCalled()
    })
  })

  describe('unmanaged errors', () => {
    it('slugs a uid unsafe in an id or a CSS ident', () => {
      const { service } = setup({ uid: '«r0» x' })
      expect(service.contentId()).toBe('-r0--x-popover')
      expect(service.anchorName()).toBe('--ui-popover--r0--x')
    })
  })

  describe('edge cases', () => {
    it('notifies when the label or uid changes, not for a new callback', () => {
      const { service } = setup({ label: 'A' })
      const listener = vi.fn()
      service.subscribe(listener)
      service.setOptions({ onOpenChange: () => undefined, label: 'A' })
      expect(listener).not.toHaveBeenCalled()
      service.setOptions({ label: 'B' })
      service.setOptions({ uid: 'q' })
      expect(listener).toHaveBeenCalledTimes(2)
      expect(service.contentAttrs()['aria-label']).toBe('B')
    })

    it('keeps working after destroy', () => {
      const { service } = setup()
      const listener = vi.fn()
      service.subscribe(listener)
      service.destroy()
      service.setOpen(true)
      expect(listener).not.toHaveBeenCalled()
      expect(service.getState().open).toBe(true)
    })
  })
})
