import clsx from 'clsx'
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { createPortal } from 'react-dom'

import { TOASTER_DEFAULTS, getGlobalToaster } from '@fubaritico/behaviors'
import {
  TOASTER_ANNOUNCER_CLASS,
  TOASTER_LIST_CLASS,
  toasterVariants,
} from '@fubaritico/variants'

import { useMergedRef } from '../../hooks'
import { toReactAttributes } from '../../utils'
import { ICON_NAMES } from '../Icon'

import { REACT_KIND } from './constants'
import { ToastItem } from './ToastItem'
import { useToastAnnouncer } from './useToastAnnouncer'
import { usePageVisibilityPause, useToasterHotkey } from './useToasterDocument'
import { useHotkeyFocus, useStackMove, useStackPause } from './useToasterFocus'
import { useTopModalDialog } from './useTopModalDialog'

import type { ReactToastContent, ToasterProps } from './Toast.types'

/**
 * Toaster — the page's one stack of toasts: a `popover="manual"` landmark in the top layer, named
 * after its hotkey (F8 moves focus into it), with a polite and an assertive live region that
 * announce each toast without taking focus (WCAG 4.1.3).
 *
 * Mount ONE per page, near the root; show toasts with `toast()` from anywhere. The behaviour — the
 * five-toast limit, the timers, their pause while the pointer or focus is on the stack or the page
 * is hidden (WCAG 2.2.1), Escape, the order, what is announced and how loud — is the
 * `@fubaritico/behaviors` toast machine; this component binds it to React and renders it.
 *
 * Rendered in place; while a modal `<dialog>` is open it renders INSIDE it — outside, the page is
 * inert and a toast could neither be clicked nor focused.
 *
 * @param props - {@link ToasterProps}.
 * @param props.position - Where the stack sits; defaults to `'bottom-end'`.
 * @param props.max - How many toasts are shown at once; defaults to `5`.
 * @param props.duration - Default lifetime of a toast, in ms; defaults to `5000`.
 * @param props.label - Accessible name of the stack; defaults to `'Notifications'`.
 * @param props.closeLabel - Accessible name of each close button; defaults to `'Close'`.
 * @param props.hotkey - The key that moves focus into the stack; defaults to `'F8'`.
 * @param props.toaster - An injected toaster, read once at mount; the page's shared one by default.
 * @param props.ref - Receives the stack's `<section>`.
 * @returns The stack, in place or inside the open modal dialog.
 */
export function Toaster({
  position = TOASTER_DEFAULTS.position,
  max = TOASTER_DEFAULTS.max,
  duration = TOASTER_DEFAULTS.duration,
  label = TOASTER_DEFAULTS.label,
  closeLabel = TOASTER_DEFAULTS.closeLabel,
  hotkey = TOASTER_DEFAULTS.hotkey,
  toaster: injected,
  className,
  ref,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...rest
}: Readonly<ToasterProps>) {
  // One toaster for the Toaster's life: the injected one, or the page's shared one.
  const [toaster] = useState(
    () => injected ?? getGlobalToaster<ReactToastContent>()
  )
  // The stack's node — to move focus into it (the hotkey, a toast leaving with the focus).
  const regionRef = useRef<HTMLElement | null>(null)
  // The consumer's ref and ours, on the same node.
  const mergedRef = useMergedRef(regionRef, ref)
  // The pause handlers (pointer, focus) and whether focus is inside the stack.
  const { handlers, focusInside } = useStackPause(toaster, {
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
  })

  // Props → machine before paint. Declares React as the renderer and the icon set, so a toast of
  // another framework's content, or naming an unknown icon, is refused in its caller rather than
  // breaking this render.
  useLayoutEffect(() => {
    toaster.setOptions({
      position,
      max,
      duration,
      label,
      closeLabel,
      hotkey,
      renderer: REACT_KIND,
      icons: ICON_NAMES,
    })
  }, [toaster, position, max, duration, label, closeLabel, hotkey])

  // Re-render on every change of the stack.
  const state = useSyncExternalStore(
    toaster.subscribe,
    toaster.getState,
    toaster.getState
  )
  // Reads the text of each queued toast once rendered, and hands it back to the machine.
  useToastAnnouncer(toaster, state.announcements)
  // The open modal dialog the stack must render into, or `null`.
  const dialog = useTopModalDialog()
  // F8 from anywhere on the page.
  useToasterHotkey(toaster)
  // The timers wait while the page is hidden.
  usePageVisibilityPause(toaster)

  // F8 → focus into the stack.
  useHotkeyFocus(state.focusToken, regionRef)
  // A move into or out of a dialog → the machine knows, focus follows.
  useStackMove(toaster, dialog, regionRef, focusInside)

  // Where a leaving toast's focus goes: the stack itself, still reachable by Tab.
  const focusStack = useCallback(() => {
    regionRef.current?.focus()
  }, [])

  /**
   * Attaches the region and lifts it into the top layer — on every mount of the node, so the stack
   * moved into (or out of) a dialog is shown again. Without the Popover API (jsdom, an old browser:
   * a declared degraded mode), the stack is plain markup.
   *
   * @param node - The region, or `null` when it unmounts.
   */
  const attachRegion = useCallback(
    (node: HTMLElement | null) => {
      mergedRef(node)
      if (!node || typeof node.showPopover !== 'function') return
      if (!node.matches(':popover-open')) node.showPopover()
    },
    [mergedRef]
  )

  const region = (
    <section
      {...rest}
      {...toReactAttributes(toaster.regionAttrs())}
      ref={attachRegion}
      popover="manual"
      className={clsx(toasterVariants({ position: state.position }), className)}
      {...handlers}
    >
      <ol className={TOASTER_LIST_CLASS}>
        {state.toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            toaster={toaster}
            onFocusLost={focusStack}
          />
        ))}
      </ol>
      <div
        className={TOASTER_ANNOUNCER_CLASS}
        {...toReactAttributes(toaster.announcerAttrs('polite'))}
      >
        {state.live.polite}
      </div>
      <div
        className={TOASTER_ANNOUNCER_CLASS}
        {...toReactAttributes(toaster.announcerAttrs('assertive'))}
      >
        {state.live.assertive}
      </div>
    </section>
  )

  return dialog ? createPortal(region, dialog) : region
}

export default Toaster
