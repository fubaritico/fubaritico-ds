import type {
  DomAttributes,
  KeyboardLike,
  TabDescriptor,
  TabId,
  TabNode,
  TabsOptions,
  TabsSnapshot,
} from './types.js'

/** Listener notified with each new snapshot. */
type Listener = (snapshot: TabsSnapshot) => void

/** Registry entry: the descriptor plus its arrival rank. */
interface Entry extends TabDescriptor {
  /** Registration rank — the natural order. */
  seq: number
}

/** Options with every default resolved. */
type ResolvedOptions = Required<
  Omit<TabsOptions, 'activeId' | 'onActiveChange' | 'onWarn'>
> &
  Pick<TabsOptions, 'activeId' | 'onActiveChange' | 'onWarn'>

/**
 * Makes a string safe inside an HTML `id` attribute.
 *
 * @param value - Any string (a tab value, a framework-generated id…).
 * @returns The string with every character outside `[A-Za-z0-9_-]` replaced by `-`.
 */
const slug = (value: string): string => value.replace(/[^\w-]/g, '-')

/**
 * Tabs behaviour as a framework-agnostic service: tab registry, controlled / uncontrolled
 * selection, roving focus, keyboard navigation and ARIA attributes. Framework adapters only render
 * and wire lifecycles; they never compute an attribute themselves.
 */
export class TabsService {
  private opts: ResolvedOptions
  /** `true` while the parent drives `activeId`. */
  private controlled: boolean

  /** Insertion-ordered registry with O(1) lookup by id. */
  private readonly entries = new Map<TabId, Entry>()
  private seq = 0

  private activeId: TabId | null = null
  private focusedId: TabId | null = null
  private focusToken = 0

  /**
   * While `true`, the late arrival of the `defaultActiveId` tab makes it active. Cleared by the
   * first explicit selection, so a user's choice is never overwritten.
   */
  private pendingDefault = true

  /**
   * `true` when an empty selection was asked for (`setActive(null)`, `removalPolicy: 'none'`), so
   * `reconcile` must not paper over it with a provisional selection.
   */
  private emptyIsIntended = false

  private readonly listeners = new Set<Listener>()
  /** Memoised snapshot, invalidated by `commit`. */
  private cache: TabsSnapshot | null = null

  /** Depth of nested `batch` calls, and whether a notification waits for the outermost one. */
  private depth = 0
  private queued = false

  /**
   * @param options - Initial options; `uid` is required (see {@link TabsOptions.uid}).
   */
  constructor(options: TabsOptions) {
    this.opts = {
      orientation: 'horizontal',
      activation: 'automatic',
      loop: true,
      removalPolicy: 'neighbor',
      dir: 'ltr',
      defaultActiveId: null,
      ...options,
    }
    this.controlled = options.activeId !== undefined
    this.activeId = this.controlled ? (options.activeId ?? null) : null
  }

  // ---------- reading ----------

  /**
   * Returns the current snapshot — the same reference until something changes. An arrow function so
   * the reference is stable and can be handed straight to a framework's store subscription.
   *
   * Before any tab registers (first render, server render), the snapshot reports the INTENDED
   * selection — the controlled value or `defaultActiveId` — so the initial markup is already right.
   *
   * @returns The immutable snapshot.
   */
  getState = (): TabsSnapshot => {
    if (!this.cache) {
      const activeId = this.currentActiveId()
      const tabs: TabNode[] = this.ordered().map(
        ({ seq: _seq, ...descriptor }, index) => ({
          ...descriptor,
          index,
          active: descriptor.id === activeId,
          focused: descriptor.id === this.focusedId,
        })
      )

      this.cache = {
        tabs,
        activeId,
        focusedId: this.focusedId,
        initialized: this.entries.size > 0,
        focusToken: this.focusToken,
        orientation: this.opts.orientation,
        activation: this.opts.activation,
      }
    }
    return this.cache
  }

