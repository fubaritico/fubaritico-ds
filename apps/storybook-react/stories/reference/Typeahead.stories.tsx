import { useMemo, useState } from 'react'

import { Typeahead } from '@fubaritico/react/Typeahead'

import type { Meta, StoryObj } from '@storybook/react-vite'

const WIDTH = '20rem'

/** A fixed catalogue, filtered locally — the component never fetches anything itself. */
const FRUITS = [
  'Apple',
  'Apricot',
  'Avocado',
  'Banana',
  'Blackberry',
  'Blueberry',
  'Cherry',
  'Clementine',
  'Cranberry',
  'Grape',
  'Grapefruit',
  'Lemon',
  'Lime',
  'Mango',
  'Orange',
  'Peach',
  'Pear',
  'Pineapple',
  'Raspberry',
  'Strawberry',
]

/** Fruits that are "out of stock" — listed, but not selectable. */
const UNAVAILABLE = new Set(['Clementine', 'Lime'])

interface DemoProps {
  /** Colour scheme of the dropdown. */
  variant?: 'light' | 'dark'
  /** Render the dropdown outside the subtree. */
  portal?: boolean
  /** Clear the field after a selection. */
  clearOnSelect?: boolean
  /** Minimum query length before searching. */
  minChars?: number
}

/** A self-contained Typeahead wired to a local filter, so every story is interactive. */
function FruitSearch({
  variant = 'light',
  portal = false,
  clearOnSelect = true,
  minChars = 2,
}: Readonly<DemoProps>) {
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<string>('—')

  const results = useMemo(() => {
    if (!query) return []

    return FRUITS.filter((fruit) =>
      fruit.toLowerCase().includes(query.toLowerCase())
    )
  }, [query])

  return (
    <div style={{ inlineSize: WIDTH }}>
      <Typeahead
        variant={variant}
        portal={portal}
        clearOnSelect={clearOnSelect}
        minChars={minChars}
        onSearch={setQuery}
        onSelect={setPicked}
      >
        <Typeahead.Input
          placeholder="Search fruits…"
          aria-label="Search fruits"
        />
        <Typeahead.Menu>
          {results.length > 0 ? (
            results.map((fruit, index) => (
              <Typeahead.Item
                key={fruit}
                value={fruit}
                index={index}
                disabled={UNAVAILABLE.has(fruit)}
              >
                <Typeahead.Highlight>{fruit}</Typeahead.Highlight>
              </Typeahead.Item>
            ))
          ) : (
            <Typeahead.Empty>No fruit matches that</Typeahead.Empty>
          )}
        </Typeahead.Menu>
      </Typeahead>

      <p style={{ marginBlockStart: '0.75rem', fontSize: '0.875rem' }}>
        Selected: <strong>{picked}</strong>
      </p>
    </div>
  )
}

const meta = {
  title: 'Reference/Typeahead',
  component: Typeahead,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['light', 'dark'] },
    minChars: { control: { type: 'number', min: 1, max: 5 } },
    debounceMs: { control: 'number' },
    clearOnSelect: { control: 'boolean' },
    portal: { control: 'boolean' },
    onSearch: { table: { disable: true } },
    onSelect: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  args: {
    variant: 'light',
    minChars: 2,
    clearOnSelect: true,
    portal: false,
    children: null,
  },
} satisfies Meta<typeof Typeahead>

export default meta
type Story = StoryObj<typeof meta>

/** Type at least two characters, then drive the list with the arrow keys. */
export const Playground: Story = {
  render: (args) => (
    <FruitSearch
      variant={args.variant}
      portal={args.portal}
      clearOnSelect={args.clearOnSelect}
      minChars={args.minChars}
    />
  ),
}

/** Both colour schemes, the two selection behaviours, and the clipping-ancestor case. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <section>
        <strong>Default — try “ap”, then the arrow keys</strong>
        <p style={{ fontSize: '0.8125rem', marginBlock: '0.25rem 0.75rem' }}>
          “Clementine” and “Lime” are disabled: listed, skipped by the keyboard.
        </p>
        <FruitSearch />
      </section>

      <section>
        <strong>Keeps the picked label in the field</strong>
        <FruitSearch clearOnSelect={false} />
      </section>

      <section
        style={{
          padding: '1rem',
          background: 'var(--color-primitive-neutral-950, #0a0a0a)',
        }}
      >
        <strong style={{ color: '#fff' }}>Dark dropdown</strong>
        <FruitSearch variant="dark" />
      </section>

      <section>
        <strong>Inside a clipping ancestor — portal escapes it</strong>
        <div
          style={{
            overflow: 'hidden',
            blockSize: '7rem',
            padding: '0.75rem',
            border: '1px dashed var(--color-border, #d4d4d4)',
          }}
        >
          <FruitSearch portal />
        </div>
      </section>
    </div>
  ),
}
