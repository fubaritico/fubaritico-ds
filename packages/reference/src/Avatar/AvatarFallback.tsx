import {
  AvatarResolverActionsContext,
  AvatarResolverStateContext,
  useAvatarResolverController,
} from './AvatarContext'

import type { ReactNode } from 'react'

export interface AvatarFallbackProps {
  /**
   * Ordered candidates (`Avatar.Image`, `Avatar.Initials`, `Avatar.Icon`, …). The resolver renders
   * the FIRST viable one; a pending image blocks the later candidates until it resolves.
   */
  children: ReactNode
}

/**
 * Resolution container. Provides the dynamic resolver context to its candidate children and lets the
 * resolver pick the first viable one. Purely declarative — candidates are tags, not a render-prop —
 * so the consumer composes the fallback chain by ordering elements.
 *
 * @param props - {@link AvatarFallbackProps}
 * @returns The candidates wrapped in the resolver provider.
 */
export function AvatarFallback({ children }: Readonly<AvatarFallbackProps>) {
  // Build the resolver controller (stable actions + dynamic state) for this candidate subtree.
  const { actions, state } = useAvatarResolverController()

  return (
    <AvatarResolverActionsContext value={actions}>
      <AvatarResolverStateContext value={state}>
        {children}
      </AvatarResolverStateContext>
    </AvatarResolverActionsContext>
  )
}

export default AvatarFallback
