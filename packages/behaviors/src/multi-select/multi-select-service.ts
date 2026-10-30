import { slug } from '../internal/ids.js'
import { hasModifier } from '../internal/keys.js'
import { Store } from '../internal/store.js'

import { findMatch } from './match.js'

import type {
  MultiSelectFocusTarget,
  MultiSelectItem,
  MultiSelectMatch,
  MultiSelectMessages,
  MultiSelectOption,
  MultiSelectOptions,
  MultiSelectSnapshot,
  MultiSelectTag,
} from './types.js'
import type { DomAttributes, KeyboardLike } from '../common/types.js'

/** The English sentences, used for every message the consumer does not translate. */
const DEFAULT_MESSAGES: MultiSelectMessages = {
  remove: (label) => `Remove ${label}`,
  added: (label) => `${label} added`,
  removed: (label) => `${label} removed`,
  results: (count) => (count === 1 ? '1 result' : `${String(count)} results`),
  noResults: 'No results',
}

/** An option visible under the current query, with where it matched. */
interface VisibleOption {
  /** The consumer's option. */
  option: MultiSelectOption
  /** Where the query matched its label, or `null` without a query. */
  match: MultiSelectMatch | null
}

/** A live region re-reads only a CHANGED text: an identical sentence gets a no-break space. */
const NBSP = '\u00a0'

/**
 * Multi-select behaviour as a framework-agnostic service: the selection (controlled or not), the
 * search over the options, the menu's open state and keyboard cursor, the removal of a choice with
 * its focus move and announcement, and the ARIA attributes of the combobox, the listbox, the options
 * and the remove buttons. Framework adapters only render and wire lifecycles.
 */
export class MultiSelectService extends Store<MultiSelectSnapshot> {
  private opts: MultiSelectOptions
  /** `true` while the parent drives `value`. */
  private controlled: boolean
  /** The selection when uncontrolled; mirrors `opts.value` when controlled. */
  private selection: readonly string[]

  private isOpen = false
  private query = ''
  private activeValue: string | null = null
  private announcement = ''
  private focusTarget: MultiSelectFocusTarget | null = null
  private focusToken = 0

  /**
   * @param options - Initial options; `uid` and `options` are required.
   */
  constructor(options: MultiSelectOptions) {
    super()
    this.opts = options
    this.controlled = options.value !== undefined
    this.selection = options.value ?? options.defaultValue ?? []
    this.checkContract()
  }

  // ---------- reading ----------

  /**
   * Builds the snapshot from the private state.
   *
   * @returns The immutable snapshot.
   */
  protected createSnapshot(): MultiSelectSnapshot {
    const chosen = new Set(this.selection)
    const items: MultiSelectItem[] = this.visibleOptions().map(
      ({ option, match }) => ({
        ...option,
        id: this.optionId(option.value),
        selected: chosen.has(option.value),
        active: option.value === this.activeValue,
        match,
      })
    )
    const byValue = this.optionsByValue()
    const tags: MultiSelectTag[] = this.selection.map((value) => {
      const option = byValue.get(value)
      return { value, label: option ? option.label : value, known: !!option }
    })

    return {
      open: this.isOpen,
      query: this.query,
      value: this.selection,
      tags,
      items,
      activeValue: this.activeValue,
      disabled: this.opts.disabled === true,
      announcement: this.announcement,
      noResultsText: this.messages().noResults,
      focusTarget: this.focusTarget,
      focusToken: this.focusToken,
    }
  }

  /**
   * DOM id of the listbox — the target of the combobox's `aria-controls`.
   *
   * @returns The listbox id.
   */
  listboxId(): string {
    return `multi-select-${slug(this.opts.uid)}-listbox`
  }

  /**
   * Deterministic DOM id of an option.
   *
   * @param value - The option's value.
   * @returns The option id.
   */
  optionId(value: string): string {
    return `multi-select-${slug(this.opts.uid)}-option-${slug(value)}`
  }

  // ---------- options ----------

  /**
   * Applies changed props — the single entry point that keeps the controlled mode in sync. Notifies
   * only when the snapshot actually changes, so a new callback identity on every render costs nothing.
   *
   * @param patch - The options to change. `'value' in patch` tells an absent prop from `undefined`.
   */
  setOptions(patch: Partial<MultiSelectOptions>): void {
    const before = this.getState()
    const uidChanged = patch.uid !== undefined && patch.uid !== this.opts.uid
    const contractChanged = 'options' in patch || 'value' in patch
    this.opts = { ...this.opts, ...patch }
    if ('value' in patch) this.controlled = patch.value !== undefined
    if (this.controlled) this.selection = this.opts.value ?? []
    if (this.opts.disabled) this.closeMenu()
    this.reconcileActive()
    if (contractChanged) this.checkContract()
    this.commitIfChanged(
      before,
      (b, a) =>
        uidChanged ||
        b.value !== a.value ||
        b.disabled !== a.disabled ||
        b.open !== a.open ||
        b.activeValue !== a.activeValue ||
        b.noResultsText !== a.noResultsText ||
        !sameItems(b.items, a.items) ||
        !sameTags(b.tags, a.tags)
    )
  }