  /**
   * Subscribes to snapshot changes.
   *
   * @param listener - Called with each new snapshot.
   * @returns The unsubscribe function, for the framework's cleanup.
   */
  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Deterministic id of a tab's trigger — trigger and panel reference each other without knowing
   * each other.
   *
   * @param id - The tab id.
   * @returns The trigger's DOM id.
   */
  triggerId(id: TabId): string {
    return `tab-${slug(this.opts.uid)}-${slug(id)}`
  }

  /**
   * Deterministic id of a tab's panel.
   *
   * @param id - The tab id.
   * @returns The panel's DOM id.
   */
  panelId(id: TabId): string {
    return `tabpanel-${slug(this.opts.uid)}-${slug(id)}`
  }

  // ---------- options ----------

  /**
   * Applies changed props. The single entry point that keeps the controlled mode in sync.
   * Notifies only when the snapshot actually changes, so passing a new callback identity on every
   * render costs nothing.
   *
   * @param patch - The options to change. `'activeId' in patch` distinguishes an absent prop from
   *   one passed as `undefined`.
   */
  setOptions(patch: Partial<TabsOptions>): void {
    const before = this.getState()
    // The ids derive from `uid`, which the snapshot does not hold: compare it on its own.
    const uidChanged = patch.uid !== undefined && patch.uid !== this.opts.uid
    this.opts = { ...this.opts, ...patch }
    if ('activeId' in patch) this.controlled = patch.activeId !== undefined
    this.reconcile()
    this.commitIfChanged(before, uidChanged)
  }

  // ---------- registry ----------

  /**
   * Registers a tab and returns ITS unregister function — which is what makes every adapter
   * trivial: an effect cleanup returns it, a destroy hook calls it, a disconnect callback in
   * `disconnectedCallback`.
   *
   * @param descriptor - The tab to add (or update, if the id is already registered).
   * @returns A function removing this tab.
   */
  register(descriptor: TabDescriptor): () => void {
    const previous = this.entries.get(descriptor.id)
    if (previous) {
      this.opts.onWarn?.(
        `[tabs:${this.opts.uid}] duplicate tab id, updating: ${descriptor.id}`
      )
    }

    this.entries.set(descriptor.id, {
      ...descriptor,
      // A re-registration keeps its original rank, or the tab would jump to the end.
      seq: previous ? previous.seq : this.seq++,
    })

    this.reconcile()
    this.commit()
    return () => {
      this.unregister(descriptor.id)
    }
  }

  /**
   * Removes a tab. When it was the active one (uncontrolled), the `removalPolicy` picks the
   * replacement and `onActiveChange` reports it.
   *
   * @param id - The tab to remove.
   */
  unregister(id: TabId): void {
    if (!this.entries.has(id)) return

    // Capture the position BEFORE removal: it defines the neighbour.
    const position = this.ordered().findIndex((entry) => entry.id === id)
    this.entries.delete(id)

    if (this.focusedId === id) this.focusedId = null

    // Controlled: never choose for the parent — it reacts to `activeId` turning null.
    if (this.activeId === id && !this.controlled) {
      const replacement = this.pickReplacement(position)
      this.emptyIsIntended =
        replacement === null && this.opts.removalPolicy === 'none'
      this.applyActive(replacement, { emit: true })
    }

    this.reconcile()
    this.commit()
  }

  /**
   * Changes a registered tab without unregistering it, so it keeps its position.
   *
   * @param id - The tab to change.
   * @param patch - The fields to change.
   */
  update(id: TabId, patch: Partial<Omit<TabDescriptor, 'id'>>): void {
    const entry = this.entries.get(id)
    if (!entry) return
    this.entries.set(id, { ...entry, ...patch })
    this.reconcile()
    this.commit()
  }

  /**
   * Groups mutations into a single notification (e.g. replacing the whole tab list).
   *
   * @param fn - The mutations to run.
   * @returns Whatever `fn` returns.
   */
  batch<T>(fn: () => T): T {
    this.depth++
    try {
      return fn()
    } finally {
      this.depth--
      if (this.depth === 0 && this.queued) {
        this.queued = false
        this.notify()
      }
    }
  }

