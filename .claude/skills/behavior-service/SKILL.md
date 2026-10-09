---
name: behavior-service
description: Build a component's behaviour as a framework-agnostic service in packages/behaviors (state, registry, keyboard, focus, ARIA attributes — one service per component) plus its thin React adapter in packages/reference. Use when a component needs interactive behaviour shared across frameworks (React, Stencil, Angular, Vue), when porting a component's logic out of React, when writing a "state as a service", a behaviour service, a headless core, or when /state-storage lands on an external store.
allowed-tools: Read Write Edit Bash(pnpm:*) Bash(git:*)
argument-hint: '[component-name]'
metadata:
  author: fubaritico-ds
  version: '1.0'
---

# Behaviour service

A component = **a service** (pure TS, `packages/behaviors/src/<component>/`) that owns the whole
behaviour + **thin adapters** per framework that only render and wire lifecycles. Adapters NEVER
compute an attribute, a key mapping or a selection rule — if they do, the frameworks diverge.

**The template is real code — read it first, copy its shape:**

- Service: `packages/behaviors/src/tabs/{types,tabs-service,tabs-service.test}.ts`
- React adapter: `packages/reference/src/components/Tabs/` + `src/utils/toReactAttributes.ts`
- Design + the 7 defects of the original draft: `files/plans/behaviors-service-pattern.md`

## When (and when not)

`/state-storage` decides the tier. This skill is **how** to write the external store once that skill
says the state must leave the component (shared across frameworks, children registering, keyboard
model, frequent partial updates). A local `useState` toggle does NOT need a service — challenge it.
Organise **by component**; extract something common only when a **second** service needs it (the
store mechanics — listeners / cache / commit / batch — are the expected first extraction).

## Steps

1. **Types** (`types.ts`): descriptor (what a child declares), node (descriptor + computed state),
   **immutable snapshot**, options (every option changeable later), `KeyboardLike`
   (`key`, `preventDefault?`, `altKey?`, `ctrlKey?`, `metaKey?`), `DomAttributes`.
2. **Service class** — the contract (keep the names, adapters rely on them):

   | Member              | Rule                                                                                                           |
   | ------------------- | -------------------------------------------------------------------------------------------------------------- |
   | `getState`          | arrow fn, **memoised** — same reference until a change                                                         |
   | `subscribe(l)`      | arrow fn, returns its unsubscribe                                                                              |
   | `setOptions(patch)` | single entry for props; `'key' in patch` = controlled; notify only if the snapshot changed (`commitIfChanged`) |
   | `register(d)`       | returns ITS unregister; re-registration keeps its rank                                                         |
   | `update` / `batch`  | change without re-registering / one notification for N mutations                                               |
   | `handleKeydown(e)`  | DOM-free; returns whether consumed; `preventDefault` only when consumed                                        |
   | `xxxAttrs(id)`      | DOM spelling, presence semantics (see Gotchas)                                                                 |
   | `focusToken`        | bumped on an explicit focus request only                                                                       |
   | `destroy()`         | optional cleanup, must leave the instance usable                                                               |

3. **Tests in Node** (`*.test.ts`, 5 levels): assert successive snapshots, never render. Cover:
   controlled vs uncontrolled, silent init, intended state before registration, keyboard per
   orientation/dir, modifiers ignored, disabled skipped, removal, batch = 1 notification,
   `setOptions` no-op = 0 notification, attrs only `string | number | undefined`.
4. **Export** from `src/<component>/index.ts` (`export *`, not `export type *`) and `src/index.ts`.
5. **React adapter** (`packages/reference/src/components/<Component>/`):
   - root: `useState(() => injected ?? create(...))`, `useId()` for `uid`, props → `setOptions`
     in `useLayoutEffect`, optional `service` prop (DI), context carries the **instance**;
   - parts: `useSyncExternalStore(service.subscribe, service.getState, service.getState)`, or a
     **sliced** `useXxxSelector` returning a primitive for parts that read one field;
   - children register in `useLayoutEffect(() => service.register({ id }), [service, id])`;
     mutable descriptor fields go through a separate `update` effect;
   - spread order: `{...rest}` THEN `{...toReactAttributes(service.xxxAttrs())}`, then `ref`
     (merged with `useMergedRef`) and composed handlers (consumer first, skip if prevented);
   - props types `Omit` the service-owned attributes.
6. Tests (RTL): existing behaviour + a `<StrictMode>` test + focus actually moves + rtl + an
   injected service. Then README (component-docs plan), story, `/review`, `/commit`.

## Gotchas (each one was hit for real)

- **StrictMode**: never `useMemo` the instance (React may drop it) and never make `destroy()`
  irreversible — StrictMode runs mount → cleanup → mount on the SAME instance; a poisoned service
  silently stops registering children. Don't call `destroy` in the React cleanup at all.
- **No global counter** for ids (`let instanceCount`): singleton + SSR mismatch. `uid` is a required
  option; React passes `useId()` — called unconditionally (`prefix ?? useId()` breaks hook rules).
- **No `process.env`** in the service: `ReferenceError` without a bundler. Warnings go through an
  injected `onWarn`. `tsconfig` has `"types": []` so Node / DOM globals fail to compile.
- **Attributes are never booleans**: Angular bindings and `setAttribute` write `false` as `"false"`
  and the attribute stays. Emit `''` (on) / `undefined` (off). React wants `true` instead — and
  drops `''` on a boolean attribute — so `toReactAttributes` converts `hidden`, `disabled`…
- **Initialisation is silent**: resolving the default / provisional selection must not fire
  `onChange` — a consumer's `not.toHaveBeenCalled()` breaks, and it is not a user change.
- **Expose the intended state before registration** (first render, SSR): otherwise every panel
  renders hidden on the server.
- **An "always select something" fallback must respect an intended empty state**
  (`setActive(null)`, `removalPolicy: 'none'`) — the draft overwrote it.
- **`focusToken`**: an adapter focuses when the token **changes** for its node, never because
  `focused` is true (that steals focus on mount). Track the last token even when not focused.
- **Keyboard**: return early on `altKey/ctrlKey/metaKey` (browser / AT shortcuts); swap horizontal
  arrows when `dir === 'rtl'` (the adapter reads the closest `[dir]`); reset roving focus when focus
  leaves the composite (`resetFocus`) so Tab re-enters on the selected item.
- **ES2020 lib**: no `.at()`, no `replaceAll` in `packages/behaviors`.
- **Sliced selectors return primitives**: a derived object is a new reference per read → infinite
  re-render (`useSyncExternalStore`).
- **A whole-snapshot subscription is fine for a handful of children** (Tabs) but O(N) re-renders
  for lists / grids / pointermove — use selectors there.
- **jsdom**: `user.tab()` lands on a focusable panel, not on the next button — panels have
  `tabIndex=0`. External store updates in tests go through `act()`.
- Other frameworks (Stencil spreads `<Host {...attrs}>`, Angular needs an attribute directive) are
  Phase D — the service contract must already allow them; don't write them now.