  // ---------- menu ----------

  /** Opens the menu, the cursor on the first enabled option. Ignored when disabled. */
  open(): void {
    if (this.opts.disabled || this.isOpen) return
    this.isOpen = true
    this.activeValue = this.firstEnabled()
    this.commit()
  }

  /**
   * Closes the menu.
   *
   * @param options - Close options.
   * @param options.clearQuery - Also empties the search (focus leaving the control).
   */
  close({ clearQuery = false }: { clearQuery?: boolean } = {}): void {
    const changed = this.isOpen || (clearQuery && this.query !== '')
    if (!changed) return
    this.closeMenu()
    if (clearQuery) this.query = ''
    this.commit()
  }

  /** Opens a closed menu, closes an open one. */
  toggleOpen(): void {
    if (this.isOpen) this.close()
    else this.open()
  }

  /**
   * Updates the search text. A non-empty query opens the menu; the cursor moves to the first
   * enabled match.
   *
   * @param query - The text typed in the input.
   */
  setQuery(query: string): void {
    if (this.opts.disabled || query === this.query) return
    this.query = query
    const searching = query.trim() !== ''
    if (searching) this.isOpen = true
    this.activeValue = this.isOpen ? this.firstEnabled() : null
    if (searching) {
      // Tell a screen-reader user what the search left: the list itself is not read.
      const count = this.visibleOptions().length
      const messages = this.messages()
      this.announce(count === 0 ? messages.noResults : messages.results(count))
    }
    this.commit()
  }

  /**
   * Moves the keyboard cursor (a pointer hovering an option).
   *
   * @param value - The option to point at; ignored when not visible or disabled.
   */
  setActive(value: string): void {
    if (value === this.activeValue || !this.isNavigable(value)) return
    this.activeValue = value
    this.commit()
  }

  // ---------- selection ----------

  /**
   * Chooses an option, or removes it when already chosen. The search empties so every option shows
   * again, and the menu stays open for the next choice.
   *
   * @param value - The option's value.
   * @returns `false` when the option is unknown or disabled, or the control disabled.
   */
  toggle(value: string): boolean {
    const option = this.optionsByValue().get(value)
    if (this.opts.disabled || !option || option.disabled) return false

    const chosen = this.selection.includes(value)
    const next = chosen
      ? this.selection.filter((entry) => entry !== value)
      : [...this.selection, value]
    const messages = this.messages()
    this.query = ''
    this.activeValue = value
    this.apply(
      next,
      chosen ? messages.removed(option.label) : messages.added(option.label)
    )
    return true
  }

  /**
   * Removes a choice through its badge's remove button, then asks the adapter to move focus to the
   * next badge's button — or to the input when it was the last one (so focus is never lost on
   * `<body>` when the button disappears).
   *
   * @param value - The chosen value to remove.
   * @returns `false` when the value is not chosen or the control is disabled.
   */
  remove(value: string): boolean {
    const position = this.selection.indexOf(value)
    if (this.opts.disabled || position === -1) return false

    const next = this.selection.filter((entry) => entry !== value)
    const following = next[position] as string | undefined
    this.focusTarget =
      following === undefined
        ? { kind: 'input' }
        : { kind: 'remove', value: following }
    this.focusToken++
    this.apply(next, this.messages().removed(this.labelOf(value)))
    return true
  }

  /**
   * Removes the last choice (Backspace in an empty input). Focus stays in the input.
   *
   * @returns `false` when nothing is chosen or the control is disabled.
   */
  removeLast(): boolean {
    const last = this.selection[this.selection.length - 1] as string | undefined
    if (this.opts.disabled || last === undefined) return false
    this.apply(
      this.selection.slice(0, -1),
      this.messages().removed(this.labelOf(last))
    )
    return true
  }

  /**
   * Keyboard model of the combobox input: Arrow Down / Up open the menu and move the cursor
   * (wrapping), Home / End jump while it is open, Enter chooses or removes the option under the
   * cursor, Escape closes the menu then clears the search, Backspace in an empty input removes the
   * last choice.
   *
   * @param event - The keyboard event (or anything with `key`).
   * @returns `true` when the key was consumed (`preventDefault` already called).
   */
  handleKeydown(event: KeyboardLike): boolean {
    if (this.opts.disabled || hasModifier(event)) return false

    const consumed = this.routeKey(event.key)
    if (consumed) event.preventDefault?.()
    return consumed
  }

