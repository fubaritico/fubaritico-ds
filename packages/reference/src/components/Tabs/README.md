# Tabs

Switches between sibling panels, following the ARIA tabs pattern. Controlled or uncontrolled.

## Capabilities

- **Two looks** — `underline` (a rule under the row, active tab marked by a segment) and `pills`
  (a tinted track of capsules).
- **Controlled or not** — `defaultValue` for uncontrolled, `value` + `onValueChange` for controlled.
- **Roving tab order** — exactly one trigger is tabbable; arrows move between them.
- **Keyboard navigation** — Arrow Left / Right (wrapping), skipping disabled tabs.
- **Wired ARIA** — `role="tablist"` / `"tab"` / `"tabpanel"`, with `aria-selected`,
  `aria-controls` and `aria-labelledby` generated and linked for you.
- **Namespaced ids** — `prefix` keeps several Tabs on one page from colliding.
- **Optional glyph** — `icon` renders before the label.
- **No layout shift** — the underline's space is reserved on every tab, so activating one moves
  nothing.
- **Composition guards** — the parts throw outside their parent.

> **N/A — lazy panels.** Every `Tabs.Panel` stays mounted and is hidden with the `hidden`
> attribute. Mount panels conditionally yourself if rendering them is expensive.

## Import

```tsx
import { Tabs } from '@fubaritico-ds/reference/Tabs'
```

## Basic usage

```tsx
<Tabs defaultValue="overview">
  <Tabs.List>
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

Two independent Tabs on one page:

```tsx
<Tabs defaultValue="a" prefix="popular">…</Tabs>
<Tabs defaultValue="a" prefix="recent">…</Tabs>
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
  /* A defaultValue matching no trigger selects nothing; every panel stays hidden */
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
| `prefix`                 | `string`                  | —             | Namespaces the generated ids.                    |
| …`ComponentProps<'div'>` | —                         | —             | Everything else lands on the root.               |

### `Tabs.Trigger`

| Name       | Type        | Default | Description                                     |
| ---------- | ----------- | ------- | ----------------------------------------------- |
| `value`    | `string`    | —       | Identifies the tab and its panel. **Required.** |
| `icon`     | `ReactNode` | —       | Optional leading glyph.                         |
| `disabled` | `boolean`   | `false` | Listed but not selectable; skipped by arrows.   |

`Tabs.List` takes plain `<div>` props; `Tabs.Panel` takes `<div>` props plus a required `value`.

## Accessibility

- The row is `role="tablist"`, each trigger `role="tab"` with `aria-selected`, each panel
  `role="tabpanel"` labelled by its trigger. The links are generated from `value` (and `prefix`).
- **Roving `tabIndex`**: only the selected tab is in the page tab order, so Tab enters and leaves
  the row in one step while the arrows move within it — the behaviour the pattern requires.
- Disabled triggers are real disabled `<button>`s: skipped by the keyboard, announced as
  unavailable.
- The focus ring is `:focus-visible`, so it appears for keyboard users and not on click.
- The colour transition is dropped under `prefers-reduced-motion` (WCAG 2.3.3).

## Notes

> **Warning** — `prefix` is what keeps two Tabs on the same page from generating identical ids.
> Without it, duplicate `id`s break `aria-controls` and the panels announce the wrong tab.

> **Note** — `variant` is set on the **root** only. The list and triggers read it from context;
> passing it to them directly is neither possible nor needed.

> **Note** — panels stay mounted and are hidden with `hidden`, so their state survives a tab
> switch. If a panel is costly to render, mount it conditionally yourself.

> **Note** — the active pill flips both its background and its text colour together. If you
> override `--ui-tabs-trigger-active-bg`, override `--ui-tabs-trigger-active-fg` too, or you will
> recreate the dark-on-dark pairing this migration fixed.
