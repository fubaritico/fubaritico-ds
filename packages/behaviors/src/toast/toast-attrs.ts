import type { ToastPoliteness, ToastRecord } from './types.js'
import type { DomAttributes } from '../common/types.js'

// The toast's DOM attributes as pure functions of a toast record and the labels — the machine
// delegates to them with its options. Presence semantics: strings and numbers only, `undefined`
// omits the attribute.

/** What a toast record must hold to be named. */
type Nameable = Pick<ToastRecord<unknown>, 'domId' | 'custom' | 'message'>

/**
 * The DOM id of a toast's title.
 *
 * @param toast - A toast.
 * @param toast.domId - Its DOM id.
 * @returns The title's id.
 */
const titleId = ({ domId }: { domId: string }): string => `${domId}-title`

/**
 * The DOM id of a toast's description.
 *
 * @param toast - A toast.
 * @param toast.domId - Its DOM id.
 * @returns The description's id.
 */
const descriptionId = ({ domId }: { domId: string }): string =>
  `${domId}-description`

/**
 * The element a message toast (and its close button) is named by: its title, else its
 * description — so no focusable toast is unnamed, and no two close buttons read the same.
 *
 * @param toast - A toast.
 * @returns The id of the naming element; `undefined` for free content, named by its label.
 */
function nameSourceId(toast: Nameable): string | undefined {
  if (toast.custom !== undefined) return undefined
  if (toast.message?.title) return titleId(toast)
  if (toast.message?.description) return descriptionId(toast)
  return undefined
}

/**
 * The label free content is named by — its message title, required by `show()`.
 *
 * @param toast - A toast.
 * @returns The label, or `undefined` for a message toast (named by an element).
 */
const customLabel = (toast: Nameable): string | undefined =>
  toast.custom === undefined ? undefined : toast.message?.title

/**
 * Attributes of the stack's container: a landmark named after its hotkey, focusable by script only.
 *
 * @param label - The stack's name.
 * @param hotkey - Its hotkey.
 * @returns DOM attributes.
 */
export function regionAttrs(label: string, hotkey: string): DomAttributes {
  return { role: 'region', 'aria-label': `${label} (${hotkey})`, tabindex: -1 }
}

/**
 * Attributes of one toast: focusable, so Escape reaches it; named by its title, else its
 * description (`aria-labelledby`), or by the label of free content (`aria-label`); its phase for the
 * skin's transition.
 *
 * @param toast - A toast of the snapshot.
 * @returns DOM attributes.
 */
export function toastAttrs(toast: ToastRecord<unknown>): DomAttributes {
  return {
    id: toast.domId,
    tabindex: 0,
    'data-phase': toast.phase,
    'aria-labelledby': nameSourceId(toast),
    'aria-label': customLabel(toast),
  }
}

/**
 * Attributes of a toast's title — rendered only for a message with a title.
 *
 * @param toast - A toast of the snapshot.
 * @returns DOM attributes.
 */
export function titleAttrs(toast: Nameable): DomAttributes {
  return { id: titleId(toast) }
}

/**
 * Attributes of a toast's description — rendered only for a message with a description.
 *
 * @param toast - A toast of the snapshot.
 * @returns DOM attributes.
 */
export function descriptionAttrs(toast: Nameable): DomAttributes {
  return { id: descriptionId(toast) }
}

/**
 * Attributes of a toast's close button, named after its toast — five toasts are not five identical
 * « Close » buttons: « Close Saved », « Close Upload failed ».
 *
 * @param toast - A toast of the snapshot.
 * @param closeLabel - The button's own word.
 * @returns DOM attributes.
 */
export function closeButtonAttrs(
  toast: Nameable,
  closeLabel: string
): DomAttributes {
  const closeId = `${toast.domId}-close`
  const source = nameSourceId(toast)
  const label = customLabel(toast)
  return {
    type: 'button',
    id: closeId,
    'aria-label': label === undefined ? closeLabel : `${closeLabel} ${label}`,
    'aria-labelledby':
      source === undefined ? undefined : `${closeId} ${source}`,
  }
}

/**
 * Attributes of a live region. Both are `role="status"`, the assertive one by its `aria-live` only:
 * `role="alert"` makes some screen readers stutter (Radix Toast's finding).
 *
 * @param politeness - {@link ToastPoliteness}.
 * @returns DOM attributes.
 */
export function announcerAttrs(politeness: ToastPoliteness): DomAttributes {
  return { role: 'status', 'aria-live': politeness, 'aria-atomic': 'true' }
}
