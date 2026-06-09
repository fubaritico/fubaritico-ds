// Import from the per-component subpath (CSS-free), NOT the package barrel
// (`@fubaritico-ds/reference`) whose `import './styles.css'` side-effect pulls Tailwind preflight
// into the skin-based Storybook and strips the skin's box-model. See the /story skill.
import { Spinner } from '@fubaritico-ds/reference/Spinner'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * Spinner — headless loading indicator migrated to the native BEM skin (`@fubaritico-ds/styles`);
 * the size resolves to a BEM class via `@fubaritico-ds/variants`. The ring inherits `currentColor`,
 * so it adopts the surrounding text colour.
 */
const meta = {
  title: 'Reference/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    'aria-label': { control: 'text' },
  },
  args: {
    size: 'md',
    'aria-label': 'Loading',
  },
} satisfies Meta<typeof Spinner>

export default meta

type Story = StoryObj<typeof meta>

/** Interactive playground driven by the controls panel. */
export const Playground: Story = {}

/** Every size, plus the headless `currentColor` behaviour, in one view; controls disabled. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
      </div>
      {/* Headless: the ring takes the inherited text colour — set `color` to recolour it. */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <span style={{ color: 'var(--color-primary)' }}>
          <Spinner size="md" />
        </span>
        <span style={{ color: 'var(--color-destructive)' }}>
          <Spinner size="md" />
        </span>
        <span style={{ color: 'var(--color-foreground-muted)' }}>
          <Spinner size="md" />
        </span>
      </div>
    </div>
  ),
}
