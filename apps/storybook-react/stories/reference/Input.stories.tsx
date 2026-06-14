// Text input — CSS-free subpath (no Tailwind leak in Storybook).
import { Input } from '@fubaritico-ds/reference/Input'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * Input — an accessible text-field primitive: an `<input>` control plus an optional label, a
 * decorative trailing icon and a helper/error message. Label and message are wired to the control
 * (`htmlFor` + `aria-describedby`); errors surface via `aria-invalid` + `role="alert"`. Skin classes
 * come from `@fubaritico-ds/variants` → `.ui-input` / `.ui-input-affix` / `.ui-field`.
 */
const meta = {
  title: 'Reference/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    icon: { control: 'text' },
    label: { control: 'text' },
    message: { control: 'text' },
    messageType: { control: 'inline-radio', options: ['info', 'error'] },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    onChange: { table: { disable: true } }, // callback — hidden from the controls table
  },
  args: {
    placeholder: 'Enter text',
    size: 'md',
    messageType: 'info',
  },
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

/** Interactive playground driven by the controls panel. */
export const Playground: Story = {}

/** Every case (sizes + icon + label + info/error + disabled) in one view; controls disabled. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '20rem',
      }}
    >
      <Input size="sm" placeholder="Small" />
      <Input size="md" placeholder="Medium (default)" />
      <Input size="lg" placeholder="Large" />
      <Input icon="MagnifyingGlass" placeholder="With trailing icon" />
      <Input label="Email" type="email" placeholder="you@example.com" />
      <Input
        label="Username"
        message="Pick a unique handle."
        placeholder="@handle"
      />
      <Input
        label="Password"
        type="password"
        message="Password is required."
        messageType="error"
        placeholder="••••••••"
      />
      <Input label="Disabled" placeholder="Can't touch this" disabled />
    </div>
  ),
}
