import { useState } from 'react'

import { BottomSheet } from '@fubaritico/react/BottomSheet'
import { Button } from '@fubaritico/react/Button'
import { Typography } from '@fubaritico/react/Typography'

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
  /** Whether this sheet is the one currently shown. */
  isOpen: boolean
  /** Asks the group to show this sheet, closing whichever other one was open. */
  onOpen: () => void
  /** Asks the group to close whatever is open. */
  onClose: () => void
}

/**
 * A trigger + sheet pair whose open state is owned by the story, not by itself.
 *
 * Deliberately NOT self-contained: two sheets stacked at the bottom edge is a state the component
 * should never be put in. The group below keeps a single "which one is open" value.
 *
 * Both regions are optional: `header` composes the shape. The body is always rendered — a sheet
 * with no content would show nothing.
 *
 * @param props - The demo's options plus its controlled open state.
 * @returns The trigger button and its sheet.
 */
function BottomSheetDemo({
  variant = 'light',
  overlay = false,
  long = false,
  header = true,
  label,
  isOpen,
  onOpen,
  onClose,
}: Readonly<DemoProps>) {
  const rows = long ? 24 : 4

  return (
    <>
      <Button onClick={onOpen}>
        {label ?? `Open ${variant} sheet${overlay ? ' (with overlay)' : ''}`}
      </Button>

      <BottomSheet
        open={isOpen}
        onClose={onClose}
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
              No header, so no built-in close button — Escape, a click outside
              the sheet and the button below are the ways out.
            </Typography>
          )}

          {Array.from({ length: rows }, (_, i) => (
            <Typography key={i} variant="body2">
              Filter option {i + 1}
            </Typography>
          ))}

          {header ? null : (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </BottomSheet.Body>
      </BottomSheet>
    </>
  )
}

/** One demo of a group, identified so the group can track which is open. */
type DemoSpec = Omit<DemoProps, 'isOpen' | 'onOpen' | 'onClose'> & {
  /** Unique within its group. */
  id: string
}

/**
 * Renders a row of triggers sharing ONE open slot, so the sheets alternate instead of stacking.
 *
 * @param props - The group's contents.
 * @param props.demos - The sheets to offer, each with a unique `id`.
 * @returns The row of triggers.
 */
function BottomSheetGroup({ demos }: Readonly<{ demos: DemoSpec[] }>) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {demos.map(({ id, ...demo }) => (
        <BottomSheetDemo
          key={id}
          {...demo}
          isOpen={openId === id}
          onOpen={() => {
            setOpenId(id)
          }}
          onClose={() => {
            setOpenId(null)
          }}
        />
      ))}
    </div>
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

/** Open it, then try Escape, the close button and a click outside the sheet. */
export const Playground: Story = {
  render: (args) => (
    <BottomSheetGroup
      demos={[
        { id: 'playground', variant: args.variant, overlay: args.overlay },
      ]}
    />
  ),
}

/** Both surfaces, with and without the scrim, and the two composition shapes. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <strong>Surfaces and the scrim</strong>
        <p style={{ fontSize: '0.8125rem', margin: 0 }}>
          Without an overlay the page stays interactive, and a click outside the
          sheet dismisses it.
        </p>
        <BottomSheetGroup
          demos={[
            { id: 'light', label: 'Light, no overlay' },
            {
              id: 'light-overlay',
              overlay: true,
              label: 'Light, with overlay',
            },
            {
              id: 'dark-overlay',
              variant: 'dark',
              overlay: true,
              label: 'Dark, with overlay',
            },
            { id: 'long', long: true, label: 'Scrolling body' },
          ]}
        />
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <strong>Composition — the header is optional</strong>
        <p style={{ fontSize: '0.8125rem', margin: 0 }}>
          Only the body is mandatory. Dropping the header also drops the
          built-in close button, so provide your own affordance.
        </p>
        <BottomSheetGroup
          demos={[
            { id: 'body-only', header: false, label: 'Body only' },
            { id: 'header-body', header: true, label: 'Header + body' },
          ]}
        />
      </section>
    </div>
  ),
}
