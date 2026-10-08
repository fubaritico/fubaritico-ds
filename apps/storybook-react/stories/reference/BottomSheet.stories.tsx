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
  /** Render the title bar, which brings the built-in close button with it. */
  header?: boolean
  /** Label of the trigger button. */
  label?: string
}

/**
 * A self-contained trigger + sheet, so every story is interactive.
 *
 * Both regions are optional: `header` composes the shape. The body is always rendered — a sheet
 * with no content would show nothing.
 */
function BottomSheetDemo({
  variant = 'light',
  overlay = false,
  long = false,
  header = true,
  label,
}: Readonly<DemoProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const rows = long ? 24 : 4
  const close = () => {
    setIsOpen(false)
  }

  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(true)
        }}
      >
        {label ?? `Open ${variant} sheet${overlay ? ' (with overlay)' : ''}`}
      </Button>

      <BottomSheet
        open={isOpen}
        onClose={close}
        variant={variant}
        overlay={overlay}
        aria-label="Filters"
      >
        {header ? (
          <BottomSheet.Header>
            <Typography variant="h6">Filters</Typography>
          </BottomSheet.Header>
        ) : null}

        <BottomSheet.Body>
          {header ? null : (
            <Typography variant="body2">
              No header, so no built-in close button — provide your own.
            </Typography>
          )}

          {Array.from({ length: rows }, (_, i) => (
            <Typography key={i} variant="body2">
              Filter option {i + 1}
            </Typography>
          ))}

          {header ? null : (
            <Button variant="outline" onClick={close}>
              Close
            </Button>
          )}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <strong>Surfaces and the scrim</strong>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <BottomSheetDemo label="Light, no overlay" />
          <BottomSheetDemo overlay label="Light, with overlay" />
          <BottomSheetDemo variant="dark" overlay label="Dark, with overlay" />
          <BottomSheetDemo long label="Scrolling body" />
        </div>
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <strong>Composition — the header is optional</strong>
        <p style={{ fontSize: '0.8125rem', margin: 0 }}>
          Only the body is mandatory. Dropping the header also drops the
          built-in close button, so provide your own affordance.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <BottomSheetDemo header={false} label="Body only" />
          <BottomSheetDemo header label="Header + body" />
        </div>
      </section>
    </div>
  ),
}
