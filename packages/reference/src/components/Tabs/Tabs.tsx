import clsx from 'clsx'
import { useId, useLayoutEffect, useMemo, useState } from 'react'

import { createTabsService } from '@fubaritico/behaviors'
import { TABS_CLASS } from '@fubaritico/variants'

import { TabsContext } from './TabsContext'
import { TabsList } from './TabsList'
import { TabsPanel } from './TabsPanel'
import { TabsTrigger } from './TabsTrigger'

import type { TabsActivation, TabsOptions, TabsService } from '@fubaritico/behaviors'
import type { TabsVariant } from '@fubaritico/variants'
import type { ComponentProps } from 'react'

export type { TabsActivation } from '@fubaritico/behaviors'
export type { TabsVariant } from '@fubaritico/variants'

/** Props of the {@link Tabs} root. */
export interface TabsProps extends ComponentProps<'div'> {
  /** Initially selected tab when uncontrolled. May name a tab that mounts later. */
  defaultValue?: string
  /** Selected tab when controlled. */
  value?: string
  /** Called with the tab the user selects (click, keyboard), or the one replacing a removed tab. */
  onValueChange?: (value: string) => void
  /** Visual variant. */
  variant?: TabsVariant
  /**
   * Namespaces the generated ids (`tab-{prefix}-{value}`). Optional: ids are unique per instance
   * without it — set it only when you need predictable ids.
   */
  prefix?: string
  /** `'automatic'`: arrows select. `'manual'`: arrows move focus, Enter / Space selects. */
  activation?: TabsActivation
  /** Whether the arrow keys wrap around the ends. */
  loop?: boolean
  /**
   * A service created elsewhere (`createTabsService`) — to drive the tabs from outside the tree, or
   * to inject a stub in a test. Read once, at mount. Its own `uid` and `defaultActiveId` are kept
   * (`prefix` and `defaultValue` are then ignored); the other props still sync to it.
   */
  service?: TabsService
}

/**
 * Projects the root props onto service options. `activeId` is set only when `value` is given:
 * the key's presence is what makes the service controlled.
 *
 * @param props - The props driving the service.
 * @returns The matching service options.
 */
function toServiceOptions({
  uid,
  value,
  activation,
  loop,
  onValueChange,
}: {
  uid: string | undefined
  value: string | undefined
  activation: TabsActivation
  loop: boolean
  onValueChange: TabsProps['onValueChange']
}): Partial<TabsOptions> {
  return {
    // Omitted rather than undefined: an injected service keeps its own uid.
    ...(uid === undefined ? {} : { uid }),
    activeId: value,
    activation,
    loop,
    onActiveChange: (id) => {
      if (id !== null) onValueChange?.(id)
    },
  }
}

/**
 * Tabs — switches between sibling panels, following the ARIA tabs pattern.
 *
 * A thin React adapter over `TabsService` (`@fubaritico/behaviors`), which owns the registry,
 * selection, roving focus, keyboard and ARIA. Works controlled (`value` + `onValueChange`) or
 * uncontrolled (`defaultValue`). Composes `Tabs.List`, `Tabs.Trigger` and `Tabs.Panel`.
 *
 * @param props - {@link TabsProps}.
 * @param props.defaultValue - Initially selected tab when uncontrolled.
 * @param props.value - Selected tab when controlled.
 * @param props.onValueChange - Called with the newly selected tab's value.
 * @param props.variant - Visual look; defaults to `'underline'`.
 * @param props.prefix - Fixed namespace for the generated ids; defaults to a unique per-instance id.
 * @param props.activation - Focus/selection coupling; defaults to `'automatic'`.
 * @param props.loop - Arrow-key wrapping; defaults to `true`.
 * @param props.service - Injected service; one is created when absent.
 * @returns The rendered tabs root.
 */
export function Tabs({
  defaultValue,
  value,
  onValueChange,
  variant = 'underline',
  prefix,
  activation = 'automatic',
  loop = true,
  service: injectedService,
  className,
  children,
  ...rest
}: Readonly<TabsProps>) {
  // Called unconditionally (rules of hooks), used only when no prefix is given.
  const reactId = useId()
  // An injected service keeps its uid unless a prefix explicitly overrides it.
  const uid = prefix ?? (injectedService ? undefined : reactId)

  // `useState`, not `useMemo`: the instance must survive for the component's whole life (useMemo
  // may be discarded), and a StrictMode remount reuses it — so it is never destroyed in a cleanup:
  // every trigger and subscriber already releases itself.
  const [service] = useState(
    () =>
      injectedService ??
      createTabsService({
        ...toServiceOptions({ uid, value, activation, loop, onValueChange }),
        uid: uid ?? reactId,
        defaultActiveId: defaultValue ?? null,
      })
  )

  // Props → service, before paint. Cheap on every render: the service only notifies when the
  // snapshot actually changes, so a new `onValueChange` identity costs nothing. Trade-off of an
  // external store: the render that sees a new `value` still reads the old snapshot; the service
  // then notifies and React re-renders once more, synchronously, before anything is painted.
  useLayoutEffect(() => {
    service.setOptions(
      toServiceOptions({ uid, value, activation, loop, onValueChange })
    )
  }, [service, uid, value, activation, loop, onValueChange])

  const contextValue = useMemo(() => ({ service, variant }), [service, variant])

  return (
    <TabsContext value={contextValue}>
      <div className={clsx(TABS_CLASS, className)} {...rest}>
        {children}
      </div>
    </TabsContext>
  )
}

Tabs.List = TabsList
Tabs.Trigger = TabsTrigger
Tabs.Panel = TabsPanel

export default Tabs
