import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode, createRef } from 'react'
import { describe, expect, it } from 'vitest'

import {
  TOASTER_DEFAULTS,
  TOAST_ANNOUNCEMENT_LIFETIME,
  TOAST_POSITIONS,
  createToaster,
} from '@fubaritico/behaviors'

import { Alert } from '../Alert'

import { createToastApi } from './toast'
import { Toaster } from './Toaster'

import type { ReactToastContent, ToasterProps } from './Toast.types'
import type { ToastScheduler } from '@fubaritico/behaviors'

/** A scheduler driven by hand: `tick(ms)` advances the clock and runs what is due. */
function manualScheduler() {
  let now = 0
  let nextId = 0
  const timers = new Map<number, { at: number; callback: () => void }>()
  const scheduler: ToastScheduler = {
    set: (callback, delay) => {
      nextId++
      timers.set(nextId, { at: now + delay, callback })
      return nextId
    },
    clear: (handle) => {
      timers.delete(handle as number)
    },
    now: () => now,
  }
  const tick = (ms: number) => {
    now += ms
    for (const [id, timer] of [...timers].sort((a, b) => a[1].at - b[1].at)) {
      if (timer.at <= now && timers.has(id)) {
        timers.delete(id)
        timer.callback()
      }
    }
  }
  return { scheduler, tick }
}

/**
 * A Toaster on an injected toaster of its own, on a manual clock, its exit instant.
 *
 * @param props - Toaster props.
 * @returns The toaster, the toast API bound to it, `tick` and `run` (both inside `act`).
 */
function setup(props: Partial<ToasterProps> = {}) {
  const clock = manualScheduler()
  const toaster = createToaster<ReactToastContent>({
    uid: 'test',
    scheduler: clock.scheduler,
    leaveDuration: 0,
  })
  const toast = createToastApi(() => toaster)
  const view = render(<Toaster toaster={toaster} {...props} />)
  return {
    toaster,
    toast,
    view,
    tick: (ms: number) => {
      act(() => {
        clock.tick(ms)
      })
    },
    /**
     * Runs a toast call inside `act`.
     *
     * @param call - What to run.
     */
    run: (call: () => unknown) => {
      act(() => {
        call()
      })
    },
  }
}

const region = () =>
  screen.getByRole('region', {
    name: `${TOASTER_DEFAULTS.label} (${TOASTER_DEFAULTS.hotkey})`,
  })

/**
 * The live region of a politeness.
 *
 * @param politeness - `'polite'` or `'assertive'`.
 * @returns Its element.
 */
const liveRegion = (politeness: 'polite' | 'assertive') => {
  const found = region().querySelector(`[aria-live="${politeness}"]`)
  if (!found) throw new Error(`no ${politeness} live region`)
  return found
}

