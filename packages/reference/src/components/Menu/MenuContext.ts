import { createContext, use } from 'react'

import type { ListboxVariant } from '@fubaritico/variants'

/** Colour scheme of the Menu — mirrors the Listbox surface it composes. */
export type MenuVariant = ListboxVariant

/** Value shared by {@link Menu} with its items. */
export interface MenuContextValue {
  /** Index of the item currently holding the keyboard cursor; `-1` when none. */
  activeIndex: number
  /** Value of the persistently selected item, if any. */
  selectedValue: string | undefined
  /** Colour scheme, forwarded to every item so the dark modifier reaches them too. */
  variant: MenuVariant
  /** Notifies the Menu that an item was chosen. */
  onSelect: (value: string) => void
  /** Adds an item to the keyboard-navigation registry. */
  registerItem: (index: number, value: string, disabled: boolean) => void
  /** Removes an item from the registry on unmount. */
  unregisterItem: (index: number) => void
  /** Builds the DOM id of an item, used by `aria-activedescendant`. */
  getItemId: (index: number) => string
  /** Unique id of this Menu instance, used to namespace item ids. */
  menuId: string
}

export const MenuContext = createContext<MenuContextValue | null>(null)

/**
 * Reads the Menu context, guarding the composition contract.
 *
 * `Menu.Item` is meaningless on its own — it registers itself for keyboard navigation and reads the
 * active/selected state from the parent — so a missing provider is a programming error, not a
 * standalone mode: the hook THROWS rather than degrading silently.
 *
 * @returns The surrounding Menu's context value.
 * @throws If called outside a `<Menu>`.
 */
export function useMenuContext(): MenuContextValue {
  const context = use(MenuContext)
  if (!context) throw new Error('Menu.Item must be used within <Menu>')

  return context
}
