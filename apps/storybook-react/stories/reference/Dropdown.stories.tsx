import { useState } from 'react'

// Dropdown — CSS-free subpath (no Tailwind leak in Storybook).
import { Button } from '@fubaritico/react/Button'
import { Card } from '@fubaritico/react/Card'
import { Dropdown } from '@fubaritico/react/Dropdown'
import { Modal } from '@fubaritico/react/Modal'

import type { DropdownOption } from '@fubaritico/react/Dropdown'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps } from 'react'

/**
 * Dropdown — a select-like control: a trigger button opening a floating `Menu` of options in the top
 * layer (anchored, auto-flip, outside-click/Escape/Tab-away to close). Composes the DS `Button` + `Menu`; the Dropdown
 * glue is skinned via `@fubaritico/variants` → `.ui-dropdown`.
 */
const meta = {
  title: 'Reference/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    buttonVariant: {
      control: 'inline-radio',
      options: ['outline', 'secondary', 'primary', 'ghost'],
    },
    buttonSize: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    position: { control: 'inline-radio', options: ['left', 'right'] },
    withPortal: { control: 'boolean' },
    label: { control: 'text' },
    selectedValue: { table: { disable: true } },
    onSelect: { table: { disable: true } },
    options: { table: { disable: true } },
  },
  args: {
    label: 'Sort by',
    buttonVariant: 'outline',
    buttonSize: 'md',
    position: 'left',
    // Required props — the stories supply real options/state via a wrapper.
    options: [],
    selectedValue: '',
    onSelect: () => undefined,
  },
} satisfies Meta<typeof Dropdown>

export default meta

type Story = StoryObj<typeof meta>

const BASIC_OPTIONS: DropdownOption[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'az', label: 'A → Z' },
  { value: 'za', label: 'Z → A' },
]

const RICH_OPTIONS: DropdownOption[] = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'paused', label: 'Paused', color: 'orange' },
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'archive', label: 'Archive', icon: 'Bookmark', dividerBefore: true },
  { value: 'delete', label: 'Delete', destructive: true },
]

/** Stateful wrapper so the dropdown actually selects. */
function DropdownDemo({
  options,
  ...args
}: Omit<ComponentProps<typeof Dropdown>, 'selectedValue' | 'onSelect'>) {
  const [value, setValue] = useState(options[0]?.value ?? '')
  return (
    <div style={{ width: 240 }}>
      <Dropdown
        {...args}
        options={options}
        selectedValue={value}
        onSelect={setValue}
      />
    </div>
  )
}

/** Interactive playground. */
export const Playground: Story = {
  render: ({ label, buttonVariant, buttonSize, position, withPortal }) => (
    <DropdownDemo
      label={label}
      buttonVariant={buttonVariant}
      buttonSize={buttonSize}
      position={position}
      withPortal={withPortal}
      options={BASIC_OPTIONS}
    />
  ),
}

/** Options with colour dots, an icon, a divider and a destructive item. */
export const RichOptions: Story = {
  parameters: { controls: { disable: true } },
  render: () => <DropdownDemo label="Status" options={RICH_OPTIONS} />,
}

/**
 * A Dropdown in a Card (which clips its content) inside a Modal: the menu is in the top layer, so
 * every option stays reachable, and Escape closes the menu first, the Modal on a second press.
 *
 * @returns The modal demo.
 */
function InModalDemo() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(true)
        }}
      >
        Open the modal
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
        }}
        aria-label="Dropdown in a modal"
      >
        <Card style={{ inlineSize: 320 }}>
          <Card.Body>
            <DropdownDemo label="Status" options={RICH_OPTIONS} />
          </Card.Body>
        </Card>
      </Modal>
    </>
  )
}

/** A Dropdown opened from inside a Modal, in a clipping Card. */
export const InsideAModal: Story = {
  parameters: { controls: { disable: true } },
  render: () => <InModalDemo />,
}
