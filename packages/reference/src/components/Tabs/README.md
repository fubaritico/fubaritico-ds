# Tabs

Switches between sibling panels, following the ARIA tabs pattern. Controlled or uncontrolled. A thin
React adapter over `TabsService` from `@fubaritico/behaviors`, which owns the behaviour.

## Capabilities

- **Two looks** — `underline` (a rule under the row, active tab marked by a segment) and `pills`
  (a tinted track of capsules).
- **Controlled or not** — `defaultValue` for uncontrolled, `value` + `onValueChange` for controlled.
- **Roving tab order** — exactly one trigger is tabbable; arrows move focus between them.
- **Keyboard navigation** — Arrow Left / Right, Home / End, skipping disabled tabs; wrapping by
  default (`loop`). Arrows follow the text direction (`dir="rtl"` swaps them); modified keys
  (Alt / Ctrl / Cmd + Arrow) are left to the browser.
- **Two activation modes** — `automatic` (arrows select) or `manual` (arrows focus, Enter / Space
  selects — for panels that are expensive to show).
- **Dynamic tab lists** — triggers register on mount and leave on unmount; removing the active tab
  selects its neighbour and reports it through `onValueChange`.
- **Wired ARIA** — `role="tablist"` / `"tab"` / `"tabpanel"`, with `aria-selected`,
  `aria-controls` and `aria-labelledby` generated and linked for you.
- **Unique ids** — generated per instance; `prefix` only when you need predictable ids.
- **Injectable behaviour** — pass a `service` built with `createTabsService` to drive the tabs from
  outside the tree (or a stub in a test).
- **Optional glyph** — `icon` renders before the label.
- **No layout shift** — the underline's space is reserved on every tab, so activating one moves
  nothing.
- **Composition guards** — the parts throw outside their parent.

> **N/A — lazy panels.** Every `Tabs.Panel` stays mounted and is hidden with the `hidden`
> attribute. Mount panels conditionally yourself if rendering them is expensive.

## Import

```tsx
import { Tabs } from '@fubaritico/react/Tabs'
```

## Basic usage

```tsx
<Tabs defaultValue="overview">
  <Tabs.List aria-label="Account">
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
  </Tabs.List>

  <Tabs.Panel value="overview">The overview.</Tabs.Panel>
  <Tabs.Panel value="activity">The activity feed.</Tabs.Panel>
</Tabs>
```

## Variants & options

The two looks — pass `variant` on the root; the list and triggers follow:

```tsx
<Tabs defaultValue="a" variant="underline">…</Tabs>
<Tabs defaultValue="a" variant="pills">…</Tabs>
```

Manual activation, and no wrapping at the ends:

```tsx
<Tabs defaultValue="a" activation="manual" loop={false}>
  …
</Tabs>
```

Controlled, when the selection lives in your state:

```tsx
const [tab, setTab] = useState('overview')

<Tabs value={tab} onValueChange={setTab}>…</Tabs>
```

Disabled tabs — listed, but skipped by the arrow keys:

```tsx
<Tabs.Trigger value="billing" disabled>
  Billing
</Tabs.Trigger>
```

With a glyph:

```tsx
<Tabs.Trigger
  value="starred"
  icon={<Icon name="Star" size={16} aria-hidden="true" />}
>
  Starred
</Tabs.Trigger>
```

Predictable ids (`tab-popular-a`, `tabpanel-popular-a`), e.g. for deep links or tests:

```tsx
<Tabs defaultValue="a" prefix="popular">
  …
</Tabs>
```

Driving the tabs from outside the tree — inject the service:

```tsx
import { createTabsService } from '@fubaritico/behaviors'

const settingsTabs = createTabsService({ uid: 'settings', defaultActiveId: 'profile' })

<Tabs service={settingsTabs}>…</Tabs>
<button onClick={() => settingsTabs.setActive('billing')}>Go to billing</button>
```

A panel whose content starts with a link, button or field — drop its own tab stop:

```tsx
<Tabs.Panel value="billing" focusable={false}>
  <a href="/invoices">Invoices</a>
</Tabs.Panel>
```

Driving the tabs from a sibling component inside `<Tabs>`:

```tsx
import { useTabsController } from '@fubaritico/react/Tabs'

function NextButton() {
  const { service } = useTabsController()
  return <button onClick={() => service.focusNext()}>Next</button>
}
```

## Edge cases

