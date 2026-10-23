import { useState } from 'react'

import {
  TOASTER_DEFAULTS,
  TOAST_POSITIONS,
  createToaster,
} from '@fubaritico/behaviors'
import { Alert } from '@fubaritico/react/Alert'
import { Button } from '@fubaritico/react/Button'
import { Modal } from '@fubaritico/react/Modal'
import { Toaster, createToastApi } from '@fubaritico/react/Toast'
import { Typography } from '@fubaritico/react/Typography'

import type {
  ReactToastContent,
  ToastApi,
  ToasterPosition,
  ToasterProps,
} from '@fubaritico/react/Toast'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'

/** How long the « Saving… » toast waits before it becomes « Saved », in ms. */
const SAVE_DELAY_MS = 1500

/** One more toast than the stack shows: the oldest is evicted. */
const OVERFLOW_COUNT = TOASTER_DEFAULTS.max + 1

/** A button of the demo: its label, and what it sends to the stack. */
interface Trigger {
  /** The button's text. */
  label: string
  /** Shows the toast(s). */
  run: (toast: ToastApi) => void
}

/** Every kind of toast, one button each. */
const TRIGGERS: readonly Trigger[] = [
  { label: 'Neutral', run: (toast) => toast('Draft kept') },
  { label: 'Info', run: (toast) => toast.info('A new version is available') },
  {
    label: 'Success',
    run: (toast) => toast.success('Your changes were saved'),
  },
  {
    label: 'Warning',
    run: (toast) => toast.warning('Your storage is nearly full'),
  },
  {
    label: 'Error + description',
    run: (toast) =>
      toast.error('Upload failed', {
        description: 'The file exceeds the 25 MB limit.',
      }),
  },
  { label: 'One line', run: (toast) => toast.info('Saved to your list') },
  {
    label: 'Three lines',
    run: (toast) =>
      toast.warning('Your storage is nearly full', {
        description:
          'You have used 9.6 GB of your 10 GB. Older drafts will be removed next week unless you free some space or upgrade your plan.',
      }),
  },
  {
    label: 'Urgent (stays)',
    run: (toast) => toast.error('You are offline', { urgent: true }),
  },
  {
    label: 'Replace in place',
    run: (toast) => {
      toast('Saving…', { id: 'save', duration: Infinity })
      setTimeout(() => {
        toast.success('Saved', { id: 'save' })
      }, SAVE_DELAY_MS)
    },
  },
  {
    label: 'Custom Alert',
    run: (toast) =>
      toast.custom(
        <Alert variant="success" title="Invoice sent">
          It reaches Acme within the hour.
        </Alert>,
        { bare: true, label: 'Invoice sent' }
      ),
  },
  {
    label: `${String(OVERFLOW_COUNT)} at once (the oldest goes)`,
    run: (toast) => {
      for (let n = 1; n <= OVERFLOW_COUNT; n++) toast(`Toast ${String(n)}`)
    },
  },
]

/**
 * A toaster of the story's own and the toast API bound to it — the Doc page renders several stories
 * at once, and the page's shared stack would show every toast once per Toaster.
 *
 * @param uid - The toaster's namespace, one per story.
 * @returns The toaster and its API, stable for the story's life.
 */
function useStoryToaster(uid: string) {
  // One toaster for the story's life.
  const [toaster] = useState(() => createToaster<ReactToastContent>({ uid }))
  // Its API, built once.
  const [toast] = useState(() => createToastApi(() => toaster))
  return { toaster, toast }
}

/**
 * A row of buttons.
 *
 * @param props - The row's content.
 * @param props.children - The buttons.
 * @returns The row.
 */
function Row({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {children}
    </div>
  )
}

/**
 * The buttons that show each kind of toast, and the one that dismisses them all.
 *
 * @param props - The toast API.
 * @param props.toast - Where the buttons send their toasts.
 * @returns The row of buttons.
 */
function Triggers({ toast }: Readonly<{ toast: ToastApi }>) {
  return (
    <Row>
      {TRIGGERS.map(({ label, run }) => (
        <Button
          key={label}
          variant="outline"
          onClick={() => {
            run(toast)
          }}
        >
          {label}
        </Button>
      ))}
      <Button
        variant="ghost"
        onClick={() => {
          toast.dismissAll()
        }}
      >
        Dismiss all
      </Button>
    </Row>
  )
}

