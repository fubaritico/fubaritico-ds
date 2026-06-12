// Import from the per-component subpath (CSS-free), NOT the package barrel
// (`@fubaritico-ds/reference`) whose `import './styles.css'` side-effect pulls Tailwind preflight
// into the skin-based Storybook and strips the skin's box-model. See the /story skill.
import { Button } from '@fubaritico-ds/reference/Button'
import { Card } from '@fubaritico-ds/reference/Card'
import { Typography } from '@fubaritico-ds/reference/Typography'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * Card — a presentational surface container migrated onto the native BEM skin (`@fubaritico-ds/styles`);
 * the surface variant resolves to a BEM class via `@fubaritico-ds/variants`. It owns only the chrome;
 * spacing lives in the `Card.Header` / `Card.Body` / `Card.Footer` slots (which throw outside `<Card>`).
 */
const meta = {
  title: 'Reference/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'outline', 'elevated', 'ghost'],
    },
  },
  args: {
    variant: 'default',
  },
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

/** A demo cover image (data-URI gradient) used to show edge-to-edge media clipping. */
const COVER_SRC =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="%23a3a3a3"/><stop offset="1" stop-color="%23404040"/>' +
      '</linearGradient></defs><rect width="320" height="160" fill="url(%23g)"/></svg>'
  )

/** Interactive playground driven by the controls panel. */
export const Playground: Story = {
  render: (args) => (
    <Card {...args} style={{ inlineSize: '280px' }}>
      <Card.Header>
        <Typography variant="h6">Card title</Typography>
      </Card.Header>
      <Card.Body>
        <Typography variant="body2">
          Wrap content in Card.Body to get padding — the root surface has none.
        </Typography>
      </Card.Body>
      <Card.Footer>
        <Button variant="primary" size="sm">
          Action
        </Button>
      </Card.Footer>
    </Card>
  ),
}

/** Every surface variant, a slotted card, and an edge-to-edge cover image, in one view. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        alignItems: 'flex-start',
      }}
    >
      {/* Surface variants */}
      {(['default', 'outline', 'elevated', 'ghost'] as const).map((variant) => (
        <Card key={variant} variant={variant} style={{ inlineSize: '200px' }}>
          <Card.Body>
            <Typography variant="label">{variant}</Typography>
            <Typography variant="caption">Surface variant.</Typography>
          </Card.Body>
        </Card>
      ))}

      {/* Full slotting: header + body + footer (no separators — spacing alone groups the regions) */}
      <Card variant="outline" style={{ inlineSize: '240px' }}>
        <Card.Header>
          <Typography variant="h6">Header</Typography>
        </Card.Header>
        <Card.Body>
          <Typography variant="body2">
            Body region (grows to push the footer down).
          </Typography>
        </Card.Body>
        <Card.Footer>
          <Button variant="secondary" size="sm">
            Cancel
          </Button>
          <Button variant="primary" size="sm">
            Confirm
          </Button>
        </Card.Footer>
      </Card>

      {/* Edge-to-edge media clipped to the radius */}
      <Card variant="elevated" style={{ inlineSize: '240px' }}>
        <img
          src={COVER_SRC}
          alt=""
          style={{ inlineSize: '100%', display: 'block' }}
        />
        <Card.Body>
          <Typography variant="h6">Cover image</Typography>
          <Typography variant="caption">
            A direct child sits edge-to-edge and is clipped.
          </Typography>
        </Card.Body>
      </Card>
    </div>
  ),
}
