import { useState } from 'react'

import { hsvaToHex } from '@fubaritico/behaviors'
import { ColorPicker } from '@fubaritico/react/ColorPicker'
import { Typography } from '@fubaritico/react/Typography'

import type { ColorValue, HsvaColor } from '@fubaritico/react/ColorPicker'
import type { Meta, StoryObj } from '@storybook/react-vite'

const BLUE: HsvaColor = { h: 210, s: 80, v: 60, a: 1 }

const meta = {
  title: 'Reference/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
  argTypes: {
    nullable: { control: 'boolean' },
    alpha: { control: 'boolean' },
    disabled: { control: 'boolean' },
    value: { table: { disable: true } },
    defaultValue: { table: { disable: true } },
    onChange: { table: { disable: true } },
    onChangeComplete: { table: { disable: true } },
    service: { table: { disable: true } },
    labels: { table: { disable: true } },
    describeColor: { table: { disable: true } },
    placeholder: { table: { disable: true } },
  },
  args: {
    defaultValue: BLUE,
    nullable: false,
    alpha: false,
    disabled: false,
  },
} satisfies Meta<typeof ColorPicker>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Drag on the area or the hue track, type a hex and press Enter. Keyboard: focus the area, then
 * arrows (saturation ←→, brightness ↑↓), Page Up / Down, Home / End, Shift for steps of 10;
 * Escape during a drag puts the colour back.
 */
export const Playground: Story = {}

/**
 * The "automatic / no colour" state: the toggle switches to `null` and back to the last colour,
 * whose hue is kept.
 */
export const Automatic: Story = {
  args: { nullable: true, defaultValue: null },
}

/** With the alpha track, over a checkerboard. */
export const WithAlpha: Story = {
  args: { alpha: true, defaultValue: { ...BLUE, a: 0.6 } },
}

/**
 * Controlled, showing the two callbacks: `onChange` follows every move, `onChangeComplete` only
 * fires once a change settles — the one to use for anything expensive.
 */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    function Demo() {
      const [value, setValue] = useState<ColorValue>(BLUE)
      const [settled, setSettled] = useState<ColorValue>(BLUE)
      const label = (color: ColorValue) =>
        color === null ? 'automatic' : hsvaToHex(color)
      return (
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          <ColorPicker
            value={value}
            onChange={setValue}
            onChangeComplete={setSettled}
            nullable
          />
          <div>
            <Typography variant="body2">onChange: {label(value)}</Typography>
            <Typography variant="body2">
              onChangeComplete: {label(settled)}
            </Typography>
          </div>
        </div>
      )
    }
    return <Demo />
  },
}

/** Your own arrangement: only the parts you place are rendered (the live region always is). */
export const Composed: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ColorPicker defaultValue={BLUE}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <ColorPicker.Swatch />
        <ColorPicker.HexField />
      </div>
      <ColorPicker.Hue />
    </ColorPicker>
  ),
}

/** Right-to-left: the saturation axis and the tracks run from the right. */
export const RightToLeft: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div dir="rtl">
      <ColorPicker defaultValue={BLUE} alpha />
    </div>
  ),
}

/** Disabled: every control refuses input. */
export const Disabled: Story = {
  args: { disabled: true },
}
