import { useState } from 'react'

import { Button } from '@fubaritico-ds/reference/Button'
import { Card } from '@fubaritico-ds/reference/Card'
import { Modal } from '@fubaritico-ds/reference/Modal'
import { Typography } from '@fubaritico-ds/reference/Typography'

import type { Meta, StoryObj } from '@storybook/react-vite'

/** The shell fills the viewport, so the panel is centred by the story itself. */
const CENTERED_SHELL: React.CSSProperties = {
  display: 'grid',
  placeItems: 'center',
}

const PANEL_WIDTH = '22rem'

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

/** A confirmation dialog — the usual shape: a Card composed inside the shell. */
function ConfirmExample({
  guardOverlay = false,
}: Readonly<{ guardOverlay?: boolean }>) {
  const [isOpen, setIsOpen] = useState(false)
  const [outcome, setOutcome] = useState<string>('—')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Button
        onClick={() => {
          setIsOpen(true)
        }}
      >
        {guardOverlay ? 'Open (backdrop guarded)' : 'Open dialog'}
      </Button>
      <Typography variant="body2">Last outcome: {outcome}</Typography>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          setOutcome('dismissed')
        }}
        onOverlayClick={
          guardOverlay
            ? () => {
                setOutcome('backdrop click ignored — unsaved work')
              }
            : undefined
        }
        aria-label="Delete this item?"
        style={CENTERED_SHELL}
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
            <Card.Footer>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false)
                    setOutcome('cancelled')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsOpen(false)
                    setOutcome('deleted')
                  }}
                >
                  Delete
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </div>
      </Modal>
    </div>
  )
}

/** Interactive playground — open it, then try Escape, Tab and a backdrop click. */
export const Playground: Story = {
  render: () => <ConfirmExample />,
}

/** The default dialog next to one that guards against losing unsaved work. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <strong>Default — a backdrop click dismisses</strong>
        <ConfirmExample />
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <strong>Guarded — the backdrop click is intercepted</strong>
        <ConfirmExample guardOverlay />
      </section>
    </div>
  ),
}
