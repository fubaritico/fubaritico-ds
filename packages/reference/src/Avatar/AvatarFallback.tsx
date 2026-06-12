import {
  AvatarCascadeActionsContext,
  AvatarCascadeStateContext,
  useAvatarCascadeController,
} from './AvatarContext'

import type { ReactNode } from 'react'

export interface AvatarFallbackProps {
  /**
   * Ordered candidates (`Avatar.Image`, `Avatar.Initials`, `Avatar.Icon`, …). The cascade renders
   * the FIRST viable one; a pending image blocks the later candidates until it resolves.
   */
  children: ReactNode
}

/**
 * Resolution container. Provides the dynamic cascade context to its candidate children and lets the
 * cascade pick the first viable one. Purely declarative — candidates are tags, not a render-prop —
 * so the consumer composes the fallback chain by ordering elements.
 *
 * @param props - {@link AvatarFallbackProps}
 * @returns The candidates wrapped in the cascade provider.
 */
export function AvatarFallback({ children }: Readonly<AvatarFallbackProps>) {
  // Build the cascade controller (stable actions + dynamic state) for this candidate subtree.
  const { actions, state } = useAvatarCascadeController()

  return (
    <AvatarCascadeActionsContext value={actions}>
      <AvatarCascadeStateContext value={state}>
        {children}
      </AvatarCascadeStateContext>
    </AvatarCascadeActionsContext>
  )
}

export default AvatarFallback
