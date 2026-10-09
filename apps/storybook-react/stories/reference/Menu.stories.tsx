import { useState } from 'react'

import { Menu } from '@fubaritico/react/Menu'

import type { Meta, StoryObj } from '@storybook/react-vite'

/** The list is a popup surface — give it a realistic width instead of letting it fill the canvas. */
const WIDTH = '14rem'

const meta = {
  title: 'Reference/Menu',
  component: Menu,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ inlineSize: WIDTH }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: { control: 'inline-radio', options: ['light', 'dark'] },
    selectedValue: { control: 'text' },
    onSelect: { table: { disable: true } },
    onClose: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  args: {
    variant: 'light',
    'aria-label': 'Actions',
    children: (
      <>
        <Menu.Item index={0} value="edit">
          Edit
        </Menu.Item>
        <Menu.Item index={1} value="duplicate">
          Duplicate
        </Menu.Item>
        <Menu.Item index={2} value="archive" disabled>
          Archive
        </Menu.Item>
        <Menu.Item index={3} value="delete">
          Delete
        </Menu.Item>
      </>
    ),
  },
} satisfies Meta<typeof Menu>

export default meta
type Story = StoryObj<typeof meta>

/** Interactive playground — click into the list, then use the arrow keys. */
export const Playground: Story = {}

/** A controlled selection, the usual real-world shape. */
function SortMenu({ variant }: Readonly<{ variant: 'light' | 'dark' }>) {
  const [selected, setSelected] = useState('newest')

  return (
    <Menu
      variant={variant}
      selectedValue={selected}
      onSelect={setSelected}
      aria-label="Sort by"
    >
      <Menu.Item index={0} value="newest">
        Newest first
      </Menu.Item>
      <Menu.Item index={1} value="oldest">
        Oldest first
      </Menu.Item>
      <Menu.Item index={2} value="title">
        Title A–Z
      </Menu.Item>
    </Menu>
  )
}

/** Both colour schemes, selection, disabled entries and the empty list. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <strong>Light — with a disabled entry</strong>
        <Menu aria-label="Actions">
          <Menu.Item index={0} value="edit">
            Edit
          </Menu.Item>
          <Menu.Item index={1} value="archive" disabled>
            Archive
          </Menu.Item>
          <Menu.Item index={2} value="delete">
            Delete
          </Menu.Item>
        </Menu>
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <strong>Controlled selection</strong>
        <SortMenu variant="light" />
      </section>

      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          padding: '1rem',
          background: 'var(--color-primitive-neutral-950, #0a0a0a)',
        }}
      >
        <strong style={{ color: '#fff' }}>Dark surface</strong>
        <SortMenu variant="dark" />
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
      >
        <strong>Empty</strong>
        <Menu aria-label="No actions available" />
      </section>
    </div>
  ),
}
