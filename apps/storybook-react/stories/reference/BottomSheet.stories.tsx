import { useState } from 'react'

import { BottomSheet } from '@fubaritico-ds/reference/BottomSheet'
import { Button } from '@fubaritico-ds/reference/Button'
import { Typography } from '@fubaritico-ds/reference/Typography'

import type { Meta, StoryObj } from '@storybook/react-vite'

interface DemoProps {
  /** Colour scheme of the sheet. */
  variant?: 'light' | 'dark'
  /** Dim the page behind the sheet. */
  overlay?: boolean
  /** Render enough content to make the body scroll. */
  long?: boolean
}

/** A self-contained trigger + sheet, so every story is interactive. */
function BottomSheetDemo({
  variant = 'light',
  overlay = false,
  long = false,
}: Readonly<DemoProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const rows = long ? 24 : 4

  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(true)
        }}
      >
        Open {variant} sheet{overlay ? ' (with overlay)' : ''}
      </Button>

      <BottomSheet
        open={isOpen}
        onClose={() => {
          setIsOpen(false)
        }}
        variant={variant}
        overlay={overlay}
        aria-label="Filters"
      >
        <BottomSheet.Header>
          <Typography variant="h6">Filters</Typography>
        </BottomSheet.Header>
        <BottomSheet.Body>
          {Array.from({ length: rows }, (_, i) => (
            <Typography key={i} variant="body2">
              Filter option {i + 1}
            </Typography>
          ))}
        </BottomSheet.Body>
      </BottomSheet>
    </>
  )
}

const meta = {
  title: 'Reference/BottomSheet',
  component: BottomSheet,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['light', 'dark'] },
    overlay: { control: 'boolean' },
    open: { table: { disable: true } },
    onClose: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  args: {
    variant: 'light',
    overlay: false,
    open: false,
    onClose: () => undefined,
    children: null,
  },
} satisfies Meta<typeof BottomSheet>

export default meta
type Story = StoryObj<typeof meta>

/** Open it, then try Escape and the close button. */
export const Playground: Story = {
  render: (args) => (
    <BottomSheetDemo variant={args.variant} overlay={args.overlay} />
  ),
}

/** Both schemes, with and without the scrim, plus a scrolling body. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <BottomSheetDemo />
      <BottomSheetDemo overlay />
      <BottomSheetDemo variant="dark" overlay />
      <BottomSheetDemo long />
    </div>
  ),
}
