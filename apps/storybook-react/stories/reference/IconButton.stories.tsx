// Icon-only button — CSS-free subpath (no Tailwind leak in Storybook).
import { IconButton } from '@fubaritico-ds/reference/IconButton'

import type { Meta, StoryObj } from '@storybook/react-vite'

/** Dark panel used to demonstrate the on-dark `ghost-dark` variant (neutral-900). */
const DARK_SURFACE_BG = '#171717'

/**
 * IconButton — a circular, icon-only extension of `Button` (Open/Closed). It reuses Button's
 * variants/skin and layers on the icon-fitting shape (`@fubaritico-ds/variants` → `.ui-icon-button`).
 * The on-dark `ghost-dark` variant is IconButton-only and is meant for dark surfaces (e.g. a dark drawer header).
 */
const meta = {
  title: 'Reference/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'ghost-dark'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    icon: { control: 'text' },
    'aria-label': { control: 'text' },
    onClick: { table: { disable: true } }, // callback — hidden from the controls table
  },
  args: {
    icon: 'Heart',
    variant: 'ghost',
    size: 'md',
    'aria-label': 'Like',
  },
} satisfies Meta<typeof IconButton>

export default meta

type Story = StoryObj<typeof meta>

/** Interactive playground driven by the controls panel. */
export const Playground: Story = {}

/** Every case (variants + sizes + disabled + on-dark) in one view; controls disabled. */
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
        <IconButton icon="Plus" aria-label="Add" variant="primary" />
        <IconButton icon="Plus" aria-label="Add" variant="secondary" />
        <IconButton icon="Plus" aria-label="Add" variant="outline" />
        <IconButton icon="Plus" aria-label="Add" variant="ghost" />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <IconButton icon="Heart" aria-label="Like" size="sm" />
        <IconButton icon="Heart" aria-label="Like" size="md" />
        <IconButton icon="Heart" aria-label="Like" size="lg" />
        <IconButton icon="XMark" aria-label="Close" disabled />
      </div>
      {/* ghost-dark is meant for dark surfaces — shown on a dark panel */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          background: DARK_SURFACE_BG,
        }}
      >
        <IconButton
          icon="ChevronLeft"
          aria-label="Previous"
          variant="ghost-dark"
        />
        <IconButton
          icon="ChevronRight"
          aria-label="Next"
          variant="ghost-dark"
        />
        <IconButton icon="XMark" aria-label="Close" variant="ghost-dark" />
      </div>
    </div>
  ),
}
