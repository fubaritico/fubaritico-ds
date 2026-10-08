import { cva } from 'class-variance-authority'

import type { VariantProps } from 'class-variance-authority'

/** Visual look of a Tabs row — a rule under the row, or a tinted track of capsules. */
export type TabsVariant = 'underline' | 'pills'

/**
 * Resolves the Tabs list into BEM class names
 * (`.ui-tabs__list`, `+ --underline` / `--pills`).
 *
 * Pure string output (framework-agnostic): consumed by the React reference and the
 * Stencil / Angular / Vue packages alike, none of which it couples to a framework.
 *
 * Neither look is the base: they are structurally different (a rule versus a track), so both emit
 * a modifier rather than one being folded into `.ui-tabs__list`.
 *
 * @param props - List options (all optional — CVA defaults apply).
 * @param props.variant - Visual look; defaults to `'underline'`.
 * @returns The space-separated BEM class string for the resolved props.
 */
export const tabsListVariants = cva('ui-tabs__list', {
  variants: {
    variant: {
      underline: 'ui-tabs__list--underline',
      pills: 'ui-tabs__list--pills',
    },
  },
  defaultVariants: {
    variant: 'underline',
  },
})

/** Variant props inferred from {@link tabsListVariants}. */
export type TabsListVariantProps = VariantProps<typeof tabsListVariants>

/**
 * Resolves a Tabs trigger into BEM class names
 * (`.ui-tabs__trigger`, `+ --underline` / `--pills`, `+ --active`).
 *
 * The disabled state is NOT an axis here: the trigger is a real `<button>`, so the skin styles it
 * through the native `:disabled` pseudo-class.
 *
 * @param props - Trigger options (all optional — CVA defaults apply).
 * @param props.variant - Visual look; must match the surrounding list. Defaults to `'underline'`.
 * @param props.active - Whether this is the selected tab; defaults to `false`.
 * @returns The space-separated BEM class string for the resolved props.
 */
export const tabsTriggerVariants = cva('ui-tabs__trigger', {
  variants: {
    variant: {
      underline: 'ui-tabs__trigger--underline',
      pills: 'ui-tabs__trigger--pills',
    },
    active: {
      false: '', // idle — the base handles it; no modifier emitted
      true: 'ui-tabs__trigger--active',
    },
  },
  defaultVariants: {
    variant: 'underline',
    active: false,
  },
})

/** Variant props inferred from {@link tabsTriggerVariants}. */
export type TabsTriggerVariantProps = VariantProps<typeof tabsTriggerVariants>

/** BEM block class for the Tabs root (`.ui-tabs`). */
export const TABS_CLASS = 'ui-tabs'

/** BEM element class for a tab panel (`.ui-tabs__panel`). */
export const TABS_PANEL_CLASS = 'ui-tabs__panel'