  /**
   * Drops every listener. The instance stays usable — a remount of the same component (e.g. a
   * development double-mount) may keep using it.
   */
  destroy(): void {
    this.clearStore()
  }

  // ---------- a11y attributes ----------

  /**
   * Attributes of the search input — the combobox. Bind `value` and `disabled` yourself.
   *
   * @returns DOM attributes.
   */
  comboboxAttrs(): DomAttributes {
    const { open, activeValue } = this.getState()
    return {
      role: 'combobox',
      'aria-expanded': String(open),
      'aria-controls': open ? this.listboxId() : undefined,
      'aria-activedescendant':
        open && activeValue !== null ? this.optionId(activeValue) : undefined,
      'aria-autocomplete': 'list',
      autocomplete: 'off',
    }
  }

  /**
   * Attributes of the listbox. Not a tab stop: focus stays in the input.
   *
   * @returns DOM attributes.
   */
  listboxAttrs(): DomAttributes {
    return {
      id: this.listboxId(),
      role: 'listbox',
      'aria-multiselectable': 'true',
      tabindex: -1,
    }
  }

  /**
   * Attributes of an option.
   *
   * @param value - The option's value.
   * @returns DOM attributes.
   */
  optionAttrs(value: string): DomAttributes {
    const option = this.optionsByValue().get(value)
    return {
      id: this.optionId(value),
      role: 'option',
      'aria-selected': String(this.selection.includes(value)),
      'aria-disabled': option?.disabled ? 'true' : undefined,
    }
  }

  /**
   * Attributes of a badge's remove button.
   *
   * @param value - The chosen value the button removes.
   * @returns DOM attributes.
   */
  removeAttrs(value: string): DomAttributes {
    return {
      type: 'button',
      'aria-label': this.messages().remove(this.labelOf(value)),
      disabled: this.opts.disabled ? '' : undefined,
    }
  }

  // ---------- internals ----------

  /**
   * The key → action table of `handleKeydown`.
   *
   * @param key - `KeyboardEvent.key`.
   * @returns Whether the key was consumed.
   */
  private routeKey(key: string): boolean {
    switch (key) {
      case 'ArrowDown':
        return this.openOrStep(1)
      case 'ArrowUp':
        return this.openOrStep(-1)
      case 'Home':
      case 'End':
        // Closed, Home / End move the caret in the input: leave them to the browser.
        if (!this.isOpen) return false
        this.moveTo(key === 'Home' ? this.firstEnabled() : this.lastEnabled())
        return true
      case 'Enter':
        if (!this.isOpen) return false
        // Open with nothing to choose: Enter stays inert rather than submitting the form.
        if (this.activeValue === null) return true
        this.toggle(this.activeValue)
        return true
      case 'Escape':
        if (this.isOpen) {
          this.close()
          return true
        }
        if (this.query === '') return false
        this.query = ''
        this.commit()
        return true
      case 'Backspace':
        return this.query === '' && this.removeLast()
      default:
        return false
    }
  }

  /**
   * Opens a closed menu on the first (or last) option, or moves the cursor of an open one.
   *
   * @param direction - `1` down, `-1` up.
   * @returns Always `true`: the arrows belong to the combobox.
   */
  private openOrStep(direction: 1 | -1): boolean {
    if (!this.isOpen) {
      this.isOpen = true
      this.activeValue =
        direction === 1 ? this.firstEnabled() : this.lastEnabled()
      this.commit()
      return true
    }
    this.moveTo(this.step(direction))
    return true
  }

  /**
   * Moves the cursor and notifies when it changed.
   *
   * @param value - The new active value.
   */
  private moveTo(value: string | null): void {
    if (value === this.activeValue) return
    this.activeValue = value
    this.commit()
  }

  /**
   * Commits a new selection: internal state when uncontrolled, the announcement, then `onChange`.
   *
   * @param next - The new selection.
   * @param sentence - What the live region says.
   */
  private apply(next: string[], sentence: string): void {
    if (!this.controlled) this.selection = next
    this.announce(sentence)
    this.commit()
    this.opts.onChange?.(next)
  }

  /**
   * Sets the live region's sentence, without notifying. An identical sentence would not be re-read:
   * a trailing no-break space alternates.
   *
   * @param sentence - What the live region says.
   */
  private announce(sentence: string): void {
    this.announcement =
      sentence === this.announcement.replace(NBSP, '') &&
      !this.announcement.endsWith(NBSP)
        ? sentence + NBSP
        : sentence
  }

  /** Closes the menu and drops the cursor, without notifying. */
  private closeMenu(): void {
    this.isOpen = false
    this.activeValue = null
  }

