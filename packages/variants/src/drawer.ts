import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Colour scheme of the Drawer — mirrors the Listbox/Menu convention. */
export type DrawerVariant = 'light' | 'dark'

/**
 * Resolves the Drawer panel into BEM class names
 * (`.ui-drawer`, `+ --dark`, `+ --animated`).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike, none of which it couples to a framework.
 *
 * `animated` is a separate axis rather than part of the colour scheme because the slide is an
 * ENTRANCE: the composer turns it on for the first open only, so a content update inside an
 * already-open sheet does not replay it.
 *
 * @param props - Drawer options (all optional — CVA defaults apply).
 * @param props.variant - Colour scheme; defaults to `'light'` (base — no modifier emitted).
 * @param props.animated - Whether to play the entrance slide; defaults to `false`.
 * @returns The space-separated BEM class string for the resolved props.
 */
export const drawerVariants = cva('ui-drawer', {
  variants: {
    variant: {
      light: '', // default — fully defined by the base; no modifier emitted
      dark: 'ui-drawer--dark',
    },
    animated: {
      false: '', // no entrance — the panel simply appears
      true: 'ui-drawer--animated',
    },
  },
  defaultVariants: {
    variant: 'light',
    animated: false,
  },
})

/** Variant props inferred from {@link drawerVariants}. */
export type DrawerVariantProps = VariantProps<typeof drawerVariants>

/** BEM element class for the optional scrim behind the sheet (`.ui-drawer__overlay`). */
export const DRAWER_OVERLAY_CLASS = 'ui-drawer__overlay'

/** BEM element class for the header bar (`.ui-drawer__header`). */
export const DRAWER_HEADER_CLASS = 'ui-drawer__header'

/** BEM element class for the header's growing title slot (`.ui-drawer__title`). */
export const DRAWER_TITLE_CLASS = 'ui-drawer__title'

/** BEM element class for the scrollable content area (`.ui-drawer__body`). */
export const DRAWER_BODY_CLASS = 'ui-drawer__body'
