import { useState } from 'react'

import { Button } from '@fubaritico/react/Button'
import { Drawer } from '@fubaritico/react/Drawer'
import { Typography } from '@fubaritico/react/Typography'

import type { DrawerSide, DrawerSize } from '@fubaritico/react/Drawer'
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
  /** Whether this drawer is the one currently shown. */
  isOpen: boolean
  /** Asks the group to show this drawer, closing whichever other one was open. */
  onOpen: () => void
  /** Asks the group to close whatever is open. */
  onClose: () => void
}

/**
 * A trigger + drawer pair whose open state is owned by the story, not by itself.
 *
 * Deliberately NOT self-contained: a drawer is modal, so two showing at once is a state the
 * component should never be put in. The group below keeps a single "which one is open" value and
 * every trigger goes through it.
 *
 * The three regions are independent: `header` and `footer` compose the shape. The body is always
 * rendered — a drawer with no content would show nothing.
 *
 * @param props - The demo's options plus its controlled open state.
 * @returns The trigger button and its drawer.
 */
function DrawerDemo({
  side = 'start',
  size = 'md',
  variant = 'light',
  long = false,
  label,
  header = true,
  footer = true,
  isOpen,
  onOpen,
  onClose,
}: Readonly<DemoProps>) {
  const rows = long ? 30 : 5

  return (
    <>
      <Button onClick={onOpen}>{label ?? `Open ${side} drawer`}</Button>

      <Drawer
        open={isOpen}
        onClose={onClose}
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
              No header, so no built-in close button — Escape, a click outside
              the panel and the button below are the ways out.
            </Typography>
          )}

          {Array.from({ length: rows }, (_, i) => (
            <Typography key={i} variant="body2">
              Filter option {i + 1}
            </Typography>
          ))}

          {header || footer ? null : (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </Drawer.Body>

        {footer ? (
          <Drawer.Footer>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose}>Apply</Button>
          </Drawer.Footer>
        ) : null}
      </Drawer>
    </>
  )
}

/** One demo of a group, identified so the group can track which is open. */
type DemoSpec = Omit<DemoProps, 'isOpen' | 'onOpen' | 'onClose'> & {
  /** Unique within its group. */
  id: string
}

/**
 * Renders a row of triggers sharing ONE open slot, so the drawers alternate instead of stacking.
 *
 * @param props - The group's contents.
 * @param props.demos - The drawers to offer, each with a unique `id`.
 * @returns The row of triggers.
 */
function DrawerGroup({ demos }: Readonly<{ demos: DemoSpec[] }>) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {demos.map(({ id, ...demo }) => (
        <DrawerDemo
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
    <DrawerGroup
      demos={[
        {
          id: 'playground',
          side: args.side,
          size: args.size,
          variant: args.variant,
        },
      ]}
    />
  ),
}

/** Every edge and size, the composition cases, the dark surface and a right-to-left panel. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <strong>Edges — logical, so these flip in a RTL document</strong>
        <DrawerGroup
          demos={[
            { id: 'start', side: 'start' },
            { id: 'end', side: 'end' },
            { id: 'top', side: 'top' },
          ]}
        />
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <strong>Sizes</strong>
        <DrawerGroup
          demos={[
            { id: 'sm', size: 'sm', label: 'Small' },
            { id: 'md', size: 'md', label: 'Medium' },
            { id: 'lg', size: 'lg', label: 'Large' },
          ]}
        />
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <strong>Dark surface, and a body that scrolls</strong>
        <DrawerGroup
          demos={[
            { id: 'dark', variant: 'dark', label: 'Dark' },
            { id: 'long', long: true, label: 'Long content' },
          ]}
        />
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <strong>Composition — the three regions are independent</strong>
        <p style={{ fontSize: '0.8125rem', margin: 0 }}>
          Only the body is mandatory. Dropping the header also drops the
          built-in close button, so provide your own affordance.
        </p>
        <DrawerGroup
          demos={[
            {
              id: 'body-only',
              header: false,
              footer: false,
              label: 'Body only',
            },
            {
              id: 'header-body',
              header: true,
              footer: false,
              label: 'Header + body',
            },
            {
              id: 'body-footer',
              header: false,
              footer: true,
              label: 'Body + footer',
            },
            { id: 'all', header: true, footer: true, label: 'All three' },
          ]}
        />
      </section>

      <section
        dir="rtl"
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <strong>Right-to-left — “start” now means the right edge</strong>
        <DrawerGroup demos={[{ id: 'rtl', side: 'start', label: 'افتح' }]} />
      </section>
    </div>
  ),
}
