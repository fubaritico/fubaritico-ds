import { useState } from 'react'

// Checkbox — CSS-free subpath (no Tailwind leak in Storybook).
import { Checkbox } from '@fubaritico-ds/reference/Checkbox'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps } from 'react'

/**
 * Checkbox — an accessible checkbox primitive built on a visually-hidden native
 * `<input type="checkbox">`. The painted box mirrors the input's checked / indeterminate / disabled /
 * focus state purely via the skin (`:has(.ui-checkbox__input:…)`), so it works controlled or
 * uncontrolled. Skin classes come from `@fubaritico-ds/variants` → `.ui-checkbox` (+ the reused
 * `.ui-field__message--error`).
 */
const meta = {
  title: 'Reference/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    label: { control: 'text' },
    error: { control: 'text' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    checked: { control: 'boolean' },
    onChange: { table: { disable: true } }, // callback — hidden from the controls table
  },
  args: {
    label: 'Accept the terms',
    size: 'md',
    checked: false,
    indeterminate: false,
    disabled: false,
  },
} satisfies Meta<typeof Checkbox>

export default meta

type Story = StoryObj<typeof meta>

/** Controlled wrapper so the Playground checkbox actually toggles from the controls panel. */
function ControlledCheckbox({
  checked,
  ...args
}: ComponentProps<typeof Checkbox>) {
  const [value, setValue] = useState(!!checked)
  return (
    <Checkbox
      {...args}
      checked={value}
      onChange={(e) => {
        setValue(e.target.checked)
      }}
    />
  )
}

/** Interactive playground — controlled, seeded from the `checked` control. */
export const Playground: Story = {
  render: (args) => <ControlledCheckbox {...args} />,
}

/** Every case (sizes + states + error) in one view; controls disabled. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Checkbox size="sm" checked readOnly label="Small, checked" />
      <Checkbox size="md" checked readOnly label="Medium (default), checked" />
      <Checkbox checked={false} readOnly label="Unchecked" />
      <Checkbox
        checked={false}
        indeterminate
        readOnly
        label="Indeterminate (mixed)"
      />
      <Checkbox checked readOnly disabled label="Disabled, checked" />
      <Checkbox checked={false} readOnly disabled label="Disabled, unchecked" />
      <Checkbox
        checked={false}
        readOnly
        error="This field is required"
        label="With error"
      />
      <Checkbox checked readOnly aria-label="No visible label" />
    </div>
  ),
}
