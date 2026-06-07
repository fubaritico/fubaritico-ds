---
name: story
description: Create a Storybook story for a component. Mandatory after every component creation. Use when a new component is created or when adding stories to existing components.
allowed-tools: Read Write
argument-hint: "[ComponentName]"
metadata:
  version: "1.0"
---

# Story

Create a Storybook story for a component. Mandatory after every component creation.

Reference: @.claude/rules/component-patterns.md

## Arguments
`$ARGUMENTS` = component name (e.g. `Cast`, `Button`, `Avatar`)

---

## Design System component (packages/reference or packages/layouts)

```typescript jsx
import { ComponentName } from '@fubaritico-ds/ui'
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
- No MSW, no `withRouter`
- Show ALL variants/sizes/states in `Showcase`

---

## App component (apps/media, apps/home — embedded query)

```typescript jsx
import { ComponentName } from '@fubaritico-ds/media'  // or /home
import { componentHandlers } from '@fubaritico-ds/shared/mocks'
import { withRouter } from '../../.storybook/decorators/withRouter'
import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Media/ComponentName',  // or 'Home/ComponentName'
  component: ComponentName,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ComponentName>

export default meta
type Story = StoryObj<typeof meta>

export const Movie: Story = {
  parameters: { msw: { handlers: [componentHandlers.default] } },
  decorators: [withRouter('/movie/278')],
}
export const Loading: Story = {
  parameters: { msw: { handlers: [componentHandlers.loading] } },
  decorators: [withRouter('/movie/278')],
}
export const Error: Story = {
  parameters: { msw: { handlers: [componentHandlers.error] } },
  decorators: [withRouter('/movie/278')],
}
```

**Rules**:
- `layout: 'fullscreen'`
- `satisfies Meta<>` syntax (not `Meta<typeof X> =`)
- Always 3 stories: success (Movie/Default) + Loading + Error
- MSW handlers from `@fubaritico-ds/shared/mocks`
- `withRouter` per story (curried with route), `withQueryClient` is global
