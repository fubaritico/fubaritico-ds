// Plain Button — CSS-free + router-free subpath (no Tailwind, no react-router-dom in Storybook).
import { Button } from '@fubaritico-ds/reference/Button'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * Button — the design-system plain button on the native BEM skin (`@fubaritico-ds/styles`),
 * variant/size/icon-position resolved by `@fubaritico-ds/variants`.
 */
const meta = {
  title: 'Reference/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive', 'outline', 'ghost'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    iconPosition: { control: 'inline-radio', options: ['left', 'right'] },
    children: { control: 'text' },
    icon: { control: 'text' },
    onClick: { table: { disable: true } }, // callback — hidden from the controls table
  },
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

/** Interactive playground driven by the controls panel. */
export const Playground: Story = {}

/** Every case (variants + sizes + icon + disabled) in one view; controls disabled. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Button icon="XMark">Icon left</Button>
        <Button icon="XMark" iconPosition="right">
          Icon right
        </Button>
        <Button disabled>Disabled</Button>
      </div>
    </div>
  ),
}
