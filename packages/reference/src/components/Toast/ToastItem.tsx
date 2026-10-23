import { useEffect, useLayoutEffect, useRef } from 'react'

import { customContentFor } from '@fubaritico/behaviors'
import {
  TOAST_CLOSE_CLASS,
  TOAST_CONTENT_CLASS,
  TOAST_DESCRIPTION_CLASS,
  TOAST_ICON_CLASS,
  TOAST_TITLE_CLASS,
  toastVariants,
} from '@fubaritico/variants'

import { toReactAttributes } from '../../utils'
import { Icon, isIconName } from '../Icon'
import { IconButton } from '../IconButton'

import { REACT_KIND } from './constants'

import type { ReactToastContent, ReactToaster } from './Toast.types'
import type { RefObject } from 'react'
import type { IconName } from '../Icon'
import type {
  DomAttributes,
  ToastMessage,
  ToastRecord,
} from '@fubaritico/behaviors'
import type { ToastVariant } from '@fubaritico/variants'

/** Pixel size of the leading intent glyph — the Alert's. */
const ICON_SIZE = 20

/**
 * Glyph per intent — by shape as well as colour (WCAG 1.4.1); the Alert's. `neutral` has none.
 */
const VARIANT_ICON: Record<ToastVariant, IconName | undefined> = {
  neutral: undefined,
  info: 'InformationCircle',
  success: 'Check',
  warning: 'ExclamationTriangle',
  error: 'ExclamationCircle',
}

/**
 * The glyph a message asks for: its own, or its intent's.
 *
 * @param message - The toast's message.
 * @returns The icon to render, or `undefined` for none.
 * @throws Error when the message names an icon the set does not hold. The machine refuses such a
 *   toast in its caller once the Toaster declared its icons; this is reached only by a toast shown
 *   before the Toaster mounted — rendering it would fail without saying which icon.
 */
function glyphOf(message: ToastMessage): IconName | undefined {
  const { icon, variant = 'neutral' } = message
  if (icon === undefined) return VARIANT_ICON[variant]
  if (!isIconName(icon))
    throw new Error(
      `Toast: the icon "${icon}" is not in the design system's set. Pass one of its icon names.`
    )
  return icon
}

/**
 * The accessible name the machine gives a close button.
 *
 * @param attrs - `closeButtonAttrs()`.
 * @returns Its `aria-label`.
 * @throws Error when it is missing — a broken machine contract, never a silent unnamed button.
 */
function closeNameOf(attrs: DomAttributes): string {
  const name = attrs['aria-label']
  if (typeof name !== 'string')
    throw new Error('Toast: the machine gave the close button no accessible name.')
  return name
}

/** Props of a {@link ToastItem}. */
interface ToastItemProps {
  /** The toast to render, from the snapshot. */
  toast: ToastRecord<ReactToastContent>
  /** The toaster it belongs to — for its attributes and its gestures. */
  toaster: ReactToaster
  /** Where focus goes when this toast leaves while it holds it: the stack, not the page's body. */
  onFocusLost: () => void
}

/**
 * Hands focus to the stack when a toast that holds it goes — as it starts leaving, or when it is
 * removed without a leaving phase (`leaveDuration: 0`) — so a keyboard user never lands on the
 * page's body.
 *
 * @param ref - The toast's `<li>`.
 * @param phase - Its lifecycle step.
 * @param onFocusLost - Moves focus to the stack.
 */
function useFocusHandoff(
  ref: RefObject<HTMLLIElement | null>,
  phase: ToastRecord<ReactToastContent>['phase'],
  onFocusLost: () => void
): void {
  // As it starts leaving, with focus inside.
  useEffect(() => {
    if (phase !== 'leaving') return
    if (ref.current?.contains(document.activeElement)) onFocusLost()
  }, [ref, phase, onFocusLost])

  // When removed at once: a layout cleanup runs before React detaches the node, while it still
  // holds the focus.
  useLayoutEffect(() => {
    const node = ref.current
    return () => {
      if (node?.contains(document.activeElement)) onFocusLost()
    }
  }, [ref, onFocusLost])
}

/** Props of {@link ToastMessageContent}. */
interface ToastMessageContentProps {
  /** The toast. */
  toast: ToastRecord<ReactToastContent>
  /** Its toaster — for the ids its title and description name it by. */
  toaster: ReactToaster
}

/**
 * The default content of a toast: its intent glyph, its title, its description.
 *
 * @param props - {@link ToastMessageContentProps}.
 * @returns The glyph and the text column.
 */
function ToastMessageContent({ toast, toaster }: ToastMessageContentProps) {
  const { message } = toast
  const glyph = message ? glyphOf(message) : undefined
  return (
    <>
      {glyph ? (
        <span className={TOAST_ICON_CLASS}>
          <Icon name={glyph} size={ICON_SIZE} />
        </span>
      ) : null}
      <div className={TOAST_CONTENT_CLASS}>
        {message?.title ? (
          <p
            className={TOAST_TITLE_CLASS}
            {...toReactAttributes(toaster.titleAttrs(toast))}
          >
            {message.title}
          </p>
        ) : null}
        {message?.description ? (
          <p
            className={TOAST_DESCRIPTION_CLASS}
            {...toReactAttributes(toaster.descriptionAttrs(toast))}
          >
            {message.description}
          </p>
        ) : null}
      </div>
    </>
  )
}

/**
 * One toast — its message (glyph, title, description) or its free content, and a close button
 * when it is dismissible. Escape closes it while focus is inside it.
 *
 * @param props - {@link ToastItemProps}.
 * @returns The `<li>` of the stack's list.
 */
export function ToastItem({ toast, toaster, onFocusLost }: ToastItemProps) {
  // The <li> — to tell whether it holds the focus when it leaves.
  const ref = useRef<HTMLLIElement>(null)
  const custom = customContentFor(toast, REACT_KIND)
  const closeAttrs = toaster.closeButtonAttrs(toast)
  const closeName = toast.dismissible ? closeNameOf(closeAttrs) : undefined
  // Focus goes to the stack, not the body, when this toast goes.
  useFocusHandoff(ref, toast.phase, onFocusLost)

  return (
    <li
      ref={ref}
      className={toastVariants({
        variant: toast.message?.variant ?? 'neutral',
        bare: custom?.bare ?? false,
      })}
      {...toReactAttributes(toaster.toastAttrs(toast))}
      onKeyDown={(event) => {
        toaster.handleToastKeydown(toast.id, event)
      }}
    >
      {custom ? (
        // In the content column, like a message: it fills the toast's width, so the stack is even.
        <div className={TOAST_CONTENT_CLASS}>{custom.node}</div>
      ) : (
        <ToastMessageContent toast={toast} toaster={toaster} />
      )}
      {closeName === undefined ? null : (
        <IconButton
          icon="XMark"
          size="sm"
          variant="ghost"
          className={TOAST_CLOSE_CLASS}
          {...toReactAttributes(closeAttrs)}
          aria-label={closeName}
          onClick={() => {
            toaster.dismiss(toast.id)
          }}
        />
      )}
    </li>
  )
}

export default ToastItem
