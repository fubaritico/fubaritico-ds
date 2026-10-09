import { useState } from 'react'

import { Alert } from '@fubaritico/react/Alert'
import { Button } from '@fubaritico/react/Button'

import type { Meta, StoryObj } from '@storybook/react-vite'

const WIDTH = '28rem'

const meta = {
  title: 'Reference/Alert',
  component: Alert,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ inlineSize: WIDTH }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['info', 'success', 'warning', 'error'],
    },
    title: { control: 'text' },
    children: { control: 'text' },
    dismissLabel: { control: 'text' },
    icon: { table: { disable: true } },
    onDismiss: { table: { disable: true } },
    role: { table: { disable: true } },
  },
  args: {
    variant: 'info',
    title: 'Heads up',
    children: 'A new version of the app is available.',
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

/** Interactive playground — driven by the controls panel. */
export const Playground: Story = {}

/** A dismissible alert, where the consumer owns the visibility. */
function Dismissible() {
  const [visible, setVisible] = useState(true)

  return visible ? (
    <Alert
      variant="success"
      title="Saved"
      onDismiss={() => {
        setVisible(false)
      }}
    >
      Your changes were saved.
    </Alert>
  ) : (
    <Button
      variant="outline"
      onClick={() => {
        setVisible(true)
      }}
    >
      Bring the alert back
    </Button>
  )
}

/** Every intent, with and without a title, plus the dismissible and glyph-less cases. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
      >
        <strong>Intents — the glyph changes with the colour</strong>
        <Alert variant="info">A new version is available.</Alert>
        <Alert variant="success">Your changes were saved.</Alert>
        <Alert variant="warning">Your storage is nearly full.</Alert>
        <Alert variant="error">We could not save your changes.</Alert>
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
      >
        <strong>With a title</strong>
        <Alert variant="error" title="Upload failed">
          The file exceeds the 25 MB limit. Try a smaller one, or compress it
          before uploading again.
        </Alert>
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
      >
        <strong>Dismissible</strong>
        <Dismissible />
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
      >
        <strong>Without a glyph</strong>
        <Alert icon={null} title="Plain">
          Sometimes the shape is just noise.
        </Alert>
      </section>
    </div>
  ),
}
