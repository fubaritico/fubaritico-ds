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

## Design System component (packages/reference)

```typescript jsx
import { ComponentName } from '@fubaritico-ds/reference'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof ComponentName> = {
  title: 'Design System/ComponentName',
  component: ComponentName,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    // ... all controllable props
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Interactive playground — one story with args
export const Playground: Story = {
  args: { variant: 'primary', size: 'md', children: 'Label' },
}

// Visual showcase — all variants/sizes/states in one render
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-8">
      <section>
        <h3>Variants</h3>
        <div className="flex gap-3">
          <ComponentName variant="primary" />
          <ComponentName variant="secondary" />
        </div>
      </section>
      {/* sizes, disabled states, with icons, etc. */}
    </div>
  ),
}

// Additional named stories for specific use cases if needed
export const WithIcon: Story = { args: { icon: 'Play' } }
```

**Rules**:

- `layout: 'centered'`
- `tags: ['autodocs']` always
- `Playground` + `Showcase` minimum — add named stories for notable variants
- No mocks, no router — DS components are presentational
- Show ALL variants/sizes/states in `Showcase`

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

For the **react**/**angular** Storybooks, import the generated wrapper from
`@fubaritico-ds/stencil/dist/{react,angular}` and follow the Design System pattern above.

**Rules**:

- `layout: 'centered'`, `tags: ['autodocs']`
- `Playground` + `Showcase` minimum
- No MSW, no router — Web Components are presentational
- See the `stencil` skill for component authoring
