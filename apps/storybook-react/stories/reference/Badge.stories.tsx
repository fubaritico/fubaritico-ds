// Import from the per-component subpath (CSS-free), NOT the package barrel
// (`@fubaritico-ds/reference`) whose `import './styles.css'` side-effect pulls Tailwind preflight
// into the skin-based Storybook and strips the skin's box-model. See the /story skill.
import { Badge } from '@fubaritico-ds/reference/Badge'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * Badge — first component migrated to the native BEM skin (`@fubaritico-ds/styles`),
 * variant/size resolved by `@fubaritico-ds/variants`. Validates the whole chain visually.
 */
const meta = {
  title: 'Reference/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'destructive'],
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    children: { control: 'text' },
    icon: { control: 'text' },
  },
  args: {
    children: 'Badge',
    variant: 'default',
    size: 'md',
  },
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

/** Interactive playground driven by the controls panel. */
export const Playground: Story = {}

/** Every case (all variants + all sizes) in one view; controls disabled. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Badge variant="default">Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Badge size="sm">Small</Badge>
        <Badge size="md">Medium</Badge>
        <Badge size="lg">Large</Badge>
      </div>
    </div>
  ),
}
