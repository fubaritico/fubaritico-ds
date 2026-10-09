import type { Direction } from '../common/types.js'

/** Identifier of a tab — the `value` a trigger and its panel share. */
export type TabId = string

/** Axis the arrow keys follow. */
export type TabsOrientation = 'horizontal' | 'vertical'

/** Text direction of the tablist (alias of the shared `Direction`). */
export type TabsDirection = Direction

/**
 * How keyboard focus relates to selection.
 *
 * - `'automatic'` — an arrow key moves focus AND selects (APG default).
 * - `'manual'` — arrows only move focus; Enter / Space selects. Prefer it when showing a panel is
 *   expensive (a fetch per tab).
 */
export type TabsActivation = 'automatic' | 'manual'

/**
 * What to select when the active tab leaves the registry (uncontrolled mode only).
 *
 * - `'neighbor'` — the next enabled tab, else the previous one (browser-like).
 * - `'first'` — the first enabled tab.
 * - `'none'` — nothing; the consumer handles the empty state.
 */
export type TabsRemovalPolicy = 'neighbor' | 'first' | 'none'

/** What a trigger declares to the service when it mounts. */
export interface TabDescriptor {
  /** The tab's identifier. */
  id: TabId
  /** Listed but neither selectable nor reachable by the arrow keys. */
  disabled?: boolean
  /**
   * Overrides the natural order (= registration order). Needed when mount order does not match
   * visual order: portals, virtualised lists, partial hydration. Give it to all tabs or none.
   */
  order?: number
}

/** A tab as the snapshot exposes it: its descriptor plus the computed state. */
export interface TabNode extends TabDescriptor {
  /** Position among the registered tabs, in effective order. */
  index: number
  /** Whether this tab is the selected one. */
  active: boolean
  /** Whether this tab holds the roving focus. */
  focused: boolean
}

/**
 * Immutable snapshot of the service. A new reference is created on every change and only then, so
 * it plugs directly into any framework's external-store subscription, signal or reactive state.
 */
export interface TabsSnapshot {
  /** Registered tabs, in effective order. */
  tabs: readonly TabNode[]
  /** The selected tab, or `null`. */
  activeId: TabId | null
  /** The tab holding the roving focus, or `null` before any keyboard / click interaction. */
  focusedId: TabId | null
  /** `true` once at least one tab has registered. */
  initialized: boolean
  /**
   * Incremented only when a DOM focus move is explicitly requested. An adapter calls `el.focus()`
   * when this changes for its focused tab — never merely because `focused` is true, which would
   * steal focus on mount.
   */
  focusToken: number
  /** Axis of the arrow keys. */
  orientation: TabsOrientation
  /** Focus/selection coupling. */
  activation: TabsActivation
}

/** Options of a {@link TabsService}. Every one may be changed later through `setOptions`. */
export interface TabsOptions {
  /**
   * Namespace of the generated ARIA ids. Inject a value unique per instance (your framework's id generator):
   * the service keeps no global counter, so two instances given the same uid collide.
   */
  uid: string
  /**
   * Controlled selection. The **presence** of the key means controlled; `null` = controlled with
   * nothing selected. Absent or `undefined` = uncontrolled.
   */
  activeId?: TabId | null
  /** Initial selection when uncontrolled. May target a tab that has not registered yet. */
  defaultActiveId?: TabId | null
  /** Arrow-key axis; defaults to `'horizontal'`. */
  orientation?: TabsOrientation
  /** Focus/selection coupling; defaults to `'automatic'`. */
  activation?: TabsActivation
  /**
   * Text direction of the tablist; defaults to `'ltr'`. In `'rtl'` a horizontal tablist swaps
   * ArrowLeft / ArrowRight, so "next" stays visually forward. The adapter reads it from the DOM.
   */
  dir?: TabsDirection
  /** Whether the arrow keys wrap around the ends; defaults to `true`. */
  loop?: boolean
  /** Replacement for a removed active tab; defaults to `'neighbor'`. */
  removalPolicy?: TabsRemovalPolicy
  /**
   * Called when the selection changes through user intent (click, keyboard, `setActive`) or because
   * the active tab was removed. NOT called while the initial selection resolves.
   */
  onActiveChange?: (id: TabId | null, previous: TabId | null) => void
  /** Called on a non-fatal misuse (e.g. a duplicate tab id). Silent when absent. */
  onWarn?: (message: string) => void
}
