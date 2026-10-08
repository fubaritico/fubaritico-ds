import { useState } from 'react'

import { Button } from '@fubaritico-ds/reference/Button'
import { Drawer } from '@fubaritico-ds/reference/Drawer'
import { Typography } from '@fubaritico-ds/reference/Typography'

import type { DrawerSide, DrawerSize } from '@fubaritico-ds/reference/Drawer'
import type { Meta, StoryObj } from '@storybook/react-vite'

interface DemoProps {
  /** Anchored edge. */
  side?: DrawerSide
  /** Extent across that edge. */
  size?: DrawerSize
  /** Colour scheme. */
  variant?: 'light' | 'dark'
  /** Render enough content to make the body scroll. */
  long?: boolean
  /** Label of the trigger button. */
  label?: string
  /** Render the title bar, which brings the built-in close button with it. */
  header?: boolean
  /** Render the pinned action bar. */
  footer?: boolean
}

/**
 * A self-contained trigger + drawer, so every story is interactive.
 *
 * The three regions are independent: `header` and `footer` compose the shape. The body is always
 * rendered — a drawer with no content would show nothing.
 */
function DrawerDemo({
  side = 'start',
  size = 'md',
  variant = 'light',
  long = false,
  label,
  header = true,
  footer = true,
}: Readonly<DemoProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const rows = long ? 30 : 5
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
        {label ?? `Open ${side} drawer`}
      </Button>

      <Drawer
        open={isOpen}
        onClose={close}
        side={side}
        size={size}
        variant={variant}
        aria-label="Filters"
      >
        {header ? (
          <Drawer.Header>
            <Typography variant="h6">Filters</Typography>
          </Drawer.Header>
        ) : null}

        <Drawer.Body>
          {header ? null : (
            <Typography variant="body2">
              No header, so no built-in close button — Escape and the backdrop
              are the remaining ways out.
            </Typography>
          )}

          {Array.from({ length: rows }, (_, i) => (
            <Typography key={i} variant="body2">
              Filter option {i + 1}
            </Typography>
          ))}

          {header || footer ? null : (
            <Button variant="outline" onClick={close}>
              Close
            </Button>
          )}
        </Drawer.Body>

        {footer ? (
          <Drawer.Footer>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button onClick={close}>Apply</Button>
          </Drawer.Footer>
        ) : null}
      </Drawer>
    </>
  )
}

const meta = {
  title: 'Reference/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  argTypes: {
    side: { control: 'inline-radio', options: ['start', 'end', 'top'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    variant: { control: 'inline-radio', options: ['light', 'dark'] },
    open: { table: { disable: true } },
    onClose: { table: { disable: true } },
    onOverlayClick: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  args: {
    side: 'start',
    size: 'md',
    variant: 'light',
    open: false,
    onClose: () => undefined,
    'aria-label': 'Filters',
    children: null,
  },
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Open it, then press Tab repeatedly: focus stays inside the panel. That trap is the platform's,
 * not ours — it is why this component is a `<dialog>`.
 */
export const Playground: Story = {
  render: (args) => (
    <DrawerDemo side={args.side} size={args.size} variant={args.variant} />
  ),
}

/** Every edge and size, the dark surface, and a scrolling body between pinned regions. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <strong>Edges — logical, so these flip in a RTL document</strong>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <DrawerDemo side="start" />
          <DrawerDemo side="end" />
          <DrawerDemo side="top" />
        </div>
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <strong>Sizes</strong>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <DrawerDemo size="sm" label="Small" />
          <DrawerDemo size="md" label="Medium" />
          <DrawerDemo size="lg" label="Large" />
        </div>
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <strong>Dark surface, and a body that scrolls</strong>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <DrawerDemo variant="dark" label="Dark" />
          <DrawerDemo long label="Long content" />
        </div>
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <strong>Composition — the three regions are independent</strong>
        <p style={{ fontSize: '0.8125rem', margin: 0 }}>
          Only the body is mandatory. Dropping the header also drops the
          built-in close button, so provide your own affordance.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <DrawerDemo header={false} footer={false} label="Body only" />
          <DrawerDemo header footer={false} label="Header + body" />
          <DrawerDemo header={false} footer label="Body + footer" />
          <DrawerDemo header footer label="All three" />
        </div>
      </section>

      <section
        dir="rtl"
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <strong>Right-to-left — “start” now means the right edge</strong>
        <div>
          <DrawerDemo side="start" label="افتح" />
        </div>
      </section>
    </div>
  ),
}
