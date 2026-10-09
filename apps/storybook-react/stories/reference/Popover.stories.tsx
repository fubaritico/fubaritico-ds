import { Button } from '@fubaritico/react/Button'
import { Popover } from '@fubaritico/react/Popover'
import { Typography } from '@fubaritico/react/Typography'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Reference/Popover',
  component: Popover,
  tags: ['autodocs'],
  argTypes: {
    children: { table: { disable: true } },
    open: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
    service: { table: { disable: true } },
  },
  args: { label: 'Details', children: null },
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

/** Click the button; Escape or a click outside closes it and focus returns to the button. */
export const Playground: Story = {
  render: (args) => (
    <Popover label={args.label}>
      <Popover.Trigger className="ui-button ui-button--outline">
        Details
      </Popover.Trigger>
      <Popover.Content>
        <div style={{ display: 'grid', gap: '0.5rem', maxInlineSize: '16rem' }}>
          <Typography variant="body2">
            Anchored to its trigger, rendered by the browser in the top layer —
            above everything.
          </Typography>
          <Button size="sm">Action</Button>
        </div>
      </Popover.Content>
    </Popover>
  ),
}

/**
 * Inside a clipped, z-indexed box and under a z-index 9999 banner: the popover still renders on top
 * and is not clipped. No portal involved.
 */
export const AboveEverything: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
          blockSize: '4rem',
          padding: '0.75rem',
          border: '1px dashed currentColor',
        }}
      >
        <Popover label="Clipped container">
          <Popover.Trigger className="ui-button ui-button--outline">
            Open from a clipped box
          </Popover.Trigger>
          <Popover.Content>
            <Typography variant="body2">Not clipped, not covered.</Typography>
          </Popover.Content>
        </Popover>
      </div>
      <div
        // Pulled up over the spot where the popover opens: the popover still wins.
        style={{
          position: 'relative',
          zIndex: 9999,
          marginBlockStart: '-2.5rem',
          padding: '0.5rem',
          background: 'rgb(220 220 220 / 0.9)',
        }}
      >
        <Typography variant="body2">A z-index 9999 banner</Typography>
      </div>
    </div>
  ),
}
