import { createContext } from 'react'

/** Visual variant for the Menu component */
export type MenuVariant = 'light' | 'dark'

export interface MenuContextValue {
  activeIndex: number
  selectedValue: string | undefined
  variant: MenuVariant
  onSelect: (value: string) => void
  registerItem: (index: number, value: string, disabled: boolean) => void
  unregisterItem: (index: number) => void
  getItemId: (index: number) => string
  menuId: string
}

export const MenuContext = createContext<MenuContextValue | null>(null)
