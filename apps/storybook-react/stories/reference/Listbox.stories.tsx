import { ListboxItem, ListboxList } from '@fubaritico-ds/reference/Listbox'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Reference/Listbox',
  component: ListboxList,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['light', 'dark'] },
    children: { table: { disable: true } },
  },
  args: { variant: 'light' },
} satisfies Meta<typeof ListboxList>

export default meta
type Story = StoryObj<typeof meta>

/** Interactive surface — flip the `variant` control; the items mirror it. */
export const Playground: Story = {
  render: ({ variant }) => (
    <ListboxList variant={variant} style={{ inlineSize: 220 }}>
      <ListboxItem variant={variant}>Rows per page: 10</ListboxItem>
      <ListboxItem variant={variant} isActive>
        Rows per page: 20
      </ListboxItem>
      <ListboxItem variant={variant} isSelected>
        Rows per page: 30
      </ListboxItem>
      <ListboxItem variant={variant} disabled>
        Rows per page: 40
      </ListboxItem>
    </ListboxList>
  ),
}

/** Every state (idle / active / selected / disabled), both colour schemes, side by side. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      <ListboxList style={{ inlineSize: 200 }}>
        <ListboxItem>Idle</ListboxItem>
        <ListboxItem isActive>Active (cursor)</ListboxItem>
        <ListboxItem isSelected>Selected</ListboxItem>
        <ListboxItem disabled>Disabled</ListboxItem>
      </ListboxList>

      <ListboxList variant="dark" style={{ inlineSize: 200 }}>
        <ListboxItem variant="dark">Idle</ListboxItem>
        <ListboxItem variant="dark" isActive>
          Active (cursor)
        </ListboxItem>
        <ListboxItem variant="dark" isSelected>
          Selected
        </ListboxItem>
        <ListboxItem variant="dark" disabled>
          Disabled
        </ListboxItem>
      </ListboxList>
    </div>
  ),
}
