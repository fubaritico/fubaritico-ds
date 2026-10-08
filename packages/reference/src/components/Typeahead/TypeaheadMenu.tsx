import clsx from 'clsx'
import { useEffect, useState } from 'react'

import { typeaheadMenuVariants } from '@fubaritico-ds/variants'

import { ListboxList } from '../Listbox'
import { Portal } from '../Portal'

import { useTypeaheadContext } from './TypeaheadContext'

import type { CSSProperties, ComponentProps } from 'react'

/** Props for Typeahead.Menu — omits variant (managed by context) */
export type TypeaheadMenuProps = Omit<
  ComponentProps<typeof ListboxList>,
  'variant'
>

/**
 * The Typeahead dropdown — a `<ul role="listbox">` shown under the field while the menu is open.
 *
 * Anchored by the skin in the default mode. With `portal` on the parent, it is rendered out of the
 * subtree (escaping any `overflow: hidden` ancestor) and positioned from measured coordinates
 * instead, kept in sync on scroll and resize.
 *
 * Must be rendered inside a `<Typeahead>`.
 *
 * @param props - {@link TypeaheadMenuProps}.
 * @returns The dropdown, or `null` while closed.
 */
export function TypeaheadMenu({
  className,
  children,
  ...rest
}: Readonly<TypeaheadMenuProps>) {
  const { isOpen, menuId, variant, portal, inputRef } =
    useTypeaheadContext('Typeahead.Menu')
  const [position, setPosition] = useState<CSSProperties>({})

  // In portal mode the menu lives outside this subtree, so it cannot be anchored by CSS: its
  // coordinates are measured from the input and refreshed on scroll/resize. Capture-phase scroll
  // listening catches scrolling in any ancestor, not just the window.
  useEffect(() => {
    if (!portal || !isOpen || !inputRef.current) return

    const updatePosition = () => {
      const rect = inputRef.current?.getBoundingClientRect()
      if (!rect) return
      setPosition({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }

    updatePosition()

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [portal, isOpen, inputRef])

  if (!isOpen) return null

  const listbox = (
    <ListboxList
      variant={variant}
      id={menuId}
      role="listbox"
      style={portal ? position : undefined}
      className={clsx(typeaheadMenuVariants({ portal }), className)}
      {...rest}
    >
      {children}
    </ListboxList>
  )

  if (portal) return <Portal>{listbox}</Portal>

  return listbox
}

export default TypeaheadMenu
