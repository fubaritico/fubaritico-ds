/** An option the consumer offers. `value` is what the selection holds; `label` what is shown. */
export interface MultiSelectOption {
  /** Identifier kept in the selection; unique among the options. */
  value: string
  /** Text shown in the menu and on the badge; also what the search matches. */
  label: string
  /** Listed but neither selectable nor reachable by the arrow keys. */
  disabled?: boolean
}

/** Where the matched query sits in an option's label: `[start, end)` in the label's own indices. */
export interface MultiSelectMatch {
  /** Index of the first matched character. */
  start: number
  /** Index after the last matched character. */
  end: number
}

/** A visible option as the snapshot exposes it: the option plus its computed state. */
export interface MultiSelectItem extends MultiSelectOption {
  /** DOM id of the option element (the target of `aria-activedescendant`). */
  id: string
  /** Whether the option is in the selection. */
  selected: boolean
  /** Whether the option holds the keyboard cursor. */
  active: boolean
  /** Where the query matches its label, or `null` without a query. */
  match: MultiSelectMatch | null
}

/** A chosen value as a badge shows it. */
export interface MultiSelectTag {
  /** The chosen value. */
  value: string
  /** The option's label — or the raw value when no option carries it (`known: false`). */
  label: string
  /** `false` when the value matches no option: shown as is, so the mismatch stays visible. */
  known: boolean
}

/** A DOM focus move the adapter performs when `focusToken` changes. */
export type MultiSelectFocusTarget =
  | { kind: 'input' }
  | { kind: 'remove'; value: string }

/** The sentences the component says, to translate. Each receives the option's label. */
export interface MultiSelectMessages {
  /** Accessible name of a badge's remove button; defaults to `Remove <label>`. */
  remove: (label: string) => string
  /** Announced when an option is chosen; defaults to `<label> added`. */
  added: (label: string) => string
  /** Announced when a choice is removed; defaults to `<label> removed`. */
  removed: (label: string) => string
  /** Announced when a search leaves matches; defaults to `1 result` / `<count> results`. */
  results: (count: number) => string
  /** The row shown, and announced, when no option matches the query; defaults to `No results`. */
  noResults: string
}

/**
 * Immutable snapshot of the service. A new reference is created on every change and only then, so
 * it plugs directly into any framework's external-store subscription.
 */
export interface MultiSelectSnapshot {
  /** Whether the menu is open. */
  open: boolean
  /** The search text typed in the input. */
  query: string
  /** The selection, in the order it was made. */
  value: readonly string[]
  /** The selection as badges, in the same order. */
  tags: readonly MultiSelectTag[]
  /** The options matching the query (all of them without one), in the consumer's order. */
  items: readonly MultiSelectItem[]
  /** The value under the keyboard cursor, or `null`. */
  activeValue: string | null
  /** Whether the whole control is disabled. */
  disabled: boolean
  /** The last settled change, for a polite live region (`''` before any). */
  announcement: string
  /** The text of the "no results" row. */
  noResultsText: string
  /** Where the adapter must move DOM focus when `focusToken` changes, or `null`. */
  focusTarget: MultiSelectFocusTarget | null
  /**
   * Incremented only when a DOM focus move is requested (a badge removed by its button). An adapter
   * moves focus when this changes — never on mount.
   */
  focusToken: number
}

/** Options of a {@link MultiSelectService}. Every one may be changed later through `setOptions`. */
export interface MultiSelectOptions {
  /**
   * Namespace of the generated ids. Inject a value unique per instance (your framework's id
   * generator): the service keeps no global counter.
   */
  uid: string
  /** The options offered, in display order. */
  options: readonly MultiSelectOption[]
  /**
   * Controlled selection. The **presence** of the key means controlled. Absent or `undefined` =
   * uncontrolled, starting from `defaultValue`.
   */
  value?: readonly string[]
  /** Initial selection when uncontrolled. */
  defaultValue?: readonly string[]
  /** Disables the whole control: no menu, no choice, no removal. */
  disabled?: boolean
  /** Translations of the sentences the component says; missing ones keep their English default. */
  messages?: Partial<MultiSelectMessages>
  /** Called with the new selection after a user choice or removal. Not called on initialisation. */
  onChange?: (value: string[]) => void
  /** Called on a non-fatal misuse (a duplicate option value, a value no option carries). */
  onWarn?: (message: string) => void
}