const meta = {
  title: 'Reference/Toast',
  component: Toaster,
  tags: ['autodocs'],
  argTypes: {
    position: { control: 'select', options: TOAST_POSITIONS },
    max: { control: { type: 'number', min: 1, max: 10 } },
    duration: { control: { type: 'number', min: 1000, step: 1000 } },
    label: { control: 'text' },
    closeLabel: { control: 'text' },
    hotkey: { control: 'text' },
    toaster: { table: { disable: true } },
  },
  args: {
    position: TOASTER_DEFAULTS.position,
    max: TOASTER_DEFAULTS.max,
    duration: TOASTER_DEFAULTS.duration,
    label: TOASTER_DEFAULTS.label,
    closeLabel: TOASTER_DEFAULTS.closeLabel,
    hotkey: TOASTER_DEFAULTS.hotkey,
  },
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The Toaster driven by the controls, and buttons to show each kind of toast.
 *
 * @param args - The Toaster props from the controls.
 * @returns The playground.
 */
function PlaygroundDemo(args: Readonly<ToasterProps>) {
  const { toaster, toast } = useStoryToaster('playground')
  return (
    <>
      <Triggers toast={toast} />
      <Toaster {...args} toaster={toaster} />
    </>
  )
}

// Interactive playground — the controls drive the stack; the buttons show toasts.
export const Playground: Story = {
  render: (args) => <PlaygroundDemo {...args} />,
}

/** Props of the showcase sections. */
interface SectionProps {
  /** The showcase's toast API. */
  toast: ToastApi
}

/**
 * The six positions, one button each — the stack moves, and a toast shows where.
 *
 * @param props - {@link SectionProps} and the position state.
 * @param props.toast - The showcase's toast API.
 * @param props.position - Where the stack sits.
 * @param props.onPosition - Moves it.
 * @returns The section.
 */
function PositionSection({
  toast,
  position,
  onPosition,
}: Readonly<
  SectionProps & {
    position: ToasterPosition
    onPosition: (position: ToasterPosition) => void
  }
>) {
  return (
    <section>
      <Typography variant="h6">Position</Typography>
      <Row>
        {TOAST_POSITIONS.map((value) => (
          <Button
            key={value}
            variant={value === position ? 'primary' : 'outline'}
            onClick={() => {
              onPosition(value)
              toast(value)
            }}
          >
            {value}
          </Button>
        ))}
      </Row>
    </section>
  )
}

/**
 * A Modal that shows toasts: above it while it is open, and still read as it closes.
 *
 * @param props - {@link SectionProps}.
 * @param props.toast - The showcase's toast API.
 * @returns The section and its Modal.
 */
function ModalSection({ toast }: Readonly<SectionProps>) {
  // Whether the demo Modal is open.
  const [open, setOpen] = useState(false)
  return (
    <section>
      <Typography variant="h6">Above a Modal</Typography>
      <Typography variant="body2">
        The stack renders inside the open dialog: the toast stays closable, and
        Escape on it closes the toast, not the Modal. Press F8 to reach it.
      </Typography>
      <Button
        onClick={() => {
          setOpen(true)
        }}
      >
        Open a Modal
      </Button>
      <Modal
        isOpen={open}
        onClose={() => {
          setOpen(false)
        }}
        aria-label="Edit the invoice"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            padding: '1.5rem',
            background: 'var(--color-surface)',
          }}
        >
          <Typography variant="h6">Edit the invoice</Typography>
          <Row>
            <Button
              variant="outline"
              onClick={() => toast.info('Shown above the Modal')}
            >
              Toast from the Modal
            </Button>
            <Button
              onClick={() => {
                toast.success('Invoice saved')
                setOpen(false)
              }}
            >
              Save and close
            </Button>
          </Row>
        </div>
      </Modal>
    </section>
  )
}

/**
 * Every case at once: the kinds, the six positions, and toasts shown from inside a Modal.
 *
 * @returns The showcase.
 */
function ShowcaseDemo() {
  const { toaster, toast } = useStoryToaster('showcase')
  // Where the stack sits — switched by the position buttons.
  const [position, setPosition] = useState<ToasterPosition>(
    TOASTER_DEFAULTS.position
  )
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxInlineSize: '40rem',
      }}
    >
      <section>
        <Typography variant="h6">Kinds</Typography>
        <Triggers toast={toast} />
      </section>
      <PositionSection
        toast={toast}
        position={position}
        onPosition={setPosition}
      />
      <ModalSection toast={toast} />
      <Toaster toaster={toaster} position={position} />
    </div>
  )
}

// Showcase — every case in one render; the buttons replace the controls.
export const Showcase: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ShowcaseDemo />,
}
