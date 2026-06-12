import {
  createContext,
  use,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'

import type { AvatarSize } from '@fubaritico-ds/variants'

/** Public loading status of an {@link AvatarImage}, surfaced via `onLoadingStatusChange`. */
export type AvatarImageStatus = 'idle' | 'loading' | 'loaded' | 'error'

/**
 * Internal resolver viability of a candidate:
 * - `pending` — still resolving (an image being loaded); blocks later candidates (anti-flash).
 * - `ready`   — can be shown (a loaded image, present initials, an icon).
 * - `failed`  — cannot be shown (errored/empty image, empty initials); yields to the next candidate.
 */
export type AvatarCandidateStatus = 'pending' | 'ready' | 'failed'

/**
 * The render mode the resolver assigns to a candidate:
 * - `show`    — render the real content (this candidate won).
 * - `loading` — render the loading affordance (this is the blocking pending candidate).
 * - `hidden`  — render nothing (an earlier candidate won, or this one failed).
 */
export type AvatarCandidateMode = 'show' | 'loading' | 'hidden'

/** Stable per-avatar configuration that trickles down once (never changes during the lifetime). */
interface AvatarConfigValue {
  /** Avatar size; drives the icon's pixel size and (via CSS) the initials scale. */
  size: AvatarSize
}

/**
 * STABLE resolver actions — register/unregister/report. Never change identity, so candidate effects
 * can depend on them without thrashing. Split from the dynamic mode (below) on purpose: bundling the
 * changing `getCandidateMode` with the actions would re-run every candidate's register effect on each update
 * (infinite loop). Same stable-vs-dynamic split as the config/resolver contexts.
 */
interface AvatarResolverActions {
  /** Register a candidate (by stable id) in document order. */
  register: (id: string) => void
  /** Remove a candidate on unmount. */
  unregister: (id: string) => void
  /** Report a candidate's current viability. */
  report: (id: string, status: AvatarCandidateStatus) => void
}

/** DYNAMIC resolver state — resolves a candidate's render mode from the current registry. */
interface AvatarResolverState {
  /** Resolve the render mode for a candidate from the current registry. */
  getCandidateMode: (id: string) => AvatarCandidateMode
}

/**
 * Stable context — `size`. Lives on the root; never re-published on a status change.
 * Rendered directly as a provider (`<AvatarConfigContext value>`, React 19).
 */
export const AvatarConfigContext = createContext<AvatarConfigValue | null>(null)

/** Stable resolver actions context (register/report). Provided by {@link AvatarFallback}. */
export const AvatarResolverActionsContext =
  createContext<AvatarResolverActions | null>(null)

/** Dynamic resolver state context (mode resolution). Provided by {@link AvatarFallback}. */
export const AvatarResolverStateContext =
  createContext<AvatarResolverState | null>(null)

/**
 * Reads the stable avatar configuration (`size`). Throws if used outside an `<Avatar>` — sub-components
 * are meaningless without the root's config.
 *
 * @returns The stable {@link AvatarConfigValue}.
 */
export function useAvatarConfig(): AvatarConfigValue {
  const ctx = use(AvatarConfigContext)
  if (!ctx) {
    throw new Error('Avatar sub-components must be used within <Avatar>')
  }
  return ctx
}

/**
 * Reads the stable resolver actions (register/report). Throws if used outside a {@link AvatarFallback}
 * — a candidate is meaningless without a resolver (symmetric with {@link useAvatarConfig}).
 *
 * @returns The {@link AvatarResolverActions}.
 */
export function useAvatarResolverActions(): AvatarResolverActions {
  const ctx = use(AvatarResolverActionsContext)
  if (!ctx) {
    throw new Error('Avatar candidates must be used within <Avatar.Fallback>')
  }
  return ctx
}

/**
 * Reads the dynamic resolver state (mode resolution). Throws if used outside a {@link AvatarFallback}.
 *
 * @returns The {@link AvatarResolverState}.
 */
export function useAvatarResolverState(): AvatarResolverState {
  const ctx = use(AvatarResolverStateContext)
  if (!ctx) {
    throw new Error('Avatar candidates must be used within <Avatar.Fallback>')
  }
  return ctx
}

/**
 * Builds the resolver controller for {@link AvatarFallback}: stable `actions` + dynamic `state`.
 *
 * Candidates register in document order (a layout effect runs before paint, so the registry settles
 * with no visible flicker). The winner is the FIRST candidate that is not `failed`: if it is `ready`
 * it is shown; if it is `pending` it shows its loading affordance and blocks the later candidates.
 *
 * @returns The memoized `actions` (stable) and `state` (dynamic) values to feed both providers.
 */
export function useAvatarResolverController(): {
  actions: AvatarResolverActions
  state: AvatarResolverState
} {
  // Ordered registry of candidates (document order) + their current viability.
  const [items, setItems] = useState<
    { id: string; status: AvatarCandidateStatus }[]
  >([])

  // Append a candidate (document order) on first registration; no-op if already present.
  const register = useCallback((id: string) => {
    setItems((prev) =>
      prev.some((x) => x.id === id)
        ? prev
        : [...prev, { id, status: 'pending' }]
    )
  }, [])

  // Drop a candidate on unmount; no-op if it was never registered.
  const unregister = useCallback((id: string) => {
    setItems((prev) =>
      prev.some((x) => x.id === id) ? prev.filter((x) => x.id !== id) : prev
    )
  }, [])

  // Update a candidate's viability; return the same array when unchanged so React bails the re-render.
  const report = useCallback((id: string, status: AvatarCandidateStatus) => {
    setItems((prev) => {
      const current = prev.find((x) => x.id === id)
      if (!current || current.status === status) return prev
      return prev.map((x) => (x.id === id ? { ...x, status } : x))
    })
  }, [])

  // The winner is the first non-failed candidate in document order (single lookup, reused below).
  const activeItem = items.find((x) => x.status !== 'failed')

  // Resolve a candidate's render mode from the winner; recreated whenever the winner changes.
  const getCandidateMode = useCallback(
    (id: string): AvatarCandidateMode => {
      if (id !== activeItem?.id) return 'hidden'
      return activeItem.status === 'ready' ? 'show' : 'loading'
    },
    [activeItem]
  )

  // Stable actions: identity never changes → candidate register effects run once (no thrash).
  const actions = useMemo(
    () => ({ register, unregister, report }),
    [register, unregister, report]
  )
  // Dynamic state: changes with the registry → candidates re-render to pick up their new mode.
  const state = useMemo(() => ({ getCandidateMode }), [getCandidateMode])

  return { actions, state }
}

/**
 * Registers the calling candidate in the resolver and returns its render mode.
 *
 * Reads the STABLE actions context for register/report (so the effects don't thrash) and the DYNAMIC
 * state context for the resolved mode. Both throw outside a {@link AvatarFallback}: a candidate
 * MUST live inside a resolver (`Avatar.Fallback`).
 *
 * @param status - The candidate's current viability.
 * @returns The {@link AvatarCandidateMode} this candidate should render with.
 */
export function useResolverCandidate(
  status: AvatarCandidateStatus
): AvatarCandidateMode {
  // Stable resolver actions — used by the registration effects below (throws if no Fallback).
  const actions = useAvatarResolverActions()
  // Dynamic resolver state — resolves this candidate's mode (throws if no Fallback).
  const state = useAvatarResolverState()
  // Stable per-candidate id for the registry; preserved across re-renders.
  const id = useId()

  // Register on mount / unregister on unmount. Layout effect → settles before paint (no flicker).
  useLayoutEffect(() => {
    actions.register(id)
    return () => {
      actions.unregister(id)
    }
  }, [actions, id])

  // Push this candidate's viability to the registry on every status change.
  useLayoutEffect(() => {
    actions.report(id, status)
  }, [actions, id, status])

  return state.getCandidateMode(id)
}
