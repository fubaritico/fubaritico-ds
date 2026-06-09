// Plain (CSS-free, router-free) subpath import — no Tailwind, no router in Storybook.
import { Typography } from '@fubaritico-ds/reference/Typography'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * Typography — neutral, semantic, headless text primitive (modeled on MUI). Sets type structure
 * only (size/weight/line-height/family via the skin + semantic `--typography-*` tokens); never
 * `color` (inherited from the parent). Headings are fluid (clamp); body/roles are fixed.
 */
const meta = {
  title: 'Reference/Typography',
  component: Typography,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'body',
        'caption',
        'overline',
        'label',
        'inherit',
      ],
    },
    align: {
      control: 'inline-radio',
      options: ['inherit', 'left', 'center', 'right', 'justify'],
    },
    gutterBottom: { control: 'boolean' },
    noWrap: { control: 'boolean' },
    children: { control: 'text' },
    as: { table: { disable: true } },
    variantMapping: { table: { disable: true } },
  },
  args: {
    variant: 'body',
    children: 'The quick brown fox jumps over the lazy dog.',
  },
} satisfies Meta<typeof Typography>

export default meta

type Story = StoryObj<typeof meta>

/** Interactive playground driven by the controls panel. */
export const Playground: Story = {}

/** Every variant in one view; colour is inherited (set here on the wrapper). */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '42rem',
        color: 'var(--color-foreground)',
      }}
    >
      <Typography variant="h1">Heading 1</Typography>
      <Typography variant="h2">Heading 2</Typography>
      <Typography variant="h3">Heading 3</Typography>
      <Typography variant="h4">Heading 4</Typography>
      <Typography variant="h5">Heading 5</Typography>
      <Typography variant="h6">Heading 6</Typography>
      <Typography variant="body">
        Body — the quick brown fox jumps over the lazy dog.
      </Typography>
      <Typography variant="label">Label</Typography>
      <Typography variant="caption">Caption</Typography>
      <Typography variant="overline">Overline</Typography>
    </div>
  ),
}