```tsx
{
  /* A single tab is valid — arrow keys simply stay put */
}
;<Tabs defaultValue="only">
  <Tabs.List>
    <Tabs.Trigger value="only">Only</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="only">Content</Tabs.Panel>
</Tabs>

{
  /* A defaultValue matching no trigger falls back to the first enabled tab;
     a controlled value matching no trigger selects nothing */
}

{
  /* A defaultValue naming a tab that mounts later takes over when it arrives,
     unless the user has already picked a tab */
}

{
  /* Panels need not be adjacent to the list — only the values must match */
}
```

## Props

### `Tabs`

| Name                     | Type                      | Default       | Description                                      |
| ------------------------ | ------------------------- | ------------- | ------------------------------------------------ |
| `defaultValue`           | `string`                  | `''`          | Initially selected tab when uncontrolled.        |
| `value`                  | `string`                  | —             | Selected tab when controlled.                    |
| `onValueChange`          | `(value: string) => void` | —             | Called with the newly selected value.            |
| `variant`                | `'underline' \| 'pills'`  | `'underline'` | Visual look, inherited by the list and triggers. |
| `prefix`                 | `string`                  | unique id     | Fixed namespace for the generated ids.           |
| `activation`             | `'automatic' \| 'manual'` | `'automatic'` | Whether the arrows select or only move focus.    |
| `loop`                   | `boolean`                 | `true`        | Whether the arrows wrap around the ends.         |
| `service`                | `TabsService`             | created       | Injected behaviour service; read once at mount.  |
| …`ComponentProps<'div'>` | —                         | —             | Everything else lands on the root.               |

### `Tabs.Trigger`

| Name       | Type        | Default | Description                                     |
| ---------- | ----------- | ------- | ----------------------------------------------- |
| `value`    | `string`    | —       | Identifies the tab and its panel. **Required.** |
| `icon`     | `ReactNode` | —       | Optional leading glyph.                         |
| `disabled` | `boolean`   | `false` | Listed but not selectable; skipped by arrows.   |

`Tabs.List` takes plain `<div>` props; `Tabs.Panel` takes `<div>` props plus a required `value` and
`focusable` (`boolean`, default `true`). The ARIA attributes the behaviour owns (`role`, `id`,
`tabIndex`, `aria-selected`, `aria-controls`, `aria-labelledby`, `hidden`) are not accepted as props.
A consumer `onClick` (trigger) or `onKeyDown` (list) runs first; call `event.preventDefault()` in it
to cancel the built-in behaviour.

## Accessibility

- The row is `role="tablist"` with `aria-orientation`, each trigger `role="tab"` with `aria-selected`, each panel
  `role="tabpanel"` labelled by its trigger. The links are generated from `value` (and `prefix`).
- **Roving `tabIndex`**: one tab is in the page tab order, so Tab enters and leaves the row in one
  step while the arrows move DOM focus within it — the behaviour the pattern requires.
- Panels are focusable (`tabIndex=0`) by default, as the APG requires when a panel starts with no
  focusable content; `focusable={false}` removes the redundant stop otherwise.
- In `manual` activation, leaving the row resets the tab stop to the **selected** tab, so Tab
  re-enters where the APG expects.
- **Name the tablist**: give `Tabs.List` an `aria-label` or `aria-labelledby`.
- Disabled triggers are real disabled `<button>`s: skipped by the keyboard, announced as
  unavailable.
- The focus ring is `:focus-visible`, so it appears for keyboard users and not on click.
- The colour transition is dropped under `prefers-reduced-motion` (WCAG 2.3.3).

## Notes

> **Warning** — if you pass `prefix`, make it unique on the page: two Tabs sharing a prefix
> generate identical ids, which breaks `aria-controls`. Without `prefix`, ids are unique already.

> **Warning** — render one `Tabs.Panel` per `Tabs.Trigger`, with the same `value`. Each trigger's
> `aria-controls` points at its panel's id; a missing panel leaves a dangling reference.

> **Note** — the text direction is read from the closest `dir` attribute when the list mounts; a
> later change of `dir` is not picked up.

> **Note** — `onValueChange` is not called while the initial selection resolves (mount, a late
> `defaultValue` tab arriving) — only for a user's choice or a removed active tab.

> **Note** — `variant` is set on the **root** only. The list and triggers read it from context;
> passing it to them directly is neither possible nor needed.

> **Note** — panels stay mounted and are hidden with `hidden`, so their state survives a tab
> switch. If a panel is costly to render, mount it conditionally yourself.

> **Note** — the active pill flips both its background and its text colour together. If you
> override `--ui-tabs-trigger-active-bg`, override `--ui-tabs-trigger-active-fg` too, or you will
> recreate the dark-on-dark pairing this migration fixed.
