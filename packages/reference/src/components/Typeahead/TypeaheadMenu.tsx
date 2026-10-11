import clsx from 'clsx'
import { useCallback } from 'react'
import { createPortal } from 'react-dom'

import { TYPEAHEAD_MENU_CLASS } from '@fubaritico/variants'

import { ListboxList } from '../Listbox'

import { useTypeaheadContext } from './TypeaheadContext'

import type { ComponentProps } from 'react'

/** Props for Typeahead.Menu — omits variant (managed by context) */
export type TypeaheadMenuProps = Omit<
  ComponentProps<typeof ListboxList>,
  'variant' | 'popover' | 'id' | 'role' | 'tabIndex'
>

/**
 * The Typeahead dropdown — a `<ul role="listbox">` shown under the field while the menu is open.
 *
 * A `popover="manual"` element in the browser's TOP LAYER, rendered in place: above every `z-index`,
 * unclipped by any `overflow`, and — unlike a portal — still usable inside a `Modal` it is opened
 * from. The skin anchors it to the field in CSS (as wide, flipped above when there is no room). With
 * `portal` on the parent it is mounted on `document.body` instead, anchored the same way.
 *
 * Must be rendered inside a `<Typeahead>`.
 *
 * @param props - {@link TypeaheadMenuProps}.
 * @returns The dropdown, or `null` while closed.
 */
export function TypeaheadMenu({
  className,
  style,
  ref,
  onMouseDown,
  children,
  ...rest
}: Readonly<TypeaheadMenuProps>) {
  const { isOpen, menuId, variant, portal, anchorStyle } =
    useTypeaheadContext('Typeahead.Menu')

  /**
   * Hands the list to the consumer's ref, and lifts it into the top layer on every mount. An
   * environment without the Popover API (an old browser, jsdom) only renders the markup.
   *
   * @param node - The list element, or `null` when it unmounts.
   */
  const attachList = useCallback(
    (node: HTMLUListElement | null) => {
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
      if (!node || typeof node.showPopover !== 'function') return
      if (!node.matches(':popover-open')) node.showPopover()
    },
    [ref]
  )

  if (!isOpen) return null

  const listbox = (
    <ListboxList
      {...rest}
      ref={attachList}
      variant={variant}
      id={menuId}
      role="listbox"
      popover="manual"
      // Not a tab stop: focus belongs to the field. A list that scrolls is otherwise keyboard-
      // focusable in Chromium, and Tab would land in it instead of leaving the combobox.
      tabIndex={-1}
      // Portalled, the list leaves the root's subtree and would not inherit the anchor name.
      style={{ ...style, ...anchorStyle }}
      className={clsx(TYPEAHEAD_MENU_CLASS, className)}
      // Focus stays in the field (`aria-activedescendant`): a press on a suggestion, which is not
      // focusable, must not move it to `<body>`. The click still selects.
      onMouseDown={(event) => {
        onMouseDown?.(event)
        event.preventDefault()
      }}
    >
      {children}
    </ListboxList>
  )

  return portal ? createPortal(listbox, document.body) : listbox
}

export default TypeaheadMenu
