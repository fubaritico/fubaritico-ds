import { useState } from 'react'

import { Button } from '@fubaritico/react/Button'
import { Card } from '@fubaritico/react/Card'
import { Modal } from '@fubaritico/react/Modal'
import { Typography } from '@fubaritico/react/Typography'

import type { CardFooterAlign } from '@fubaritico/react/Card'
import type { Meta, StoryObj } from '@storybook/react-vite'

/** The shell centres its panel on its own; the panel only needs a width. */
const PANEL_WIDTH = '22rem'

interface DemoProps {
  /** Intercept the backdrop click instead of closing, as for unsaved work. */
  guardOverlay?: boolean
  /** Where the panel's actions sit. */
  footerAlign?: CardFooterAlign
  /** Label of the trigger button. */
  label?: string
  /** Whether this modal is the one currently shown. */
  isOpen: boolean
  /** Asks the group to show this modal, closing whichever other one was open. */
  onOpen: () => void
  /** Asks the group to close whatever is open. */
  onClose: () => void
  /** Reports what ended the dialog, so the behaviour is observable in the story. */
  onOutcome: (outcome: string) => void
}

/**
 * A trigger + modal pair whose open state is owned by the story, not by itself.
 *
 * Deliberately NOT self-contained: a modal is modal, so two showing at once is a state the
 * component should never be put in. The group below keeps a single "which one is open" value.
 *
 * @param props - The demo's options plus its controlled open state.
 * @returns The trigger button and its dialog.
 */
function ModalDemo({
  guardOverlay = false,
  footerAlign = 'center',
  label,
  isOpen,
  onOpen,
  onClose,
  onOutcome,
}: Readonly<DemoProps>) {
  const dismiss = (outcome: string) => () => {
    onOutcome(outcome)
    onClose()
  }

  return (
    <>
      <Button onClick={onOpen}>
        {label ?? (guardOverlay ? 'Open (backdrop guarded)' : 'Open dialog')}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={dismiss('dismissed')}
        onOverlayClick={
          guardOverlay
            ? () => {
                onOutcome('backdrop click ignored — unsaved work')
              }
            : undefined
        }
        aria-label="Delete this item?"
      >
        <div style={{ inlineSize: PANEL_WIDTH }}>
          <Card>
            <Card.Header>
              <Typography variant="h6">Delete this item?</Typography>
            </Card.Header>
            <Card.Body>
              <Typography variant="body2">
                This action cannot be undone.
              </Typography>
            </Card.Body>
            {/* No wrapper: the footer is itself the action row, so it owns the gap and the
                alignment. Wrapping them in a div would collapse both into one flex child. */}
            <Card.Footer align={footerAlign}>
              <Button variant="outline" onClick={dismiss('cancelled')}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={dismiss('deleted')}>
                Delete
              </Button>
            </Card.Footer>
          </Card>
        </div>
      </Modal>
    </>
  )
}

/** One demo of a group, identified so the group can track which is open. */
type DemoSpec = Omit<
  DemoProps,
  'isOpen' | 'onOpen' | 'onClose' | 'onOutcome'
> & {
  /** Unique within its group. */
  id: string
}

/**
 * Renders a row of triggers sharing ONE open slot, so the dialogs alternate instead of stacking.
 *
 * @param props - The group's contents.
 * @param props.demos - The modals to offer, each with a unique `id`.
 * @returns The trigger row and the last recorded outcome.
 */
function ModalGroup({ demos }: Readonly<{ demos: DemoSpec[] }>) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [outcome, setOutcome] = useState('—')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {demos.map(({ id, ...demo }) => (
          <ModalDemo
            key={id}
            {...demo}
            isOpen={openId === id}
            onOpen={() => {
              setOpenId(id)
            }}
            onClose={() => {
              setOpenId(null)
            }}
            onOutcome={setOutcome}
          />
        ))}
      </div>
      <Typography variant="body2">Last outcome: {outcome}</Typography>
    </div>
  )
}

const meta = {
  title: 'Reference/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    isOpen: { table: { disable: true } },
    onClose: { table: { disable: true } },
    onOverlayClick: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  args: {
    isOpen: false,
    onClose: () => undefined,
    'aria-label': 'Example dialog',
    children: null,
  },
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

/** Open it, then try Escape, Tab, and a click on the dimmed area around the card. */
export const Playground: Story = {
  render: () => <ModalGroup demos={[{ id: 'playground' }]} />,
}

/** The default dialog next to one that guards against losing unsaved work. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <strong>Dismissal</strong>
        <p style={{ fontSize: '0.8125rem', margin: 0 }}>
          The first closes on a backdrop click; the second intercepts it, as a
          dialog holding unsaved work should.
        </p>
        <ModalGroup
          demos={[
            { id: 'default', label: 'Backdrop dismisses' },
            {
              id: 'guarded',
              guardOverlay: true,
              label: 'Backdrop guarded',
            },
          ]}
        />
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <strong>Action placement</strong>
        <p style={{ fontSize: '0.8125rem', margin: 0 }}>
          The panel is a `Card`, so its footer owns where the buttons sit.
          `center` is the default.
        </p>
        <ModalGroup
          demos={[
            { id: 'align-center', footerAlign: 'center', label: 'Centred' },
            { id: 'align-end', footerAlign: 'end', label: 'Inline-end' },
            { id: 'align-start', footerAlign: 'start', label: 'Inline-start' },
            {
              id: 'align-between',
              footerAlign: 'between',
              label: 'Pushed apart',
            },
          ]}
        />
      </section>
    </div>
  ),
}
