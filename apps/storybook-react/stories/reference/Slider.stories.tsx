import { useState } from 'react'

import { Slider } from '@fubaritico-ds/reference/Slider'
import { Typography } from '@fubaritico-ds/reference/Typography'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties } from 'react'

const WIDTH = '20rem'

/** The hue ramp a colour picker's first slider needs — the whole wheel, in one gradient. */
const HUE_RAMP =
  'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'

/** An alpha ramp over a checkerboard, so transparency reads as transparency. */
const CHECKERBOARD =
  'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'

const meta = {
  title: 'Reference/Slider',
  component: Slider,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ inlineSize: WIDTH }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
    value: { table: { disable: true } },
    defaultValue: { table: { disable: true } },
    onChange: { table: { disable: true } },
    onChangeComplete: { table: { disable: true } },
    formatValue: { table: { disable: true } },
    trackImage: { table: { disable: true } },
  },
  args: {
    defaultValue: 40,
    min: 0,
    max: 100,
    step: 1,
    size: 'md',
    disabled: false,
    'aria-label': 'Volume',
  },
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

/** Drag it, then focus it and use the arrow keys, Home, End, Page Up and Page Down. */
export const Playground: Story = {}

/** Shows how rarely `onChange` and `onChangeComplete` should be treated as the same thing. */
function CommitDemo() {
  const [live, setLive] = useState(40)
  const [committed, setCommitted] = useState(40)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Slider
        value={live}
        onChange={setLive}
        onChangeComplete={setCommitted}
        aria-label="Quality"
      />
      <Typography variant="body2">
        live {live} · committed {committed}
      </Typography>
    </div>
  )
}

/** A labelled row, so each example says what it is. */
function Row({
  label,
  children,
}: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <Typography variant="body2">{label}</Typography>
      {children}
    </div>
  )
}

/**
 * Sizes, states, the commit hook, the colour-picker tracks, and three re-skins that change
 * nothing but custom properties.
 */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  decorators: [],
  render: () => (
    <div
      style={{
        inlineSize: '26rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <strong>Sizes</strong>
        <Row label="sm">
          <Slider defaultValue={30} size="sm" aria-label="Small" />
        </Row>
        <Row label="md — the default">
          <Slider defaultValue={50} size="md" aria-label="Medium" />
        </Row>
        <Row label="lg">
          <Slider defaultValue={70} size="lg" aria-label="Large" />
        </Row>
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <strong>States and ranges</strong>
        <Row label="Disabled">
          <Slider defaultValue={40} disabled aria-label="Disabled" />
        </Row>
        <Row label="Stepped — 0 to 10 by 1">
          <Slider
            defaultValue={6}
            min={0}
            max={10}
            step={1}
            aria-label="Rating"
          />
        </Row>
        <Row label="Continuous vs committed">
          <CommitDemo />
        </Row>
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <strong>Tracks a colour picker needs</strong>
        <Typography variant="body2">
          Same component. A background on the track, the filled range steps
          aside, and the announced value is a sentence rather than a number.
        </Typography>
        <Row label="Hue">
          <Slider
            defaultValue={210}
            min={0}
            max={360}
            trackImage={HUE_RAMP}
            formatValue={(v) => `hue ${String(v)} degrees`}
            aria-label="Hue"
          />
        </Row>
        <Row label="Alpha">
          <Slider
            defaultValue={60}
            trackImage={`linear-gradient(to right, transparent, #171717), ${CHECKERBOARD}`}
            formatValue={(v) => `${String(v)} percent opaque`}
            aria-label="Opacity"
            style={
              {
                '--ui-slider-track-thickness': '0.75rem',
                backgroundSize: '8px 8px',
              } as CSSProperties
            }
          />
        </Row>
        <Row label="Red channel">
          <Slider
            defaultValue={235}
            min={0}
            max={255}
            trackImage="linear-gradient(to right, #000, #f00)"
            formatValue={(v) => `red ${String(v)} of 255`}
            aria-label="Red"
          />
        </Row>
      </section>

      <section
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <strong>Re-skinning — nothing but custom properties</strong>
        <Row label="Square and chunky">
          <Slider
            defaultValue={45}
            aria-label="Square"
            style={
              {
                '--ui-slider-track-thickness': '1.25rem',
                '--ui-slider-track-radius': '0',
                '--ui-slider-thumb-radius': '0',
                '--ui-slider-thumb-size': '1.75rem',
                '--ui-slider-thumb-border-width': '3px',
              } as CSSProperties
            }
          />
        </Row>
        <Row label="Hairline">
          <Slider
            defaultValue={45}
            aria-label="Hairline"
            style={
              {
                '--ui-slider-track-thickness': '1px',
                '--ui-slider-thumb-size': '0.625rem',
                '--ui-slider-thumb-border-width': '1px',
                '--ui-slider-thumb-shadow': 'none',
              } as CSSProperties
            }
          />
        </Row>
        <Row label="Inverted — dark track, filled thumb">
          <Slider
            defaultValue={45}
            aria-label="Inverted"
            style={
              {
                '--ui-slider-track-color': '#171717',
                '--ui-slider-range-color': '#fafafa',
                '--ui-slider-thumb-color': '#171717',
                '--ui-slider-thumb-border-color': '#fafafa',
              } as CSSProperties
            }
          />
        </Row>
      </section>

      <section
        dir="rtl"
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <strong>Right-to-left — the track fills from the right</strong>
        <Slider defaultValue={30} aria-label="RTL" />
      </section>
    </div>
  ),
}