  /**
   * The options matching the query, each with where it matched.
   *
   * @returns The visible options, in the consumer's order.
   */
  private visibleOptions(): VisibleOption[] {
    const searching = this.query.trim() !== ''
    const visible: VisibleOption[] = []
    for (const option of this.opts.options) {
      const match = findMatch(option.label, this.query)
      if (!searching || match) visible.push({ option, match })
    }
    return visible
  }

  /**
   * @returns The values the arrow keys can reach: visible and enabled, in order.
   */
  private navigable(): string[] {
    return this.visibleOptions()
      .filter(({ option }) => !option.disabled)
      .map(({ option }) => option.value)
  }

  /**
   * @param value - An option value.
   * @returns Whether the option is visible and enabled.
   */
  private isNavigable(value: string): boolean {
    return this.navigable().includes(value)
  }

  /**
   * @returns The first reachable value, or `null`.
   */
  private firstEnabled(): string | null {
    return this.navigable()[0] ?? null
  }

  /**
   * @returns The last reachable value, or `null`.
   */
  private lastEnabled(): string | null {
    const list = this.navigable()
    return list[list.length - 1] ?? null
  }

  /**
   * Target of an arrow key, wrapping at the ends and skipping disabled options.
   *
   * @param direction - `1` forward, `-1` backward.
   * @returns The value to point at, or `null` when nothing is reachable.
   */
  private step(direction: 1 | -1): string | null {
    const list = this.navigable()
    if (list.length === 0) return null
    const index =
      this.activeValue === null ? -1 : list.indexOf(this.activeValue)
    if (index === -1) return direction === 1 ? list[0] : list[list.length - 1]
    return list[(index + direction + list.length) % list.length]
  }

  /** Drops a cursor left on an option that is no longer reachable (options or query changed). */
  private reconcileActive(): void {
    if (this.activeValue !== null && !this.isNavigable(this.activeValue))
      this.activeValue = this.isOpen ? this.firstEnabled() : null
  }

  /**
   * @returns The options indexed by value (the first one wins on a duplicate).
   */
  private optionsByValue(): Map<string, MultiSelectOption> {
    const map = new Map<string, MultiSelectOption>()
    for (const option of this.opts.options)
      if (!map.has(option.value)) map.set(option.value, option)
    return map
  }

  /**
   * @param value - A chosen value.
   * @returns Its option's label, or the raw value when no option carries it.
   */
  private labelOf(value: string): string {
    return this.optionsByValue().get(value)?.label ?? value
  }

  /**
   * @returns The messages, the consumer's translations over the English defaults.
   */
  private messages(): MultiSelectMessages {
    return { ...DEFAULT_MESSAGES, ...this.opts.messages }
  }

  /**
   * Reports the misuses the component survives but the consumer should fix: two options sharing a
   * value (the second can never be told apart), a chosen value no option carries (its badge shows the
   * raw value, so the mismatch stays visible).
   */
  private checkContract(): void {
    const warn = this.opts.onWarn
    if (!warn) return
    const seen = new Set<string>()
    for (const { value } of this.opts.options) {
      if (seen.has(value))
        warn(`[multi-select:${this.opts.uid}] duplicate option value: ${value}`)
      seen.add(value)
    }
    for (const value of this.selection)
      if (!seen.has(value))
        warn(
          `[multi-select:${this.opts.uid}] no option for the value: ${value}`
        )
  }
}

/**
 * Whether two item lists render the same.
 *
 * @param a - The previous items.
 * @param b - The next items.
 * @returns `true` when every field matches.
 */
function sameItems(
  a: readonly MultiSelectItem[],
  b: readonly MultiSelectItem[]
): boolean {
  return (
    a.length === b.length &&
    a.every((item, index) => {
      const other = b[index]
      return (
        item.value === other.value &&
        item.label === other.label &&
        item.id === other.id &&
        item.disabled === other.disabled &&
        item.selected === other.selected &&
        item.active === other.active &&
        item.match?.start === other.match?.start &&
        item.match?.end === other.match?.end
      )
    })
  )
}

/**
 * Whether two tag lists render the same.
 *
 * @param a - The previous tags.
 * @param b - The next tags.
 * @returns `true` when every field matches.
 */
function sameTags(
  a: readonly MultiSelectTag[],
  b: readonly MultiSelectTag[]
): boolean {
  return (
    a.length === b.length &&
    a.every(
      (tag, index) =>
        tag.value === b[index].value &&
        tag.label === b[index].label &&
        tag.known === b[index].known
    )
  )
}

/**
 * Creates a {@link MultiSelectService}.
 *
 * @param options - Initial options; `uid` and `options` are required.
 * @returns A new service instance.
 */
export function createMultiSelectService(
  options: MultiSelectOptions
): MultiSelectService {
  return new MultiSelectService(options)
}