describe('Toaster', () => {
  describe('happy path', () => {
    it('renders the stack as a popover landmark named after its hotkey', () => {
      setup()
      expect(region()).toHaveAttribute('popover', 'manual')
    })

    it('shows a toast with its title and description', () => {
      const { toast, run } = setup()
      run(() => toast('Saved', { description: 'Your changes are stored.' }))
      expect(screen.getByRole('listitem')).toHaveTextContent(
        'SavedYour changes are stored.'
      )
    })

    it('names a toast by its title', () => {
      const { toast, run } = setup()
      run(() => toast('Saved'))
      expect(
        screen.getByRole('listitem', { name: 'Saved' })
      ).toBeInTheDocument()
    })

    it('names the close button after its toast', () => {
      const { toast, run } = setup()
      run(() => toast('Saved'))
      expect(
        screen.getByRole('button', {
          name: `${TOASTER_DEFAULTS.closeLabel} Saved`,
        })
      ).toBeInTheDocument()
    })

    it('closes a toast with its close button', async () => {
      const user = userEvent.setup()
      const { toast, run } = setup()
      run(() => toast('Saved'))
      await user.click(screen.getByRole('button', { name: /Close/ }))
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    })

    it('removes a toast once its time is over', () => {
      const { toast, run, tick } = setup()
      run(() => toast('Saved'))
      tick(TOASTER_DEFAULTS.duration)
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    })

    it('closes the focused toast on Escape', async () => {
      const user = userEvent.setup()
      const { toast, run } = setup()
      run(() => toast('Saved'))
      screen.getByRole('listitem').focus()
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    })

    it('moves focus into the stack on F8', async () => {
      const user = userEvent.setup()
      const { toast, run } = setup()
      run(() => toast('Saved'))
      await user.keyboard('{F8}')
      expect(region()).toHaveFocus()
    })

    it('announces a toast in the polite region', async () => {
      const { toast, run } = setup()
      run(() => toast('Saved'))
      await waitFor(() => {
        expect(liveRegion('polite')).toHaveTextContent('Saved')
      })
    })

    it('dismisses a toast by its id', () => {
      const { toast, run } = setup()
      let id = ''
      run(() => {
        id = toast('Saved', { duration: Infinity })
      })
      run(() => toast.dismiss(id))
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    })
    it('holds the timers while the pointer is on the stack', async () => {
      const user = userEvent.setup()
      const { toast, run, tick } = setup()
      run(() => toast('Saved'))
      await user.hover(region())
      tick(TOASTER_DEFAULTS.duration * 2)
      expect(screen.getByRole('listitem')).toBeInTheDocument()
    })

    it('runs the timers again once the pointer leaves', async () => {
      const user = userEvent.setup()
      const { toast, run, tick } = setup()
      run(() => toast('Saved'))
      await user.hover(region())
      await user.unhover(region())
      tick(TOASTER_DEFAULTS.duration)
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    })

    it('holds the timers while focus is in the stack', () => {
      const { toast, run, tick } = setup()
      run(() => toast('Saved'))
      act(() => {
        screen.getByRole('listitem').focus()
      })
      tick(TOASTER_DEFAULTS.duration * 2)
      expect(screen.getByRole('listitem')).toBeInTheDocument()
    })

    it('dismisses every toast at once', () => {
      const { toast, run } = setup()
      run(() => toast('a'))
      run(() => toast('b'))
      run(() => {
        toast.dismissAll()
      })
      expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    })
  })

  describe('variants', () => {
    it.each(['success', 'warning', 'error'] as const)(
      'renders a %s toast with its modifier',
      (variant) => {
        const { toast, run } = setup()
        run(() => toast[variant]('Done'))
        expect(screen.getByRole('listitem')).toHaveClass(`ui-toast--${variant}`)
      }
    )

    it.each(['info', 'success', 'warning', 'error'] as const)(
      'renders a %s toast with its glyph',
      (variant) => {
        const { toast, run } = setup()
        run(() => toast[variant]('Done'))
        expect(
          screen.getByRole('listitem').querySelector('.ui-toast__icon svg')
        ).not.toBeNull()
      }
    )

    it('renders an info toast with the base look', () => {
      const { toast, run } = setup()
      run(() => toast.info('Heads up'))
      expect(screen.getByRole('listitem').className).not.toMatch(/ui-toast--/)
    })

    it('renders a neutral toast without a glyph', () => {
      const { toast, run } = setup()
      run(() => toast('Saved'))
      expect(
        screen.getByRole('listitem').querySelector('.ui-toast__icon')
      ).toBeNull()
    })

    it('renders the glyph a toast names', () => {
      const { toast, run } = setup()
      run(() => toast('Uploaded', { icon: 'Check' }))
      expect(
        screen.getByRole('listitem').querySelector('.ui-toast__icon svg')
      ).not.toBeNull()
    })

    it.each(TOAST_POSITIONS)('sits at %s', (position) => {
      setup({ position })
      expect(region()).toHaveClass(`ui-toaster--${position}`)
    })

    it('renders free content in place of the message', () => {
      const { toast, run } = setup()
      run(() => toast.custom(<strong>Custom</strong>, { label: 'Custom' }))
      expect(screen.getByText('Custom').tagName).toBe('STRONG')
    })

    it('names free content by its label', () => {
      const { toast, run } = setup()
      run(() => toast.custom(<strong>3 files</strong>, { label: 'Upload' }))
      expect(
        screen.getByRole('listitem', { name: 'Upload' })
      ).toBeInTheDocument()
    })

    it('renders free content in a bare shell on request', () => {
      const { toast, run } = setup()
      run(() =>
        toast.custom(<Alert title="Saved">Stored</Alert>, {
          bare: true,
          label: 'Saved',
        })
      )
      expect(screen.getByRole('listitem')).toHaveClass('ui-toast--bare')
    })

    it('takes the live role off an Alert shown as a toast', () => {
      const { toast, run } = setup()
      run(() => toast.custom(<Alert variant="error" title="Failed" />, { label: 'Failed' }))
      expect(screen.getByText('Failed').closest('.ui-alert')).toHaveAttribute(
        'role',
        'none'
      )
    })

    it('keeps the role an Alert was given', () => {
      const { toast, run } = setup()
      run(() => toast.custom(<Alert role="note" title="Note" />, { label: 'Note' }))
      expect(screen.getByText('Note').closest('.ui-alert')).toHaveAttribute(
        'role',
        'note'
      )
    })

    it('has no close button when not dismissible', () => {
      const { toast, run } = setup()
      run(() => toast('Uploading', { dismissible: false }))
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('names the stack in another language', () => {
      setup({ label: 'Alertes' })
      expect(
        screen.getByRole('region', { name: 'Alertes (F8)' })
      ).toBeInTheDocument()
    })

    it('names the close buttons in another language', () => {
      const { toast, run } = setup({ closeLabel: 'Fermer' })
      run(() => toast('Enregistré'))
      expect(
        screen.getByRole('button', { name: 'Fermer Enregistré' })
      ).toBeInTheDocument()
    })

    it('announces an urgent toast in the assertive region', async () => {
      const { toast, run } = setup()
      run(() => toast.error('Offline', { urgent: true }))
      await waitFor(() => {
        expect(liveRegion('assertive')).toHaveTextContent('Offline')
      })
    })

    it('keeps an urgent toast until it is dismissed', () => {
      const { toast, run, tick } = setup()
      run(() => toast.error('Offline', { urgent: true }))
      tick(TOASTER_DEFAULTS.duration * 10)
      expect(screen.getByRole('listitem')).toBeInTheDocument()
    })

  })

  describe('managed errors', () => {
    it('refuses another framework content in the caller', () => {
      const { toaster } = setup()
      expect(() => {
        toaster.show({
          custom: { kind: 'angular', value: { node: null, bare: false } },
        })
      }).toThrow(/rendered by react/)
    })

    it('refuses an icon the set does not hold in the caller', () => {
      const { toaster } = setup()
      expect(() => {
        toaster.show({ message: { title: 'x', icon: 'Unicorn' } })
      }).toThrow(/"Unicorn" is not an icon this page's stack renders/)
    })

    it('throws when a second Toaster renders the same stack (one in a remote)', () => {
      const toaster = createToaster<ReactToastContent>({ uid: 'twice' })
      const original = console.error
      console.error = () => undefined
      try {
        expect(() =>
          render(
            <>
              <Toaster toaster={toaster} />
              <Toaster toaster={toaster} />
            </>
          )
        ).toThrow(/already has a Toaster — mount it once, in the host/)
      } finally {
        console.error = original
      }
    })

    it('lets a Toaster mount again once the first unmounted', () => {
      const toaster = createToaster<ReactToastContent>({ uid: 'again' })
      const first = render(<Toaster toaster={toaster} />)
      first.unmount()
      expect(() => render(<Toaster toaster={toaster} />)).not.toThrow()
    })

    it('leaves the stack unfocused when the hotkey comes with a modifier', async () => {
      const user = userEvent.setup()
      const { toast, run } = setup()
      run(() => toast('Saved'))
      await user.keyboard('{Control>}{F8}{/Control}')
      expect(region()).not.toHaveFocus()
    })
  })

  describe('unmanaged errors', () => {
    it('stays in place where a modal dialog cannot be told (jsdom has no :modal)', () => {
      render(<dialog open>An open dialog</dialog>)
      setup()
      expect(region().closest('dialog')).toBeNull()
    })

    it('surfaces a free content that throws, instead of hiding it', () => {
      /** A node that cannot render. */
      function Broken(): never {
        throw new Error('broken content')
      }
      const { toast } = setup()
      const original = console.error
      console.error = () => undefined
      try {
        expect(() => {
          act(() => {
            toast.custom(<Broken />, { label: 'Broken' })
          })
        }).toThrow('broken content')
      } finally {
        console.error = original
      }
    })
  })

  describe('edge cases', () => {
    it('renders one stack under StrictMode', () => {
      const toaster = createToaster<ReactToastContent>({ uid: 'strict' })
      render(
        <StrictMode>
          <Toaster toaster={toaster} />
        </StrictMode>
      )
      expect(screen.getAllByRole('region')).toHaveLength(1)
    })

    it('announces a toast already in the stack when it mounts under StrictMode', async () => {
      const toaster = createToaster<ReactToastContent>({ uid: 'strict' })
      toaster.show({ message: { title: 'Before' }, duration: Infinity })
      render(
        <StrictMode>
          <Toaster toaster={toaster} />
        </StrictMode>
      )
      await waitFor(() => {
        expect(liveRegion('polite')).toHaveTextContent('Before')
      })
    })

    it('reads both of two toasts shown in a row', async () => {
      const { toast, run } = setup()
      run(() => toast('Saved'))
      run(() => toast('Synced'))
      await waitFor(() => {
        expect(liveRegion('polite')).toHaveTextContent('Saved. Synced')
      })
    })

    it('empties the live region once the announcement lifetime is over', async () => {
      const { toast, run, tick } = setup()
      run(() => toast('Saved', { duration: Infinity }))
      await waitFor(() => {
        expect(liveRegion('polite')).toHaveTextContent('Saved')
      })
      tick(TOAST_ANNOUNCEMENT_LIFETIME)
      expect(liveRegion('polite')).toBeEmptyDOMElement()
    })

    it('shows at most max toasts, the next evicting the oldest', () => {
      const { toast, run } = setup({ position: 'top-end' })
      const titles = Array.from(
        { length: TOASTER_DEFAULTS.max + 1 },
        (_, i) => `t${String(i + 1)}`
      )
      for (const title of titles) run(() => toast(title))
      expect(
        screen.getAllByRole('listitem').map((item) => item.textContent)
      ).toEqual(titles.slice(1))
    })

    it('hands focus to the stack when the focused toast is removed at once', async () => {
      const user = userEvent.setup()
      const { toast, run } = setup()
      run(() => toast('Saved'))
      screen.getByRole('listitem').focus()
      await user.keyboard('{Escape}')
      expect(region()).toHaveFocus()
    })

    it('gives the consumer ref the stack node', () => {
      const ref = createRef<HTMLElement>()
      setup({ ref })
      expect(ref.current).toBe(region())
    })
  })
})
