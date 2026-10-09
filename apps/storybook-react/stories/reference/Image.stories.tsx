import { Image } from '@fubaritico/react/Image'

import type { Meta, StoryObj } from '@storybook/react-vite'

/** The frame has no intrinsic width — every story gets a container to fill. */
const WIDTH = '12rem'

/** A deterministic remote placeholder, so the stories work without any asset pipeline. */
const SRC = 'https://picsum.photos/seed/fubaritico/400/600'
const SRC_WIDE = 'https://picsum.photos/seed/fubaritico-wide/800/450'
const BROKEN = 'https://example.invalid/not-an-image.jpg'

const meta = {
  title: 'Reference/Image',
  component: Image,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ inlineSize: WIDTH }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    aspectRatio: {
      control: 'select',
      options: ['2/3', '16/9', '1/1', '4/3', '3/2'],
    },
    loading: { control: 'inline-radio', options: ['eager', 'lazy'] },
    autoBlur: { control: 'boolean' },
    blurSize: { control: { type: 'number', min: 4, max: 64 } },
    blurQuality: { control: { type: 'range', min: 0.1, max: 1, step: 0.1 } },
    fallback: { table: { disable: true } },
    onLoad: { table: { disable: true } },
    onError: { table: { disable: true } },
  },
  args: {
    src: SRC,
    alt: 'A randomly seeded placeholder photograph',
    aspectRatio: '2/3',
    loading: 'eager',
    autoBlur: false,
  },
} satisfies Meta<typeof Image>

export default meta
type Story = StoryObj<typeof meta>

/** Interactive playground — driven by the controls panel. */
export const Playground: Story = {}

/** Ratios, the blur placeholder, lazy loading and both failure paths. */
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  decorators: [],
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section>
        <strong>Aspect ratios</strong>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
            marginBlockStart: '0.5rem',
          }}
        >
          <div style={{ inlineSize: '8rem' }}>
            <Image src={SRC} alt="Portrait, 2/3" aspectRatio="2/3" />
          </div>
          <div style={{ inlineSize: '8rem' }}>
            <Image src={SRC} alt="Square, 1/1" aspectRatio="1/1" />
          </div>
          <div style={{ inlineSize: '14rem' }}>
            <Image src={SRC_WIDE} alt="Wide, 16/9" aspectRatio="16/9" />
          </div>
        </div>
      </section>

      <section>
        <strong>Runtime blur placeholder</strong>
        <p style={{ fontSize: '0.8125rem', marginBlock: '0.25rem 0.5rem' }}>
          Visible on a cold load; reload the frame to see it again.
        </p>
        <div style={{ inlineSize: '8rem' }}>
          <Image
            src={`${SRC}?blur`}
            alt="With a generated blur placeholder"
            autoBlur
          />
        </div>
      </section>

      <section>
        <strong>Failure — default glyph vs a custom node</strong>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBlockStart: '0.5rem',
          }}
        >
          <div style={{ inlineSize: '8rem' }}>
            <Image src={BROKEN} alt="Broken source" />
          </div>
          <div style={{ inlineSize: '8rem' }}>
            <Image
              src={BROKEN}
              alt="Broken source with a worded fallback"
              fallback={
                <span style={{ fontSize: '0.8125rem', textAlign: 'center' }}>
                  Poster unavailable
                </span>
              }
            />
          </div>
        </div>
      </section>

      <section>
        <strong>Lazy — scroll the frame into view</strong>
        <div
          style={{
            blockSize: '8rem',
            overflow: 'auto',
            marginBlockStart: '0.5rem',
            border: '1px dashed var(--color-border, #d4d4d4)',
          }}
        >
          <div style={{ blockSize: '14rem' }} />
          <div style={{ inlineSize: '8rem' }}>
            <Image src={`${SRC}?lazy`} alt="Loaded on scroll" loading="lazy" />
          </div>
        </div>
      </section>
    </div>
  ),
}
