import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/**
 * Edge a Drawer is anchored to.
 *
 * LOGICAL, not physical: `start` is the left edge in a left-to-right document and the right edge
 * in a right-to-left one. `bottom` is deliberately absent — a bottom-anchored panel is a
 * {@link https://developer.mozilla.org/docs/Web/HTML/Element/dialog | sheet}, and the design system
 * ships `BottomSheet` for it.
 */
export type DrawerSide = 'start' | 'end' | 'top'

/** Extent of a Drawer ACROSS its anchored edge (its width when lateral, its height when top). */
export type DrawerSize = 'sm' | 'md' | 'lg'

/** Colour scheme of a Drawer — mirrors the Listbox / BottomSheet convention. */
export type DrawerVariant = 'light' | 'dark'

/**
 * Resolves a Drawer into the BEM class names of the native skin
 * (`.ui-drawer`, `+ --start|--end|--top`, `+ --sm|--lg`, `+ --dark`).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike, none of which it couples to a framework.
 *
 * Every side emits a modifier: none of the three is the base, because they differ structurally
 * (which axis the panel fills, which border it carries, which way it slides in).
 *
 * @param props - Drawer options (all optional — CVA defaults apply).
 * @param props.side - Anchored edge; defaults to `'start'`.
 * @param props.size - Extent across that edge; defaults to `'md'` (base — no modifier emitted).
 * @param props.variant - Colour scheme; defaults to `'light'` (base — no modifier emitted).
 * @returns The space-separated BEM class string for the resolved props.
 */
export const drawerVariants = cva('ui-drawer', {
  variants: {
    side: {
      start: 'ui-drawer--start',
      end: 'ui-drawer--end',
      top: 'ui-drawer--top',
    },
    size: {
      sm: 'ui-drawer--sm',
      md: '', // default size — fully defined by the base; no modifier emitted
      lg: 'ui-drawer--lg',
    },
    variant: {
      light: '', // default — fully defined by the base; no modifier emitted
      dark: 'ui-drawer--dark',
    },
  },
  defaultVariants: {
    side: 'start',
    size: 'md',
    variant: 'light',
  },
})

/** Variant props inferred from {@link drawerVariants}. */
export type DrawerVariantProps = VariantProps<typeof drawerVariants>

/** BEM element class for the header bar (`.ui-drawer__header`). */
export const DRAWER_HEADER_CLASS = 'ui-drawer__header'

/** BEM element class for the header's growing title slot (`.ui-drawer__title`). */
export const DRAWER_TITLE_CLASS = 'ui-drawer__title'

/** BEM element class for the scrollable content area (`.ui-drawer__body`). */
export const DRAWER_BODY_CLASS = 'ui-drawer__body'

/** BEM element class for the trailing action bar (`.ui-drawer__footer`). */
export const DRAWER_FOOTER_CLASS = 'ui-drawer__footer'
