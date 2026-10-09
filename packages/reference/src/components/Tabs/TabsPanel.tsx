import clsx from 'clsx'

import { TABS_PANEL_CLASS } from '@fubaritico/variants'

import { toReactAttributes } from '../../utils'
import { useTabsContext, useTabsSelector } from './TabsContext'

import type { ComponentProps } from 'react'

/** Props of {@link TabsPanel}. The ARIA attributes the service owns are not overridable. */
export interface TabsPanelProps
  extends Omit<
    ComponentProps<'div'>,
    'role' | 'id' | 'tabIndex' | 'hidden' | 'aria-labelledby'
  > {
  /** Value that identifies this panel (must match a `Tabs.Trigger` value). */
  value: string
  /**
   * Whether the panel itself is a tab stop. Keep `true` when its content starts with no focusable
   * element (APG); set `false` when it starts with a link, button or field, to avoid a redundant
   * stop.
   */
  focusable?: boolean
}

/**
 * The panel of one tab — `role="tabpanel"`, labelled by its trigger, hidden while inactive. It does
 * not register: it only reads the selection, so it may live anywhere under `<Tabs>`.
 *
 * Must be rendered inside a `<Tabs>`.
 *
 * @param props - {@link TabsPanelProps}.
 * @param props.value - Value of the tab this panel belongs to.
 * @param props.focusable - Whether the panel is a tab stop; defaults to `true`.
 * @returns The rendered `role="tabpanel"` region.
 */
export function TabsPanel({
  value,
  focusable = true,
  className,
  children,
  ...rest
}: Readonly<TabsPanelProps>) {
  const { service } = useTabsContext()
  // Re-render only when THIS panel's visibility flips, not on every focus move.
  useTabsSelector(service, (snapshot) => snapshot.activeId === value)

  return (
    <div
      {...rest}
      {...toReactAttributes(service.panelAttrs(value, { focusable }))}
      className={clsx(TABS_PANEL_CLASS, className)}
    >
      {children}
    </div>
  )
}

export default TabsPanel
