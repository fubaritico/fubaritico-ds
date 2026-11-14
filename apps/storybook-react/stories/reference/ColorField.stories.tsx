import { useState } from 'react'

import { hsvaToHex, isColor } from '@fubaritico/behaviors'
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
    allowNone: { control: 'boolean' },
    alpha: { control: 'boolean' },
    disabled: { control: 'boolean' },
    density: { control: 'inline-radio', options: ['default', 'compact'] },
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
    allowNone: false,
    alpha: false,
    disabled: false,
  },
} satisfies Meta<typeof ColorField>

export default meta
type Story = StoryObj<typeof meta>

/** Type a hex and press Enter, or click the swatch to open the picker. */
export const Playground: Story = {}

/** Open from the start — the picker in its popover, with its mode group. */
export const Open: Story = {
  args: { open: true, nullable: true, allowNone: true },
  parameters: { layout: 'padded' },
}

/** The compact density, opened: a tighter popover for dense toolbars and forms. */
export const Compact: Story = {
  args: { density: 'compact', open: true, alpha: true, nullable: true },
  parameters: { layout: 'padded' },
}

/** The automatic state, with alpha. */
export const AutomaticWithAlpha: Story = {
  args: { nullable: true, alpha: true, defaultValue: null },
}

/**
 * The three swatches side by side: a colour, automatic (a magic wand), no colour (struck through,
 * the Illustrator / Office mark). They must never be mistaken for one another.
 */
export const Swatches: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: '1.5rem' }}>
      <ColorField label="Colour" defaultValue={BLUE} nullable allowNone />
      <ColorField label="Automatic" defaultValue={null} nullable allowNone />
      <ColorField label="No colour" defaultValue="none" nullable allowNone />
    </div>
  ),
}

/** A form-like stack of fields, controlled, with the settled values shown. */
export const InAForm: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    function Demo() {
      const [fill, setFill] = useState<ColorValue>(BLUE)
      const [stroke, setStroke] = useState<ColorValue>(null)
      const [border, setBorder] = useState<ColorValue>('none')
      const label = (color: ColorValue) =>
        isColor(color) ? hsvaToHex(color) : String(color)
      return (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <ColorField label="Fill" value={fill} onChange={setFill} />
          <ColorField
            label="Stroke"
            value={stroke}
            onChange={setStroke}
            nullable
          />
          <ColorField
            label="Border"
            value={border}
            onChange={setBorder}
            allowNone
          />
          <Typography variant="body2">
            fill {label(fill)} · stroke {label(stroke)} · border {label(border)}
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
