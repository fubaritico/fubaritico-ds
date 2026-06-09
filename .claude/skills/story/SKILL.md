---
name: story
description: Create a Storybook story for a component. Mandatory after every component creation. Use when a new component is created or when adding stories to existing components.
allowed-tools: Read Write
argument-hint: '[ComponentName]'
metadata:
  version: '1.0'
---

# Story

Create a Storybook story for a component. Mandatory after every component creation.

Reference: @.claude/rules/patterns-ui.md

## Arguments

`$ARGUMENTS` = component name (e.g. `Cast`, `Button`, `Avatar`)

---

## Design System component → `apps/storybook-react` (Storybook 10)

Stories live **IN the app**, NOT co-located:
`apps/storybook-react/stories/reference/<Component>.stories.tsx`, importing the built component from
`@fubaritico-ds/reference`. Group under **`Reference/*`** (the Stencil-generated React wrappers go under
`Generated/*` later). `layout: 'centered'` AND the native skin (tokens + `@fubaritico-ds/styles`) are
set **globally** in `.storybook/preview.ts` — do NOT repeat `layout` per meta, and do NOT use Tailwind.

```typescript jsx
import { ComponentName } from '@fubaritico-ds/reference'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Reference/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    // Hide non-control rows (see "Disabling controls" below):
    onClose: { table: { disable: true } }, // callbacks
    open: { table: { disable: true } }, // controlled state
    children: { table: { disable: true } }, // JSX slots (keep as a control ONLY if it's plain text)
  },
  args: { variant: 'primary', size: 'md' },
} satisfies Meta<typeof ComponentName>

export default meta
type Story = StoryObj<typeof meta>

// Interactive playground — driven by the controls panel
export const Playground: Story = {}

// Visual showcase — render-only, all variants in one view. NO Tailwind → inline styles.
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <ComponentName variant="primary" />
      <ComponentName variant="secondary" />
    </div>
  ),
}
```

### Disabling controls (house convention — two DIFFERENT tools)

- **Hide a single prop's row** → `argTypes: { prop: { table: { disable: true } } }`. Use for
  **callbacks** (`onClose`, `onChange`), **JSX slot props** (`children` when not plain text), and
  **controlled-state** props (`open`, `value`). Keeps the real controls (`variant`, `size`) usable.
- **Disable the WHOLE controls panel** → `parameters: { controls: { disable: true } }`. Use ONLY for
  pure `render()` showcase stories that ignore args entirely.

**Rules**:

- Types from `@storybook/react-vite` (Storybook 10), NOT `@storybook/react`.
- `satisfies Meta<typeof Component>` + `type Story = StoryObj<typeof meta>` (typed args/argTypes).
- `tags: ['autodocs']` always. `layout: 'centered'` is global (preview) — don't repeat it.
- NO Tailwind classes in stories (the React Storybook loads only tokens + the native skin) — use inline
  styles or the component's own BEM classes for showcase layout.
- `Playground` (controls) + at least one render-showcase minimum — add named stories for notable variants.
- No mocks, no router — DS components are presentational. Only story-ize components already migrated to the skin.

---

## Stencil Web Component (packages/stencil)

Showcased in the per-framework Storybook apps (`apps/storybook-*` — scaffolds, not wired yet).
For the **web-component** Storybook, render the custom element directly by its tag:

```typescript jsx
import type { Meta, StoryObj } from '@storybook/web-components'
import { html } from 'lit'

const meta: Meta = {
  title: 'Web Components/ui-component-name',
  component: 'ui-component-name',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}

export default meta
type Story = StoryObj

export const Playground: Story = {
  args: { variant: 'primary', size: 'md' },
  render: (args) =>
    html`<ui-component-name
      variant=${args.variant}
      size=${args.size}
    ></ui-component-name>`,
}
```

For the **react** Storybook, put generated-wrapper stories in
`apps/storybook-react/stories/generated/<Component>.stories.tsx`, group `Generated/*`, importing the
wrapper from `@fubaritico-ds/stencil/dist/react` and types from `@storybook/react-vite` — same pattern
as the Design System section above. (Angular/Vue/web-component get their own per-framework apps.)

**Rules**:

- `layout: 'centered'`, `tags: ['autodocs']`
- `Playground` + `Showcase` minimum
- No MSW, no router — Web Components are presentational
- See the `stencil` skill for component authoring