  /**
   * Drops every listener and registration. Optional: each subscriber and each tab already releases
   * itself through the functions `subscribe` / `register` returned. The instance stays usable — a
   * remount of the same component (e.g. a development double-mount) may keep using it.
   */
  destroy(): void {
    this.listeners.clear()
    this.entries.clear()
    this.cache = null
  }

  // ---------- selection ----------

  /**
   * Explicit selection (click, imperative API).
   *
   * @param id - The tab to select, or `null` to clear.
   * @param options - Selection options.
   * @param options.focus - Also request a DOM focus move (bumps `focusToken`).
   * @returns `false` when the id is unknown or disabled.
   */
  setActive(id: TabId | null, options: { focus?: boolean } = {}): boolean {
    if (id !== null && !this.isSelectable(id)) return false

    this.pendingDefault = false
    const previous = this.currentActiveId()

    // Controlled: state stays as the parent says; we only emit the intent.
    if (!this.controlled) this.activeId = id
    this.emptyIsIntended = id === null

    // The roving tabindex follows the selection even without a real focus move.
    this.focusedId = id
    if (options.focus) this.focusToken++

    this.commit()
    if (previous !== id) this.opts.onActiveChange?.(id, previous)
    return true
  }

  /**
   * Moves the roving focus (and requests a DOM focus move). In `'automatic'` activation it also
   * selects, as the APG tabs pattern prescribes.
   *
   * @param id - The tab to focus; ignored when `null`, unknown or disabled.
   */
  focus(id: TabId | null): void {
    if (id === null || !this.isSelectable(id)) return

    this.focusedId = id
    this.focusToken++

    if (this.opts.activation === 'automatic') this.setActive(id)
    else this.commit()
  }

  /** Focuses the next enabled tab. */
  focusNext(): void {
    this.focus(this.step(1))
  }

  /** Focuses the previous enabled tab. */
  focusPrevious(): void {
    this.focus(this.step(-1))
  }

  /** Focuses the first enabled tab. */
  focusFirst(): void {
    this.focus(this.enabled()[0]?.id ?? null)
  }

  /** Focuses the last enabled tab. */
  focusLast(): void {
    const list = this.enabled()
    this.focus(list[list.length - 1]?.id ?? null)
  }

  /**
   * Forgets the roving focus, so the selected tab becomes the tab stop again. Call it when focus
   * leaves the tablist: in manual activation the focused tab may differ from the selected one, and
   * the APG wants Tab to re-enter on the selected tab.
   */
  resetFocus(): void {
    if (this.focusedId === null) return
    this.focusedId = null
    this.commit()
  }

  /**
   * Full tablist keyboard model. Wire it on the tablist container: keydown bubbles from the focused
   * tab, and the roving tabindex keeps a single tab reachable with Tab.
   *
   * @param event - The keyboard event (or anything with `key`).
   * @returns `true` when the key was consumed (`preventDefault` already called).
   */
  handleKeydown(event: KeyboardLike): boolean {
    // Alt+Arrow (history), Ctrl/Cmd+Arrow, Ctrl+Home… belong to the browser and assistive tech.
    if (event.altKey || event.ctrlKey || event.metaKey) return false

    const { nextKey, previousKey } = this.arrowKeys()

    switch (event.key) {
      case nextKey:
        this.focusNext()
        break
      case previousKey:
        this.focusPrevious()
        break
      case 'Home':
        this.focusFirst()
        break
      case 'End':
        this.focusLast()
        break
      case 'Enter':
      case ' ':
        // In automatic mode Enter/Space on a <button> already fires its native click: let it
        // through rather than selecting twice.
        if (this.opts.activation === 'manual' && this.focusedId) {
          this.setActive(this.focusedId)
          break
        }
        return false
      default:
        return false
    }

    // Only for keys actually handled — never block scrolling for nothing.
    event.preventDefault?.()
    return true
  }

  // ---------- a11y attributes ----------

