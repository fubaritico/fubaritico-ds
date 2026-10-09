import { useState } from 'react'

import { hsvaToHex } from '@fubaritico/behaviors'
import { Button } from '@fubaritico/react/Button'
import { Card } from '@fubaritico/react/Card'
import { ColorField } from '@fubaritico/react/ColorField'
import { Modal } from '@fubaritico/react/Modal'
import { Typography } from '@fubaritico/react/Typography'

import type { ColorValue, HsvaColor } from '@fubaritico/react/ColorPicker'
import type { Meta, StoryObj } from '@storybook/react-vite'

const BLUE: HsvaColor = { h: 210, s: 80, v: 60, a: 1 }

const meta = {
  title: 'Reference/ColorField',
  component: ColorField,
  tags: ['autodocs'],
  argTypes: {
    nullable: { control: 'boolean' },
    alpha: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    value: { table: { disable: true } },
    defaultValue: { table: { disable: true } },
    onChange: { table: { disable: true } },
    onChangeComplete: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
    service: { table: { disable: true } },
    labels: { table: { disable: true } },
    describeColor: { table: { disable: true } },
    placeholder: { table: { disable: true } },
    open: { table: { disable: true } },
  },
  args: {
    label: 'Fill color',
    defaultValue: BLUE,
    nullable: false,
    alpha: false,
    disabled: false,
  },
} satisfies Meta<typeof ColorField>

export default meta
type Story = StoryObj<typeof meta>

/** Type a hex and press Enter, or click the swatch to open the picker. */
export const Playground: Story = {}

/** Open from the start — the picker in its popover. */
export const Open: Story = {
  args: { open: true, nullable: true },
  parameters: { layout: 'padded' },
}

/** The automatic state, with alpha. */
export const AutomaticWithAlpha: Story = {
  args: { nullable: true, alpha: true, defaultValue: null },
}

/** A form-like stack of fields, controlled, with the settled values shown. */
export const InAForm: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    function Demo() {
      const [fill, setFill] = useState<ColorValue>(BLUE)
      const [stroke, setStroke] = useState<ColorValue>(null)
      const label = (color: ColorValue) =>
        color === null ? 'automatic' : hsvaToHex(color)
      return (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <ColorField label="Fill" value={fill} onChange={setFill} />
          <ColorField
            label="Stroke"
            value={stroke}
            onChange={setStroke}
            nullable
          />
          <Typography variant="body2">
            fill {label(fill)} · stroke {label(stroke)}
          </Typography>
        </div>
      )
    }
    return <Demo />
  },
}

/**
 * Inside a modal dialog — itself in the top layer. The picker's popover opens after the dialog, so
 * it stacks above it; it stays in the dialog's subtree (no portal), so the modal's inertness does
 * not swallow it. Escape closes the popover first, then the dialog.
 */
export const InAModal: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    function Demo() {
      const [isOpen, setIsOpen] = useState(false)
      const [fill, setFill] = useState<ColorValue>(BLUE)
      return (
        <>
          <Button
            onClick={() => {
              setIsOpen(true)
            }}
          >
            Edit layer
          </Button>
          <Modal
            isOpen={isOpen}
            onClose={() => {
              setIsOpen(false)
            }}
            aria-label="Edit layer"
          >
            <Card>
              <Card.Header>
                <Typography variant="h6">Edit layer</Typography>
              </Card.Header>
              <Card.Body>
                <ColorField
                  label="Fill"
                  value={fill}
                  onChange={setFill}
                  alpha
                />
              </Card.Body>
            </Card>
          </Modal>
        </>
      )
    }
    return <Demo />
  },
}
