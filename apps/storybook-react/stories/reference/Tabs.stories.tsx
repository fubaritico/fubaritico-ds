import { Tabs } from '@fubaritico-ds/reference/Tabs'
import { Typography } from '@fubaritico-ds/reference/Typography'

import type { Meta, StoryObj } from '@storybook/react-vite'

const WIDTH = '32rem'

/** A ready-made set of tabs, so each story is a one-liner. */
function Demo({
  variant,
  prefix,
  activation,
  loop,
}: Readonly<{
  variant?: 'underline' | 'pills'
  prefix?: string
  activation?: 'automatic' | 'manual'
  loop?: boolean
}>) {
  return (
    <Tabs
      defaultValue="overview"
      variant={variant}
      prefix={prefix}
      activation={activation}
      loop={loop}
    >
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
        <Tabs.Trigger value="billing" disabled>
          Billing
        </Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Panel value="overview">
        <Typography variant="body2">
          A summary of the account. Billing is disabled — the arrow keys skip
          straight past it.
        </Typography>
      </Tabs.Panel>
      <Tabs.Panel value="activity">
        <Typography variant="body2">The activity feed.</Typography>
      </Tabs.Panel>
      <Tabs.Panel value="billing">
        <Typography variant="body2">Unreachable while disabled.</Typography>
      </Tabs.Panel>
      <Tabs.Panel value="settings">
        <Typography variant="body2">Preferences and defaults.</Typography>
      </Tabs.Panel>
    </Tabs>
  )
}

const meta = {
  title: 'Reference/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ inlineSize: WIDTH }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: { control: 'inline-radio', options: ['underline', 'pills'] },
    activation: { control: 'inline-radio', options: ['automatic', 'manual'] },
    loop: { control: 'boolean' },
    defaultValue: { table: { disable: true } },
    value: { table: { disable: true } },
    onValueChange: { table: { disable: true } },
    prefix: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  args: {
    variant: 'underline',
    activation: 'automatic',
    loop: true,
    children: null,
  },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

/** Click a tab, then drive the row with the arrow keys. */
export const Playground: Story = {
  render: (args) => (
    <Demo
      variant={args.variant}
      activation={args.activation}
      loop={args.loop}
    />
  ),
}

/** Manual activation: the arrows only move focus — press Enter or Space to open the tab. */
export const ManualActivation: Story = {
  parameters: { controls: { disable: true } },
  render: () => <Demo activation="manual" />,
}

/** Both looks side by side, plus two independent Tabs sharing a page. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <section>
        <strong>Underline</strong>
        <Demo variant="underline" />
      </section>

      <section>
        <strong>Pills</strong>
        <Demo variant="pills" />
      </section>

      <section>
        <strong>
          Two sets on one page — ids stay unique without any prefix
        </strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Demo variant="pills" />
          <Demo variant="pills" />
        </div>
      </section>
    </div>
  ),
}