  /**
   * Attributes of the tablist container.
   *
   * @returns DOM attributes.
   */
  listAttrs(): DomAttributes {
    return { role: 'tablist', 'aria-orientation': this.opts.orientation }
  }

  /**
   * Attributes of a trigger. Valid even before the tab registers (first / server render): the
   * selection then reflects the intended one.
   *
   * @param id - The tab id.
   * @returns DOM attributes.
   */
  triggerAttrs(id: TabId): DomAttributes {
    const state = this.getState()
    const node = state.tabs.find((tab) => tab.id === id)
    const active = state.activeId === id
    // Roving tabindex: exactly one 0. Before any focus move, the selected tab holds it.
    const tabbable = state.focusedId === null ? active : node?.focused === true

    return {
      id: this.triggerId(id),
      role: 'tab',
      'aria-selected': String(active),
      'aria-controls': this.panelId(id),
      'aria-disabled': node?.disabled ? 'true' : undefined,
      tabindex: tabbable ? 0 : -1,
      'data-state': active ? 'active' : 'inactive',
    }
  }

  /**
   * Attributes of a panel.
   *
   * @param id - The tab id the panel belongs to.
   * @returns DOM attributes.
   */
  panelAttrs(
    id: TabId,
    { focusable = true }: { focusable?: boolean } = {}
  ): DomAttributes {
    const active = this.getState().activeId === id
    return {
      id: this.panelId(id),
      role: 'tabpanel',
      'aria-labelledby': this.triggerId(id),
      // The APG wants a focusable panel when its content has no focusable element first; a panel
      // that starts with a link / button / field can opt out to avoid a redundant tab stop.
      tabindex: focusable ? 0 : undefined,
      hidden: active ? undefined : '',
      'data-state': active ? 'active' : 'inactive',
    }
  }

  // ---------- internals ----------

  /**
   * The keys meaning "next" / "previous" for the current orientation and direction.
   *
   * @returns The two key names.
   */
  private arrowKeys(): { nextKey: string; previousKey: string } {
    if (this.opts.orientation === 'vertical')
      return { nextKey: 'ArrowDown', previousKey: 'ArrowUp' }
    return this.opts.dir === 'rtl'
      ? { nextKey: 'ArrowLeft', previousKey: 'ArrowRight' }
      : { nextKey: 'ArrowRight', previousKey: 'ArrowLeft' }
  }

  /**
   * The selection to expose. Before any registration it is the intended one, so a server render or
   * a first render shows the right tab instead of nothing.
   *
   * @returns The tab id to report as active.
   */
  private currentActiveId(): TabId | null {
    if (this.entries.size > 0) return this.activeId
    return this.controlled
      ? (this.opts.activeId ?? null)
      : this.opts.defaultActiveId
  }

  /**
   * Effective order: `order` when given, else arrival rank.
   *
   * @returns The registry entries, sorted.
   */
  private ordered(): Entry[] {
    return [...this.entries.values()].sort(
      (a, b) => (a.order ?? a.seq) - (b.order ?? b.seq)
    )
  }

  /**
   * @returns The enabled entries, in effective order.
   */
  private enabled(): Entry[] {
    return this.ordered().filter((entry) => !entry.disabled)
  }

  /**
   * @param id - A tab id.
   * @returns Whether the tab is registered and enabled.
   */
  private isSelectable(id: TabId): boolean {
    const entry = this.entries.get(id)
    return !!entry && !entry.disabled
  }

  /**
   * Target of a keyboard move, skipping disabled tabs. Starts from the focus, else the selection.
   *
   * @param direction - `1` forward, `-1` backward.
   * @returns The tab to focus, or `null` when none is enabled.
   */
  private step(direction: 1 | -1): TabId | null {
    const list = this.enabled()
    if (list.length === 0) return null

    const from = this.focusedId ?? this.activeId
    const index = from ? list.findIndex((entry) => entry.id === from) : -1

    // Unknown (or disabled) start: enter from the edge.
    if (index === -1)
      return (direction === 1 ? list[0] : list[list.length - 1]).id

    let next = index + direction
    // Without loop, stick to the edge instead of returning null — focus is never lost.
    if (next < 0) next = this.opts.loop ? list.length - 1 : 0
    if (next >= list.length) next = this.opts.loop ? 0 : list.length - 1
    return list[next].id
  }

