import clsx from 'clsx'
import { useContext, useEffect, useState } from 'react'

import { ListboxList } from '../Listbox'
import { Portal } from '../Portal'

import { TypeaheadContext } from './TypeaheadContext'

import type { CSSProperties, ComponentProps, FC } from 'react'

/** Props for Typeahead.Menu — omits variant (managed by context) */
export type TypeaheadMenuProps = Omit<
  ComponentProps<typeof ListboxList>,
  'variant'
>

/**
 * Dropdown listbox for the Typeahead compound component.
 *
 * Renders a `<ul role="listbox">` below the input when the menu is open.
 * Positioned absolutely by default, or via Portal when `portal` is enabled
 * on the parent Typeahead (avoids overflow clipping). Portal mode tracks
 * scroll and resize to keep the menu anchored to the input.
 *
 * Must be used within a `<Typeahead>` provider.
 */
const TypeaheadMenu: FC<TypeaheadMenuProps> = ({
  className,
  children,
  ...rest
}) => {
  const context = useContext(TypeaheadContext)
  if (!context) throw new Error('Typeahead.Menu must be used within Typeahead')

  const { isOpen, menuId, variant, portal, inputRef } = context
  const [position, setPosition] = useState<CSSProperties>({})

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
      className={clsx(
        portal ? 'ui:z-50' : 'ui:absolute ui:left-0 ui:z-50 ui:mt-1 ui:w-full',
        className
      )}
      {...rest}
    >
      {children}
    </ListboxList>
  )

  if (portal) return <Portal>{listbox}</Portal>

  return listbox
}

export default TypeaheadMenu
