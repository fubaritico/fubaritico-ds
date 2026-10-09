import clsx from 'clsx'
import { useLayoutEffect, useRef } from 'react'

import { tabsListVariants } from '@fubaritico/variants'

import { useMergedRef } from '../../hooks'
import { toReactAttributes } from '../../utils'
import { useTabsContext, useTabsSelector } from './TabsContext'

import type { ComponentProps, FocusEvent, KeyboardEvent } from 'react'

/** Props of {@link TabsList}. The ARIA attributes the service owns are not overridable. */
export type TabsListProps = Omit<
  ComponentProps<'div'>,
  'role' | 'aria-orientation'
>

/**
 * The tab row — `role="tablist"`, and the single keyboard listener of the whole row: keydown
 * bubbles up from the focused trigger and the service moves focus and selection.
 *
 * Give it an accessible name (`aria-label` or `aria-labelledby`).
 *
 * Must be rendered inside a `<Tabs>`.
 *
 * @param props - {@link TabsListProps}.
 * @returns The rendered `role="tablist"` row.
 */
export function TabsList({
  className,
  children,
  onKeyDown,
  onBlur,
  ref,
  ...rest
}: Readonly<TabsListProps>) {
  const { service, variant } = useTabsContext()
  // Only the orientation feeds `listAttrs()` — re-render on that slice, not on every focus move.
  useTabsSelector(service, (snapshot) => snapshot.orientation)
  const listRef = useRef<HTMLDivElement>(null)
  const mergedRef = useMergedRef(listRef, ref)

  // The text direction lives in the DOM (`dir` on an ancestor), not in a prop: read it once
  // mounted, so the service maps ArrowLeft / ArrowRight the visual way round.
  useLayoutEffect(() => {
    const dir = listRef.current?.closest('[dir]')?.getAttribute('dir')
    service.setOptions({ dir: dir === 'rtl' ? 'rtl' : 'ltr' })
  }, [service])

  /**
   * Runs the consumer's handler first; the service handles the key unless it was prevented.
   *
   * @param event - The keydown bubbling from a trigger.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (!event.defaultPrevented) service.handleKeydown(event)
  }

  /**
   * When focus leaves the row, the selected tab becomes the tab stop again (APG re-entry rule).
   *
   * @param event - The blur bubbling from a trigger.
   */
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    onBlur?.(event)
    const next = event.relatedTarget
    if (!(next instanceof Node && event.currentTarget.contains(next)))
      service.resetFocus()
  }

  return (
    <div
      className={clsx(tabsListVariants({ variant }), className)}
      {...rest}
      {...toReactAttributes(service.listAttrs())}
      ref={mergedRef}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      {children}
    </div>
  )
}

export default TabsList