  /**
   * Replacement for a removed active tab.
   *
   * @param position - Index the removed tab occupied; after removal it points at the next tab.
   * @returns The tab to activate, or `null`.
   */
  private pickReplacement(position: number): TabId | null {
    if (this.opts.removalPolicy === 'none') return null
    const list = this.ordered()
    if (this.opts.removalPolicy === 'first')
      return this.enabled()[0]?.id ?? null

    // Forward first, then backward when the last tab was removed.
    const forward = list.slice(position).find((entry) => !entry.disabled)
    const backward = list
      .slice(0, position)
      .reverse()
      .find((entry) => !entry.disabled)
    return (forward ?? backward)?.id ?? null
  }

  /**
   * Internal change of the selection (initialisation, removal).
   *
   * @param id - The new active tab.
   * @param options - Change options.
   * @param options.emit - Whether to report it through `onActiveChange`.
   */
  private applyActive(id: TabId | null, { emit }: { emit: boolean }): void {
    const previous = this.activeId
    this.activeId = id
    if (emit && previous !== id) this.opts.onActiveChange?.(id, previous)
  }

  /**
   * Re-derives the selection after any registry or options change: projects the controlled value,
   * honours a late `defaultActiveId`, drops references to departed tabs. Resolving the initial
   * selection is silent — it is not a change the consumer asked about.
   */
  private reconcile(): void {
    if (this.controlled) {
      // The parent rules: project its value, ignoring an id that is not registered.
      const wanted = this.opts.activeId ?? null
      this.activeId = wanted && this.entries.has(wanted) ? wanted : null
    } else {
      if (this.activeId && !this.entries.has(this.activeId))
        this.activeId = null

      const wanted = this.opts.defaultActiveId
      if (this.pendingDefault && wanted && this.isSelectable(wanted)) {
        // The default's tab just arrived: it takes over, even from a provisional selection.
        this.applyActive(wanted, { emit: false })
        this.pendingDefault = false
      } else if (!this.activeId && !this.emptyIsIntended) {
        // A tablist with no selection is not a valid state: provisionally select the first.
        // Typed as possibly absent: indexing an empty array yields undefined.
        const first = this.enabled()[0] as Entry | undefined
        if (first) this.applyActive(first.id, { emit: false })
      }
    }

    if (this.focusedId && !this.entries.has(this.focusedId))
      this.focusedId = null
  }

  /**
   * Invalidates the snapshot and notifies, unless a batch is in progress.
   */
  private commit(): void {
    this.cache = null
    if (this.depth > 0) {
      this.queued = true
      return
    }
    this.notify()
  }

  /**
   * Commits only when the snapshot differs from `before` on a field the views read.
   *
   * @param before - The snapshot taken before the mutation.
   * @param force - Commit regardless (a change the snapshot cannot see, such as the ids' `uid`).
   */
  private commitIfChanged(before: TabsSnapshot, force: boolean): void {
    this.cache = null
    const after = this.getState()
    const changed =
      force ||
      before.activeId !== after.activeId ||
      before.focusedId !== after.focusedId ||
      before.orientation !== after.orientation ||
      before.activation !== after.activation
    if (changed) this.commit()
    else this.cache = before
  }

  /** Sends the current snapshot to every listener. */
  private notify(): void {
    const snapshot = this.getState()
    this.listeners.forEach((listener) => {
      listener(snapshot)
    })
  }
}

/**
 * Creates a {@link TabsService}.
 *
 * @param options - Initial options; `uid` is required.
 * @returns A new service instance.
 */
export function createTabsService(options: TabsOptions): TabsService {
  return new TabsService(options)
}
