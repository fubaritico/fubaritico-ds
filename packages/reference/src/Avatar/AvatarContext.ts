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
 * Internal cascade viability of a candidate:
 * - `pending` — still resolving (an image being loaded); blocks later candidates (anti-flash).
 * - `ready`   — can be shown (a loaded image, present initials, an icon).
 * - `failed`  — cannot be shown (errored/empty image, empty initials); yields to the next candidate.
 */
export type AvatarCandidateStatus = 'pending' | 'ready' | 'failed'

/**
 * The render mode the cascade assigns to a candidate:
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
 * STABLE cascade actions — register/unregister/report. Never change identity, so candidate effects
 * can depend on them without thrashing. Split from the dynamic mode (below) on purpose: bundling the
 * changing `modeFor` with the actions would re-run every candidate's register effect on each update
 * (infinite loop). Same stable-vs-dynamic split as the config/cascade contexts.
 */
interface AvatarCascadeActions {
  /** Register a candidate (by stable id) in document order. */
  register: (id: string) => void
  /** Remove a candidate on unmount. */
  unregister: (id: string) => void
  /** Report a candidate's current viability. */
  report: (id: string, status: AvatarCandidateStatus) => void
}

/** DYNAMIC cascade state — resolves a candidate's render mode from the current registry. */
interface AvatarCascadeState {
  /** Resolve the render mode for a candidate from the current registry. */
  modeFor: (id: string) => AvatarCandidateMode
}

/**
 * Stable context — `size`. Lives on the root; never re-published on a status change.
 * Rendered directly as a provider (`<AvatarConfigContext value>`, React 19).
 */
export const AvatarConfigContext = createContext<AvatarConfigValue | null>(null)

/** Stable cascade actions context (register/report). Provided by {@link AvatarFallback}. */
export const AvatarCascadeActionsContext =
  createContext<AvatarCascadeActions | null>(null)

/** Dynamic cascade state context (mode resolution). Provided by {@link AvatarFallback}. */
export const AvatarCascadeStateContext =
  createContext<AvatarCascadeState | null>(null)

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
 * Reads the stable cascade actions (register/report). Unlike {@link useAvatarConfig} it does NOT
 * throw: returns `null` outside a {@link AvatarFallback}, since a candidate is allowed to render
 * standalone (no cascade → no registration).
 *
 * @returns The {@link AvatarCascadeActions}, or `null` when there is no surrounding cascade.
 */
export function useAvatarCascadeActions(): AvatarCascadeActions | null {
  return use(AvatarCascadeActionsContext)
}

/**
 * Reads the dynamic cascade state (mode resolution). Returns `null` outside a {@link AvatarFallback}
 * (standalone candidate).
 *
 * @returns The {@link AvatarCascadeState}, or `null` when there is no surrounding cascade.
 */
export function useAvatarCascadeState(): AvatarCascadeState | null {
  return use(AvatarCascadeStateContext)
}

/**
 * Builds the cascade controller for {@link AvatarFallback}: stable `actions` + dynamic `state`.
 *
 * Candidates register in document order (a layout effect runs before paint, so the registry settles
 * with no visible flicker). The winner is the FIRST candidate that is not `failed`: if it is `ready`
 * it is shown; if it is `pending` it shows its loading affordance and blocks the later candidates.
 *
 * @returns The memoized `actions` (stable) and `state` (dynamic) values to feed both providers.
 */
export function useAvatarCascadeController(): {
  actions: AvatarCascadeActions
  state: AvatarCascadeState
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
  const modeFor = useCallback(
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
  const state = useMemo(() => ({ modeFor }), [modeFor])

  return { actions, state }
}

/**
 * Registers the calling candidate in the cascade and returns its render mode.
 *
 * Reads the STABLE actions context for register/report (so the effects don't thrash) and the DYNAMIC
 * state context for the resolved mode. Outside a {@link AvatarFallback} (no state context) the
 * candidate is autonomous: it renders whenever it is `ready`/`pending` (standalone
 * `<Avatar><Avatar.Image/></Avatar>` still works).
 *
 * @param status - The candidate's current viability.
 * @returns The {@link AvatarCandidateMode} this candidate should render with.
 */
export function useCascadeCandidate(
  status: AvatarCandidateStatus
): AvatarCandidateMode {
  // Stable cascade actions (null when standalone) — used by the registration effects below.
  const actions = useAvatarCascadeActions()
  // Dynamic cascade state (null when standalone) — resolves this candidate's mode.
  const state = useAvatarCascadeState()
  // Stable per-candidate id for the registry; preserved across re-renders.
  const id = useId()

  // Register on mount / unregister on unmount. Layout effect → settles before paint (no flicker).
  useLayoutEffect(() => {
    if (!actions) return
    actions.register(id)
    return () => {
      actions.unregister(id)
    }
  }, [actions, id])

  // Push this candidate's viability to the registry on every status change.
  useLayoutEffect(() => {
    actions?.report(id, status)
  }, [actions, id, status])

  if (!state) {
    if (status === 'ready') return 'show'
    if (status === 'pending') return 'loading'
    return 'hidden'
  }
  return state.modeFor(id)
}
