import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Colour scheme of a listbox surface / item. */
export type ListboxVariant = 'light' | 'dark'

/** Mutually-exclusive visual state of a listbox item (the component picks ONE). */
export type ListboxItemState = 'default' | 'active' | 'selected'

/**
 * Resolves the listbox SURFACE (`<ul>`) props into the BEM class names of the native skin
 * (`@fubaritico-ds/styles` → `.ui-listbox`, `.ui-listbox--dark`).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the Stencil / Angular /
 * Vue packages alike, none of which it couples to a framework.
 *
 * @param props - Listbox surface options (all optional — CVA defaults apply).
 * @param props.variant - Colour scheme; defaults to `'light'`.
 * @returns The space-separated BEM class string for the resolved variant.
 */
export const listboxVariants = cva('ui-listbox', {
  variants: {
    variant: {
      light: '', // default — fully defined by the `.ui-listbox` base; no modifier emitted
      dark: 'ui-listbox--dark',
    },
  },
  defaultVariants: {
    variant: 'light',
  },
})

/** Variant props inferred from {@link listboxVariants}. */
export type ListboxVariantProps = VariantProps<typeof listboxVariants>

/**
 * Resolves a listbox ITEM (`<li role="option">`) props into the BEM class names of the native skin
 * (`.ui-listbox__item` + state / disabled / dark modifiers). `state` is a SINGLE axis (not three
 * booleans) so exactly one of active/selected is ever emitted — the component computes it with the
 * active > selected > default priority, so the skin needs no cross-modifier precedence.
 *
 * @param props - Listbox item options (all optional — CVA defaults apply).
 * @param props.variant - Colour scheme; defaults to `'light'`.
 * @param props.state - Visual state (`'active'` = keyboard/hover cursor, `'selected'` = persistent
 *   choice, `'default'` = idle/hoverable); defaults to `'default'`.
 * @param props.disabled - Non-interactive item; defaults to `false`.
 * @returns The space-separated BEM class string for the resolved item.
 */
export const listboxItemVariants = cva('ui-listbox__item', {
  variants: {
    variant: {
      light: '', // default — base item; no modifier emitted
      dark: 'ui-listbox__item--dark',
    },
    state: {
      default: '', // idle/hoverable — the base handles the look
      active: 'ui-listbox__item--active',
      selected: 'ui-listbox__item--selected',
    },
    disabled: {
      true: 'ui-listbox__item--disabled',
      false: '', // default — interactive item
    },
  },
  defaultVariants: {
    variant: 'light',
    state: 'default',
    disabled: false,
  },
})

/** Variant props inferred from {@link listboxItemVariants}. */
export type ListboxItemVariantProps = VariantProps<typeof listboxItemVariants>
