---
name: state-storage
description: Choose and scaffold the right state level for a component — local React state, createStore, Zustand, or a simplified Machine. Use when a component needs to hold or share state, when adding stateful/interactive behavior, when re-render or state-complexity grows, when wiring keyboard/focus/active-item logic, or when deciding how state crosses components. Challenges toward the lightest sufficient option (the "spectrum of storage").
allowed-tools: Read Write Edit
metadata:
  author: fubaritico-ds
  version: '1.0'
---

# State Storage — pick the lightest sufficient level

> Decision-first skill. A component's state is a **liability**: prefer the lightest tier that works.
> Four tiers, escalate **only** when concrete criteria are met. Full code + lifecycles live in the
> reference doc — load it when scaffolding: `references/state-externalization.md`.

## When this triggers

A component needs to hold state, share state across components, manage an active-item/open-closed/
keyboard interaction, or its re-render/state complexity is growing. Also when the developer asks
"where should this state live?" or proposes Zustand/Redux/a context/a store.

## The four tiers (lightest → heaviest)

| Tier                        | What                                                                                 | Selectors        | When                                                                            | Pertinent component           |
| --------------------------- | ------------------------------------------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------- | ----------------------------- |
| **1. Local**                | `useState` / `useReducer` (+ Context only to pass down)                              | n/a              | The default. State belongs to one component (or a tiny subtree).                | Switch, Checkbox, Input, Tabs |
| **2. `createStore`**        | Closure store (`getSnapshot`/`subscribe`/`dispatch`) + native `useSyncExternalStore` | ❌ (whole-value) | A small **global singleton** everyone reads in full. **Zero dependency.**       | Scroll-lock (Modal/Drawer)    |
| **3. Zustand**              | Store **with built-in selectors** + `create` (external ~1 KB dep)                    | ✅ built-in      | **Global imperative API** callable from anywhere (even outside React).          | Toaster / notifications       |
| **4. Machine (simplified)** | Class `state + reduce + send + subscribe` + `useSyncExternalStoreWithSelector`       | ✅ via hook      | **Complex component brain**: many children reading different slices + keyboard. | Listbox, Typeahead            |

## Decision flow (challenge-by-default)

**Start at Tier 1. Escalate only when a criterion below is genuinely met. State the reasoning out loud
and recommend the lightest option that satisfies it.** Do not adopt a heavier tier "to be safe".

1. **Stay Tier 1 (local)** unless the state must be **read by components outside this one's render**, or
   re-render cost is provably hurting. Most DS atoms/molecules never leave Tier 1.
2. **Go Tier 2 (`createStore`)** when the state is a **small global singleton** that consumers read **in
   full** (no per-slice subscription): scroll-lock, theme/density, a global "top layer" flag. Prefer
   this over Zustand when you want **zero dependency**.
3. **Go Tier 3 (Zustand)** **only** when you need a **global imperative API** triggerable from anywhere
   (`toast()`, `openCommandPalette()`) **and** fine-grained subscriptions, **and** the team accepts the
   dependency. Otherwise Tier 2 + a manual selector does the same.
4. **Go Tier 4 (Machine)** **only** when **two or more** of these hold:
   - many children each reading a **different slice** of the same state (e.g. 100+ options);
   - **frequent, partial** updates (keyboard navigation, type-to-search);
   - **cross-instance coordination** (stacked overlays closing each other);
   - non-trivial keyboard/focus/active-descendant logic.
     If only one holds, a Tier-1 `useReducer` usually still wins.

### The re-render argument (why Tier 4 exists)

Context delivers its **whole** value: any change re-renders **all** consumers → `O(N)` on N children.
A Machine + per-slice subscription re-renders only the children whose slice changed → ~`O(1)`. This gain
is **real only at scale** (many children + frequent partial change). For few children, Context wins on
simplicity. (Background analysis, if present locally: `files/analysis/headlessui-context-vs-machine.md`.)

## Per-component mapping (this repo's queue)

| Component                    | Tier                            | Notes                                                      |
| ---------------------------- | ------------------------------- | ---------------------------------------------------------- |
| Switch / Checkbox / Input    | 1 local                         | `useControllable` + `useId`                                |
| Tooltip                      | 1 local                         | `useId`, disposables (delay)                               |
| Modal / Drawer / BottomSheet | 2 `createStore` (scroll-lock)   | + `useEscape`, focus-trap, `useId`                         |
| Menu / Dropdown / Tabs       | 1 local (or Tier 4 if it grows) | keyboard + `useOutsideClick`                               |
| Listbox                      | 4 Machine                       | `useMachineSlice`, keyboard, `useOutsideClick`             |
| Typeahead (Combobox)         | 4 Machine                       | + `on`/stacking later; `useControllable`, `useLatestValue` |
| Toaster / notifications      | 3 Zustand                       | global imperative `toast()`                                |

## Scaffolding (where the code goes)

Framework-agnostic cores (no React/DOM) → a future **`packages/behaviors`** (pure TS, mirrors the
`@fubaritico-ds/variants` decision). React glue (`useMachineSlice`, hooks) → a React-flavored package or
co-located. **Do not put React in the agnostic core.** Tier-1 stays inside the component.

For the actual code of each tier (the `createStore` factory, the Zustand store, the **simplified
`Machine` class** + `useMachineSlice` glue + a `ListboxMachine` example, plus the dependency-free
`useSyncExternalStore` variant and its **gotcha** with derived slices) and the reusable behavior-hooks
catalog (`useEvent`, `useControllable`, `useOutsideClick`, `useEscape`, scroll-lock, focus-trap, …):

→ **Load `references/state-externalization.md` and copy the relevant tier.** For the **full source of the
behavior hooks** (useEvent, useControllable, useOutsideClick, useEscape, useDisposables, …), load
`references/behavior-hooks-source.md` (real code, ordered by dependencies).

## Rules

- **Lightest sufficient wins.** Never escalate without naming the met criterion.
- **Agnostic core stays React/DOM-free** (Tier 2/4 cores) — only the glue is framework-specific.
- **`useSyncExternalStore` gotcha**: native is zero-dep but a **derived** slice (new object each call)
  loops; use `useSyncExternalStoreWithSelector` (official ~1 KB) or memoize. Whole/stable slice → native.
- **Headless mindset**: behaviour is the asset; this skill decides _where state lives_, not styling.
- Behaviour hooks (focus, escape, outside-click, controllable) are **reusable at every tier** — reach for
  them before reaching for a heavier store tier.

## Output

State the chosen tier + the criterion that justifies it (or "Tier 1, no criterion met"), then scaffold
from the reference doc. If the developer proposed a heavier tier, push back with the lighter alternative
and the trade-off before complying.
